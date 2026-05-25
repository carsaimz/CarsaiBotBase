package com.cbrowser

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.net.http.SslError
import android.os.Message
import android.webkit.*

@SuppressLint("SetJavaScriptEnabled", "ViewConstructor")
class PrivacyWebView(
    context: Context,
    private val listener: Listener,
    private val settings: Settings = Settings(context)
) : WebView(context) {

    interface Listener {
        fun onPageStarted(url: String)
        fun onPageFinished(url: String)
        fun onTitleChanged(title: String)
        fun onProgressChanged(progress: Int)
        fun onTrackerBlocked()
        fun onDownload(url: String, ua: String, cd: String, mime: String)
        fun onCreateNewTab(url: String)
        fun onSslError(url: String)
    }

    init {
        applySettings()

        val cm = CookieManager.getInstance()
        cm.setAcceptCookie(true)
        cm.setAcceptThirdPartyCookies(this, !settings.thirdPartyCookiesBlocked)
        cm.removeAllCookies(null)
        cm.flush()
        clearFormData()

        webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, req: WebResourceRequest): WebResourceResponse? {
                val url = req.url
                if (settings.blockImages && req.resourceType() == "image") return emptyResponse()
                if (settings.blockFonts) {
                    val path = url.path?.lowercase() ?: ""
                    if (path.endsWith(".woff") || path.endsWith(".woff2") ||
                        path.endsWith(".ttf")  || path.endsWith(".eot") ||
                        url.host?.contains("fonts.googleapis.com") == true ||
                        url.host?.contains("fonts.gstatic.com") == true) return emptyResponse()
                }
                if (settings.trackerBlockingEnabled && TrackerBlocker.isBlocked(url)) {
                    listener.onTrackerBlocked()
                    return emptyResponse()
                }
                return null
            }

            override fun shouldOverrideUrlLoading(view: WebView, req: WebResourceRequest): Boolean {
                val scheme = req.url.scheme ?: return false
                if (scheme == "http" || scheme == "https") return false
                return try { context.startActivity(Intent(Intent.ACTION_VIEW, req.url)); true }
                catch (_: Exception) { false }
            }

            override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                listener.onPageStarted(url)
            }

            override fun onPageFinished(view: WebView, url: String) {
                if (settings.fingerprintProtection) injectFingerprintProtection()
                listener.onPageFinished(url)
            }

            override fun onReceivedSslError(view: WebView, handler: SslErrorHandler, error: SslError) {
                handler.cancel()
                listener.onSslError(error.url ?: "")
            }
        }

        webChromeClient = object : WebChromeClient() {
            override fun onReceivedTitle(view: WebView, title: String) { listener.onTitleChanged(title) }
            override fun onProgressChanged(view: WebView, newProgress: Int) { listener.onProgressChanged(newProgress) }
            override fun onCreateWindow(view: WebView, isDialog: Boolean, isUserGesture: Boolean, resultMsg: Message): Boolean {
                val transport = resultMsg.obj as? WebView.WebViewTransport ?: return false
                val tempWv = WebView(context).apply {
                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(v: WebView, req: WebResourceRequest): Boolean {
                            listener.onCreateNewTab(req.url.toString()); v.destroy(); return true
                        }
                        override fun onPageStarted(v: WebView, url: String, f: Bitmap?) {
                            if (url != "about:blank") { listener.onCreateNewTab(url); v.stopLoading(); v.destroy() }
                        }
                    }
                }
                transport.webView = tempWv; resultMsg.sendToTarget(); return true
            }
        }

        setDownloadListener { url, ua, cd, mime, _ -> listener.onDownload(url, ua, cd, mime) }
        isLongClickable = true
        setOnLongClickListener { showLongPressMenu(); true }
    }

    @SuppressLint("SetJavaScriptEnabled")
    fun applySettings() {
        val prefs = settings          // our Settings object
        val ws    = getSettings()     // WebView.getSettings()
        ws.javaScriptEnabled                     = prefs.javascriptEnabled
        ws.domStorageEnabled                     = true
        ws.databaseEnabled                       = false
        @Suppress("DEPRECATION") ws.saveFormData  = false
        @Suppress("DEPRECATION") ws.savePassword = false
        ws.cacheMode                             = WebSettings.LOAD_DEFAULT
        ws.mixedContentMode                      = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        ws.allowFileAccess                       = false
        ws.allowContentAccess                    = false
        ws.loadsImagesAutomatically              = !prefs.blockImages
        ws.mediaPlaybackRequiresUserGesture      = true
        ws.setSupportZoom(true)
        ws.builtInZoomControls                   = true
        ws.displayZoomControls                   = false
        ws.javaScriptCanOpenWindowsAutomatically = true
        ws.setSupportMultipleWindows(true)
        ws.userAgentString = if (prefs.desktopMode) {
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        } else {
            "Mozilla/5.0 (Android; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36"
        }
    }

    private fun injectFingerprintProtection() {
        evaluateJavascript("""
            (function(){
                try { var o=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(t){var c=this.getContext('2d');if(c){var d=c.getImageData(0,0,1,1);d.data[0]^=1;c.putImageData(d,0,0);}return o.apply(this,arguments);};} catch(e){}
                try { Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2}); } catch(e){}
                try { Object.defineProperty(navigator,'deviceMemory',{get:()=>2}); } catch(e){}
                try { navigator.getBattery=undefined; } catch(e){}
            })();
        """.trimIndent(), null)
    }

    private fun showLongPressMenu() {
        val result = hitTestResult
        val url    = result.extra
        data class Item(val label: String, val action: () -> Unit)
        val items  = mutableListOf<Item>()
        when (result.type) {
            HitTestResult.SRC_ANCHOR_TYPE,
            HitTestResult.SRC_IMAGE_ANCHOR_TYPE -> if (url != null) {
                items += Item("Open in new tab")  { listener.onCreateNewTab(url) }
                items += Item("Copy link")        { copy("Link", url) }
                items += Item("Share link")       { share(url) }
                items += Item("Download")         { listener.onDownload(url, "", "", "*/*") }
            }
            HitTestResult.IMAGE_TYPE -> if (url != null) {
                items += Item("Open image")       { listener.onCreateNewTab(url) }
                items += Item("Copy image URL")   { copy("Image URL", url) }
                items += Item("Download image")   { listener.onDownload(url, "", "", "image/*") }
            }
            else -> {
                evaluateJavascript("window.getSelection().toString()") { sel ->
                    val text = sel?.trim('"').orEmpty()
                    if (text.isNotEmpty()) {
                        post { showMenuItems(listOf(
                            Item("Copy")   { copy("Text", text) },
                            Item("Search") { listener.onCreateNewTab("https://duckduckgo.com/?q=${Uri.encode(text)}") },
                            Item("Share")  { share(text) }
                        ))}
                    }
                }
                return
            }
        }
        if (items.isNotEmpty()) showMenuItems(items)
    }

    private fun showMenuItems(items: List<Any>) {
        data class Item(val label: String, val action: () -> Unit)
        @Suppress("UNCHECKED_CAST")
        val cast = items.filterIsInstance<Item>()
        android.app.AlertDialog.Builder(context)
            .setItems(cast.map { it.label }.toTypedArray()) { _, i -> cast[i].action() }
            .show()
    }

    private fun copy(label: String, text: String) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
        cm.setPrimaryClip(android.content.ClipData.newPlainText(label, text))
        android.widget.Toast.makeText(context, "Copied", android.widget.Toast.LENGTH_SHORT).show()
    }

    private fun share(text: String) {
        context.startActivity(Intent.createChooser(
            Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, text) },
            "Share"
        ))
    }

    private fun emptyResponse() =
        WebResourceResponse("text/plain", "utf-8", java.io.ByteArrayInputStream(ByteArray(0)))

    private fun WebResourceRequest.resourceType(): String {
        val path = url.path?.lowercase() ?: ""
        return when {
            path.endsWith(".jpg") || path.endsWith(".jpeg") ||
            path.endsWith(".png") || path.endsWith(".webp") ||
            path.endsWith(".gif") || path.endsWith(".svg")  -> "image"
            else -> "other"
        }
    }

    fun clearAll() {
        clearCache(true); clearHistory(); clearFormData()
        CookieManager.getInstance().apply { removeAllCookies(null); flush() }
        WebStorage.getInstance().deleteAllData()
    }

    fun cleanReload() {
        val url = url?.takeIf { it.isNotEmpty() && it != "about:blank" } ?: return
        clearAll()
        loadUrl(url, mapOf("Cache-Control" to "no-cache, no-store"))
    }

    fun loadUrlWithHeaders(url: String) {
        val headers = mutableMapOf<String, String>()
        if (settings.saveDataMode) headers["Save-Data"] = "on"
        if (headers.isEmpty()) loadUrl(url) else loadUrl(url, headers)
    }
}
