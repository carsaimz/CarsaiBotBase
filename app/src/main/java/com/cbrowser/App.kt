package com.cbrowser

import android.app.Application
import android.webkit.CookieManager
import android.webkit.WebStorage
import android.webkit.WebView

class App : Application() {
    override fun onCreate() {
        super.onCreate()
        wipeWebData()
        TrackerBlocker.init(this)
    }

    fun wipeWebData() {
        CookieManager.getInstance().apply { removeAllCookies(null); flush() }
        WebStorage.getInstance().deleteAllData()
        try {
            WebView(this).apply { clearCache(true); clearHistory(); clearFormData(); destroy() }
        } catch (_: Exception) {}
        cacheDir.resolve("WebView").deleteRecursively()
        filesDir.parentFile?.resolve("databases")?.deleteRecursively()
        filesDir.parentFile?.resolve("app_webview")?.deleteRecursively()
    }
}
