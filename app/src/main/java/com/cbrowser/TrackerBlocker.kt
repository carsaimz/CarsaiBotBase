package com.cbrowser

import android.content.Context
import android.net.Uri
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.io.File

object TrackerBlocker {
    private val rules = mutableListOf<String>()
    private val http  = OkHttpClient()
    private const val CACHE = "blocklist.json"
    private const val URL   = "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.json"

    fun init(ctx: Context) {
        val cache = File(ctx.cacheDir, CACHE)
        val seed  = ctx.assets.open("blocklist_seed.json").bufferedReader().readText()
        val json  = if (cache.exists()) cache.readText() else seed
        parseInto(json)
    }

    fun isBlocked(uri: Uri): Boolean {
        val host = uri.host ?: return false
        return rules.any { host == it || host.endsWith(".$it") }
    }

    suspend fun updateAsync(ctx: Context) = withContext(Dispatchers.IO) {
        try {
            val body = http.newCall(Request.Builder().url(URL).build())
                .execute().use { it.body?.string() } ?: return@withContext
            File(ctx.cacheDir, CACHE).writeText(body)
            parseInto(body)
        } catch (e: Exception) {
            Log.w("TrackerBlocker", e.message ?: "update failed")
        }
    }

    private fun parseInto(json: String) {
        rules.clear()
        try {
            val arr = JSONArray(json)
            for (i in 0 until arr.length()) {
                val o = arr.optJSONObject(i) ?: continue
                rules.add(o.optString("pattern"))
            }
        } catch (_: Exception) {}
    }
}
