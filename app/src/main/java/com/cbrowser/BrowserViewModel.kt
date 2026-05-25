package com.cbrowser

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.webkit.CookieManager
import android.webkit.URLUtil
import android.webkit.WebStorage
import androidx.lifecycle.ViewModel

data class Tab(
    val id: Int,
    var url: String = "",
    var title: String = "",
    var trackersBlocked: Int = 0,
    var webView: PrivacyWebView? = null
)

class BrowserViewModel : ViewModel() {

    val tabs = mutableListOf(Tab(id = 0))
    var activeTabIndex = 0
    val activeTab get() = tabs[activeTabIndex]

    enum class Engine(val displayName: String, val shortName: String, val url: String) {
        GOOGLE("Google",      "Google", "https://www.google.com/search?q="),
        DUCKDUCKGO("DuckDuckGo", "DDG", "https://duckduckgo.com/?q="),
        BING("Bing",          "Bing",   "https://www.bing.com/search?q="),
        BRAVE("Brave",        "Brave",  "https://search.brave.com/search?q="),
        STARTPAGE("Startpage","Start",  "https://www.startpage.com/search?q="),
        ECOSIA("Ecosia",      "Ecosia", "https://www.ecosia.org/search?q=")
    }

    var selectedEngine = Engine.GOOGLE

    fun newTab(): Tab {
        val tab = Tab(id = tabs.size)
        tabs.add(tab); activeTabIndex = tabs.lastIndex; return tab
    }

    fun closeTab(index: Int) {
        tabs[index].webView?.clearAll()
        tabs[index].webView?.destroy()
        tabs[index].webView = null
        tabs.removeAt(index)
        if (tabs.isEmpty()) tabs.add(Tab(id = 0))
        activeTabIndex = activeTabIndex.coerceIn(0, tabs.lastIndex)
    }

    fun selectTab(index: Int) { activeTabIndex = index }

    fun normalizeUrl(input: String): String {
        val t = input.trim()
        return when {
            t.startsWith("http://") || t.startsWith("https://") -> t
            t.contains(" ") || !t.contains(".") ->
                "${selectedEngine.url}${Uri.encode(t)}"
            else -> "https://$t"
        }
    }

    fun wipeAll() {
        tabs.forEach { it.webView?.clearAll(); it.webView?.destroy(); it.webView = null }
        CookieManager.getInstance().apply { removeAllCookies(null); flush() }
        WebStorage.getInstance().deleteAllData()
        tabs.clear(); tabs.add(Tab(id = 0)); activeTabIndex = 0
    }

    fun download(ctx: Context, url: String, ua: String, cd: String, mime: String) {
        val fn = URLUtil.guessFileName(url, cd, mime)
        val req = DownloadManager.Request(Uri.parse(url)).apply {
            setMimeType(mime); addRequestHeader("User-Agent", ua)
            setTitle(fn); setDescription("Downloading…")
            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fn)
        }
        (ctx.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(req)
    }

    override fun onCleared() { wipeAll(); super.onCleared() }
}
