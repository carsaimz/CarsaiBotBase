package com.cbrowser

import android.content.Context
import android.content.SharedPreferences

class Settings(context: Context) {
    private val p: SharedPreferences =
        context.applicationContext.getSharedPreferences("cbrowser_prefs", Context.MODE_PRIVATE)

    // Theme: 0=System 1=Light 2=Dark
    var theme: Int                        get() = p.getInt("theme", 0);                  set(v) { p.edit().putInt("theme", v).apply() }
    var trackerBlockingEnabled: Boolean   get() = p.getBoolean("trackers", true);        set(v) { p.edit().putBoolean("trackers", v).apply() }
    var thirdPartyCookiesBlocked: Boolean get() = p.getBoolean("3p_cookies", true);      set(v) { p.edit().putBoolean("3p_cookies", v).apply() }
    var javascriptEnabled: Boolean        get() = p.getBoolean("js", true);              set(v) { p.edit().putBoolean("js", v).apply() }
    var wipeOnBackground: Boolean         get() = p.getBoolean("wipe_bg", false);        set(v) { p.edit().putBoolean("wipe_bg", v).apply() }
    var searchEngine: Int                 get() = p.getInt("engine", 0);                 set(v) { p.edit().putInt("engine", v).apply() }
    var safeSearch: Boolean               get() = p.getBoolean("safe_search", false);    set(v) { p.edit().putBoolean("safe_search", v).apply() }
    var desktopMode: Boolean              get() = p.getBoolean("desktop", false);        set(v) { p.edit().putBoolean("desktop", v).apply() }
    var showTrackerCount: Boolean         get() = p.getBoolean("tracker_badge", true);   set(v) { p.edit().putBoolean("tracker_badge", v).apply() }
    // New Focus-style features
    var blockFonts: Boolean               get() = p.getBoolean("block_fonts", false);    set(v) { p.edit().putBoolean("block_fonts", v).apply() }
    var blockImages: Boolean              get() = p.getBoolean("block_images", false);   set(v) { p.edit().putBoolean("block_images", v).apply() }
    var fingerprintProtection: Boolean    get() = p.getBoolean("fingerprint", true);     set(v) { p.edit().putBoolean("fingerprint", v).apply() }
    var openLinksInApp: Boolean           get() = p.getBoolean("links_in_app", false);   set(v) { p.edit().putBoolean("links_in_app", v).apply() }
    var showSecurityIndicator: Boolean    get() = p.getBoolean("sec_indicator", true);   set(v) { p.edit().putBoolean("sec_indicator", v).apply() }
    var saveDataMode: Boolean             get() = p.getBoolean("save_data", false);      set(v) { p.edit().putBoolean("save_data", v).apply() }
    // Toolbar: 0=Bottom 1=Top
    var toolbarPosition: Int  get() = p.getInt("toolbar_pos", 0);   set(v) { p.edit().putInt("toolbar_pos", v).apply() }
    // Toolbar size: 0=Normal 1=Compact 2=Large
    var toolbarSize: Int      get() = p.getInt("toolbar_size", 0);  set(v) { p.edit().putInt("toolbar_size", v).apply() }
    // App lock password (default: 1234567890)
    var appPassword: String
        get()  = p.getString("app_password", "1234567890") ?: "1234567890"
        set(v) { p.edit().putString("app_password", v).apply() }

    var appLockEnabled: Boolean
        get()  = p.getBoolean("app_lock", true)
        set(v) { p.edit().putBoolean("app_lock", v).apply() }
}
