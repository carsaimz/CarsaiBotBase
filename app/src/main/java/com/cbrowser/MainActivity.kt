package com.cbrowser

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.*
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.webkit.WebView
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.ViewModelProvider
import com.cbrowser.databinding.ActivityMainBinding
import com.cbrowser.databinding.ViewBrowserBinding
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.google.android.material.button.MaterialButton
import androidx.activity.OnBackPressedCallback
import kotlinx.coroutines.*

class MainActivity : AppCompatActivity(), PrivacyWebView.Listener {

    private lateinit var b: ActivityMainBinding
    private lateinit var br: ViewBrowserBinding
    private lateinit var vm: BrowserViewModel
    private lateinit var s: Settings

    private val activeWebView get() = vm.activeTab.webView
    private var sessionTrackers = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        s = Settings(this)
        applyTheme(s.theme)
        installSplashScreen()
        super.onCreate(savedInstanceState)
        b = ActivityMainBinding.inflate(layoutInflater)
        setContentView(b.root)

        // Use nested binding for browser view
        br = ViewBrowserBinding.bind(b.browserView.root)

        ViewCompat.setOnApplyWindowInsetsListener(b.root) { _, insets ->
            val sys = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            b.homeView.root.setPadding(0, sys.top, 0, sys.bottom)
            applyToolbarInsets(sys.top, sys.bottom)
            insets
        }

        vm = ViewModelProvider(this)[BrowserViewModel::class.java]
        vm.selectedEngine = BrowserViewModel.Engine.values()[s.searchEngine]

        setupHome()
        setupBrowser()
        applyToolbarAppearance()
        registerBackHandler()
        intent?.data?.toString()?.let { navigateToBrowser(it) }
    }

    override fun onResume() {
        super.onResume()
        s = Settings(this)
        vm.selectedEngine = BrowserViewModel.Engine.values()[s.searchEngine]
        applyTheme(s.theme)
        applyToolbarAppearance()
        updateHomeStats()
    }

    // ── TOOLBAR APPEARANCE ────────────────────────────────────────

    private fun applyToolbarAppearance() {
        val params = br.navBar.layoutParams as FrameLayout.LayoutParams
        val isTop  = s.toolbarPosition == 1
        params.gravity = if (isTop) Gravity.TOP else Gravity.BOTTOM
        br.navBar.layoutParams = params

        val heightDp = when (s.toolbarSize) { 1 -> 42; 2 -> 64; else -> 52 }
        val heightPx = (heightDp * resources.displayMetrics.density).toInt()
        br.toolbarRow.layoutParams = br.toolbarRow.layoutParams.also { it.height = heightPx }
        br.txtUrl.textSize = when (s.toolbarSize) { 1 -> 11f; 2 -> 15f; else -> 12f }

        val pad = heightPx + (4 * resources.displayMetrics.density).toInt()
        br.browserContent.setPadding(0, if (isTop) pad else 0, 0, if (!isTop) pad else 0)
    }

    private fun applyToolbarInsets(top: Int, bottom: Int) {
        val isTop = s.toolbarPosition == 1
        br.navBar.setPadding(0, if (isTop) top else 0, 0, if (!isTop) bottom else 0)
    }

    // ── HOME ──────────────────────────────────────────────────────

    private fun setupHome() {
        fun search() {
            val q = b.homeView.homeSearchInput.text.toString().trim()
            if (q.isEmpty()) return
            hideKeyboard(b.homeView.homeSearchInput)
            navigateToBrowser(vm.normalizeUrl(q))
        }
        b.homeView.homeSearchInput.setOnEditorActionListener { _, id, _ ->
            if (id == EditorInfo.IME_ACTION_SEARCH) { search(); true } else false
        }
        b.homeView.btnHomeSearch.setOnClickListener { search() }
        b.homeView.btnEngine.setOnClickListener { v ->
            showEngineMenu(v) { b.homeView.btnEngine.text = vm.selectedEngine.shortName }
        }
        b.homeView.actionNewTab.setOnClickListener  { vm.newTab(); updateHomeStats() }
        b.homeView.actionSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
        b.homeView.actionClear.setOnClickListener {
            (applicationContext as App).wipeWebData()
            vm.wipeAll(); BookmarkStore.clear()
            sessionTrackers = 0; updateHomeStats()
            Toast.makeText(this, "All data cleared", Toast.LENGTH_SHORT).show()
        }
        b.homeView.actionTabs.setOnClickListener {
            if (b.browserView.root.visibility == View.VISIBLE) showTabsSheet()
            else Toast.makeText(this, "No active session", Toast.LENGTH_SHORT).show()
        }
        setupQuickSites()
        updateHomeStats()
    }

    private fun setupQuickSites() {
        data class Site(val name: String, val url: String)
        val sites = listOf(
            Site("Google",     "https://google.com"),
            Site("YouTube",    "https://youtube.com"),
            Site("GitHub",     "https://github.com"),
            Site("Wikipedia",  "https://wikipedia.org"),
            Site("Reddit",     "https://reddit.com"),
            Site("DDG",        "https://duckduckgo.com"),
            Site("Amazon",     "https://amazon.com"),
            Site("Twitter/X",  "https://x.com"),
        )
        val grid = b.homeView.quickSitesGrid
        grid.removeAllViews()
        val dp = resources.displayMetrics.density
        sites.forEach { site ->
            val cell = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                gravity     = Gravity.CENTER
                setPadding((8*dp).toInt(), (8*dp).toInt(), (8*dp).toInt(), (8*dp).toInt())
                val tv = android.util.TypedValue()
                theme.resolveAttribute(android.R.attr.selectableItemBackgroundBorderless, tv, true)
                background = resources.getDrawable(tv.resourceId, theme)
                setOnClickListener { navigateToBrowser(site.url) }
            }
            val icon = ImageView(this).apply {
                layoutParams = ViewGroup.LayoutParams((28*dp).toInt(), (28*dp).toInt())
                setImageResource(R.drawable.ic_search)
                setColorFilter(getColor(R.color.accent))
            }
            val label = TextView(this).apply {
                text     = site.name; textSize = 10f
                setTextColor(getColor(android.R.color.darker_gray))
                gravity  = Gravity.CENTER
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).apply { topMargin = (4*dp).toInt() }
            }
            cell.addView(icon); cell.addView(label)
            val cp = GridLayout.LayoutParams().apply {
                width = 0; height = GridLayout.LayoutParams.WRAP_CONTENT
                columnSpec = GridLayout.spec(GridLayout.UNDEFINED, 1, 1f)
                setMargins((4*dp).toInt(), (4*dp).toInt(), (4*dp).toInt(), (4*dp).toInt())
            }
            grid.addView(cell, cp)
        }
    }

    private fun updateHomeStats() {
        b.homeView.statTrackers.text     = sessionTrackers.toString()
        b.homeView.statTabs.text         = vm.tabs.size.toString()
        b.homeView.actionTabsCount.text  = "${vm.tabs.size} tab${if (vm.tabs.size != 1) "s" else ""}"
    }

    // ── BROWSER ───────────────────────────────────────────────────

    private fun setupBrowser() {
        br.swipeRefresh.setColorSchemeResources(R.color.accent)
        br.swipeRefresh.setProgressBackgroundColorSchemeResource(R.color.bg_surface)
        br.swipeRefresh.setOnChildScrollUpCallback { _, _ ->
            activeWebView?.canScrollVertically(-1) ?: false
        }
        br.swipeRefresh.setOnRefreshListener {
            activeWebView?.cleanReload(); br.swipeRefresh.isRefreshing = false
        }
        br.urlCard.setOnClickListener    { showSearchOverlay() }
        br.btnBack.setOnClickListener    { activeWebView?.goBack() }
        br.btnForward.setOnClickListener { activeWebView?.goForward() }
        br.btnRefresh.setOnClickListener {
            if (activeWebView?.progress == 100) activeWebView?.cleanReload()
            else { activeWebView?.stopLoading(); br.btnRefresh.setImageResource(R.drawable.ic_refresh) }
        }
        br.btnTabs.setOnClickListener { showTabsSheet() }
        br.btnMore.setOnClickListener  { showMoreSheet() }
    }

    private fun getOrCreateWebView(): PrivacyWebView {
        val tab = vm.activeTab
        if (tab.webView == null) tab.webView = PrivacyWebView(this, this, s)
        val wv = tab.webView!!
        val container = br.webContainer
        if (wv.parent !== container) {
            (wv.parent as? ViewGroup)?.removeView(wv)
            container.removeAllViews()
            container.addView(wv, FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        }
        return wv
    }

    private fun navigateToBrowser(url: String) {
        b.homeView.root.visibility    = View.GONE
        b.browserView.root.visibility = View.VISIBLE
        getOrCreateWebView().loadUrlWithHeaders(url)
        vm.activeTab.url = url
    }

    // ── WebView Listener ──────────────────────────────────────────

    override fun onPageStarted(url: String) {
        vm.activeTab.url = url
        updateUrlBar(url, "")
        updateNavButtons()
        br.btnRefresh.setImageResource(R.drawable.ic_close)
        br.progressBar.visibility = View.VISIBLE
        br.findBar.root.visibility = View.GONE
    }

    override fun onPageFinished(url: String) {
        vm.activeTab.url = url
        updateUrlBar(url, vm.activeTab.title)
        updateNavButtons()
        br.btnRefresh.setImageResource(R.drawable.ic_refresh)
        br.progressBar.visibility = View.GONE
        updateTabCount()
    }

    override fun onTitleChanged(title: String) {
        vm.activeTab.title = title
        updateUrlBar(vm.activeTab.url, title)
    }

    override fun onProgressChanged(progress: Int) {
        br.progressBar.progress   = progress
        br.progressBar.visibility = if (progress < 100) View.VISIBLE else View.GONE
    }

    override fun onTrackerBlocked() {
        vm.activeTab.trackersBlocked++; sessionTrackers++
        if (s.showTrackerCount) {
            br.txtTrackers.visibility = View.VISIBLE
            br.txtTrackers.text       = "${vm.activeTab.trackersBlocked}"
        }
    }

    override fun onSslError(url: String) {
        runOnUiThread {
            android.app.AlertDialog.Builder(this)
                .setTitle("Connection not secure")
                .setMessage("This site's SSL certificate is invalid.")
                .setPositiveButton("OK", null).show()
        }
    }

    override fun onDownload(url: String, ua: String, cd: String, mime: String) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q &&
            checkSelfPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
            != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(android.Manifest.permission.WRITE_EXTERNAL_STORAGE), 1)
        }
        vm.download(this, url, ua, cd, mime)
        Toast.makeText(this, "Download started", Toast.LENGTH_SHORT).show()
    }

    override fun onCreateNewTab(url: String) {
        vm.newTab().also { it.url = url }
        vm.selectTab(vm.tabs.lastIndex)
        navigateToBrowser(url); updateTabCount()
    }

    // ── URL Bar ───────────────────────────────────────────────────

    private fun updateUrlBar(url: String, title: String) {
        br.txtUrl.text = title.ifEmpty { url.removePrefix("https://").removePrefix("http://") }
        if (s.showSecurityIndicator) {
            br.icSecure.visibility = View.VISIBLE
            br.icSecure.setImageResource(if (url.startsWith("https://")) R.drawable.ic_lock else R.drawable.ic_warning)
        } else br.icSecure.visibility = View.GONE
    }

    private fun updateNavButtons() {
        br.btnBack.alpha    = if (activeWebView?.canGoBack()    == true) 1f else 0.3f
        br.btnForward.alpha = if (activeWebView?.canGoForward() == true) 1f else 0.3f
    }

    private fun updateTabCount() {
        br.txtTabCount.text       = vm.tabs.size.toString()
        br.txtTrackers.visibility = View.GONE
        vm.activeTab.trackersBlocked = 0
    }

    // ── More options sheet ────────────────────────────────────────

    private fun showMoreSheet() {
        val url = vm.activeTab.url
        val dialog = BottomSheetDialog(this, R.style.Theme_CBrowser_Main)
        val v = layoutInflater.inflate(R.layout.sheet_more, null)
        dialog.setContentView(v)

        v.findViewById<TextView>(R.id.more_url).text =
            url.removePrefix("https://").removePrefix("http://")
        v.findViewById<android.widget.ImageView>(R.id.more_sec_icon)
            .setImageResource(if (url.startsWith("https://")) R.drawable.ic_lock else R.drawable.ic_warning)

        // Bookmark toggle
        val bookmarkIcon = v.findViewById<android.widget.ImageView>(R.id.more_bookmark_icon)
        bookmarkIcon.setImageResource(
            if (BookmarkStore.contains(url)) R.drawable.ic_bookmark else R.drawable.ic_bookmark_border
        )
        v.findViewById<View>(R.id.more_bookmark).setOnClickListener {
            if (BookmarkStore.contains(url)) {
                BookmarkStore.remove(url)
                bookmarkIcon.setImageResource(R.drawable.ic_bookmark_border)
                Toast.makeText(this, "Bookmark removed", Toast.LENGTH_SHORT).show()
            } else {
                BookmarkStore.add(vm.activeTab.title.ifEmpty { url }, url)
                bookmarkIcon.setImageResource(R.drawable.ic_bookmark)
                Toast.makeText(this, "Bookmarked", Toast.LENGTH_SHORT).show()
            }
        }

        v.findViewById<View>(R.id.more_share).setOnClickListener {
            dialog.dismiss()
            startActivity(Intent.createChooser(
                Intent(Intent.ACTION_SEND).apply { type = "text/plain"; putExtra(Intent.EXTRA_TEXT, url) },
                "Share"
            ))
        }

        v.findViewById<View>(R.id.more_copy_url).setOnClickListener {
            dialog.dismiss()
            (getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager)
                .setPrimaryClip(ClipData.newPlainText("URL", url))
            Toast.makeText(this, "URL copied", Toast.LENGTH_SHORT).show()
        }

        v.findViewById<View>(R.id.more_find).setOnClickListener {
            dialog.dismiss(); showFindInPage()
        }

        v.findViewById<View>(R.id.more_open_app).setOnClickListener {
            dialog.dismiss()
            try { startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url))) }
            catch (e: Exception) { Toast.makeText(this, "No app found", Toast.LENGTH_SHORT).show() }
        }

        // Desktop mode toggle
        val desktopLabel = v.findViewById<TextView>(R.id.more_desktop_label)
        desktopLabel.text = if (s.desktopMode) "Mobile" else "Desktop"
        v.findViewById<View>(R.id.more_desktop).setOnClickListener {
            dialog.dismiss()
            s.desktopMode = !s.desktopMode
            activeWebView?.applySettings()
            activeWebView?.reload()
        }

        v.findViewById<View>(R.id.more_bookmarks_list).setOnClickListener {
            dialog.dismiss(); showBookmarksSheet()
        }

        v.findViewById<View>(R.id.more_clear).setOnClickListener {
            dialog.dismiss()
            activeWebView?.cleanReload()
            Toast.makeText(this, "Page data cleared", Toast.LENGTH_SHORT).show()
        }

        v.findViewById<View>(R.id.more_settings).setOnClickListener {
            dialog.dismiss()
            startActivity(Intent(this, SettingsActivity::class.java))
        }

        dialog.show()
    }

    // ── Find in page ──────────────────────────────────────────────

    private fun showFindInPage() {
        val findBar = br.findBar
        findBar.root.visibility = View.VISIBLE
        val input = findBar.findInput
        val matches = findBar.findMatches
        input.requestFocus()
        (getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager)
            .showSoftInput(input, InputMethodManager.SHOW_IMPLICIT)

        input.addTextChangedListener(object : android.text.TextWatcher {
            override fun afterTextChanged(s: android.text.Editable?) {
                val q = s.toString()
                if (q.isEmpty()) { activeWebView?.clearMatches(); matches.text = "" }
                else activeWebView?.findAllAsync(q)
            }
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun onTextChanged(s: CharSequence?, st: Int, b: Int, c: Int) {}
        })

        activeWebView?.setFindListener { active, found, _ ->
            matches.text = "$active/${found}"
        }

        findBar.findPrev.setOnClickListener  { activeWebView?.findNext(false) }
        findBar.findNext.setOnClickListener  { activeWebView?.findNext(true)  }
        findBar.findClose.setOnClickListener {
            activeWebView?.clearMatches()
            findBar.root.visibility = View.GONE
            hideKeyboard(input)
        }
    }

    // ── Bookmarks sheet ───────────────────────────────────────────

    private fun showBookmarksSheet() {
        val dialog = BottomSheetDialog(this, R.style.Theme_CBrowser_Main)
        val v = layoutInflater.inflate(R.layout.sheet_bookmarks, null)
        dialog.setContentView(v)
        val list  = v.findViewById<ListView>(R.id.bookmarks_list)
        val empty = v.findViewById<TextView>(R.id.bookmarks_empty)
        val items = BookmarkStore.items
        if (items.isEmpty()) {
            empty.visibility = View.VISIBLE; list.visibility = View.GONE
        } else {
            empty.visibility = View.GONE
            list.adapter = object : ArrayAdapter<Bookmark>(this, 0, items) {
                override fun getView(pos: Int, cv: View?, parent: ViewGroup): View {
                    val row = cv ?: layoutInflater.inflate(R.layout.item_tab, parent, false)
                    val bm  = getItem(pos)!!
                    row.findViewById<TextView>(R.id.tab_title).text = bm.title
                    row.findViewById<TextView>(R.id.tab_url).text   =
                        bm.url.removePrefix("https://").removePrefix("http://")
                    row.setBackgroundColor(0xFFFFFFFF.toInt())
                    row.findViewById<View>(R.id.tab_close).setOnClickListener {
                        BookmarkStore.remove(bm.url); notifyDataSetChanged()
                    }
                    return row
                }
            }
            list.setOnItemClickListener { _, _, pos, _ ->
                dialog.dismiss(); navigateToBrowser(items[pos].url)
            }
        }
        dialog.show()
    }

    // ── Search + Tabs sheets ──────────────────────────────────────

    private fun showSearchOverlay() {
        val dialog = BottomSheetDialog(this, R.style.Theme_CBrowser_Main)
        val v = layoutInflater.inflate(R.layout.sheet_search, null)
        dialog.setContentView(v)
        val input  = v.findViewById<EditText>(R.id.sheet_input)
        val btnEng = v.findViewById<MaterialButton>(R.id.sheet_engine_btn)
        val sugg   = v.findViewById<ListView>(R.id.sheet_suggestions)
        input.setText(vm.activeTab.url); input.selectAll()
        btnEng.text = vm.selectedEngine.shortName
        val sites = listOf("google.com","youtube.com","github.com","reddit.com",
            "wikipedia.org","stackoverflow.com","amazon.com","twitter.com",
            "instagram.com","linkedin.com","netflix.com","twitch.tv")
        fun update(q: String) {
            val l = if (q.length < 2) sites else sites.filter { it.contains(q, true) }
            sugg.adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, l)
        }
        update("")
        input.addTextChangedListener(object : android.text.TextWatcher {
            override fun afterTextChanged(s: android.text.Editable?) = update(s.toString())
            override fun beforeTextChanged(s: CharSequence?, st: Int, c: Int, a: Int) {}
            override fun onTextChanged(s: CharSequence?, st: Int, b: Int, c: Int) {}
        })
        fun submit(t: String) { dialog.dismiss(); navigateToBrowser(vm.normalizeUrl(t)) }
        input.setOnEditorActionListener { _, id, _ ->
            if (id == EditorInfo.IME_ACTION_SEARCH || id == EditorInfo.IME_ACTION_GO) {
                submit(input.text.toString()); true
            } else false
        }
        sugg.setOnItemClickListener { _, _, pos, _ -> submit(sugg.adapter.getItem(pos) as String) }
        btnEng.setOnClickListener { v2 -> showEngineMenu(v2) { btnEng.text = vm.selectedEngine.shortName } }
        dialog.show()
        input.post {
            input.requestFocus()
            (getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager)
                .showSoftInput(input, InputMethodManager.SHOW_IMPLICIT)
        }
    }

    private fun showTabsSheet() {
        val dialog = BottomSheetDialog(this, R.style.Theme_CBrowser_Main)
        val v = layoutInflater.inflate(R.layout.sheet_tabs, null)
        dialog.setContentView(v)
        val list = v.findViewById<ListView>(R.id.tabs_list)
        val btnNew = v.findViewById<View>(R.id.btn_new_tab)
        list.adapter = object : ArrayAdapter<Tab>(this, 0, vm.tabs) {
            override fun getView(pos: Int, cv: View?, parent: ViewGroup): View {
                val row = cv ?: layoutInflater.inflate(R.layout.item_tab, parent, false)
                val tab = getItem(pos)!!
                row.findViewById<TextView>(R.id.tab_title).text =
                    tab.title.ifEmpty { if (tab.url.isEmpty()) "New Tab" else tab.url }
                row.findViewById<TextView>(R.id.tab_url).text =
                    tab.url.removePrefix("https://").removePrefix("http://")
                row.setBackgroundColor(if (pos == vm.activeTabIndex) 0xFFE3F2FD.toInt() else 0xFFFFFFFF.toInt())
                row.findViewById<View>(R.id.tab_close).setOnClickListener {
                    vm.closeTab(pos); notifyDataSetChanged(); dialog.dismiss(); switchToActiveTab()
                }
                return row
            }
        }
        list.setOnItemClickListener { _, _, pos, _ -> vm.selectTab(pos); dialog.dismiss(); switchToActiveTab() }
        btnNew.setOnClickListener { vm.newTab(); dialog.dismiss(); showHome() }
        dialog.show()
    }

    private fun showEngineMenu(anchor: View, onSelected: () -> Unit) {
        val menu = PopupMenu(this, anchor)
        BrowserViewModel.Engine.values().forEachIndexed { i, e -> menu.menu.add(0, i, i, e.displayName) }
        menu.setOnMenuItemClickListener { item ->
            vm.selectedEngine = BrowserViewModel.Engine.values()[item.itemId]
            s.searchEngine    = item.itemId; onSelected(); true
        }
        menu.show()
    }

    private fun switchToActiveTab() {
        updateTabCount()
        val tab = vm.activeTab
        if (tab.url.isEmpty() && vm.tabs.size == 1) { showHome(); return }
        b.homeView.root.visibility    = View.GONE
        b.browserView.root.visibility = View.VISIBLE
        if (tab.url.isNotEmpty()) { getOrCreateWebView(); updateUrlBar(tab.url, tab.title); updateNavButtons() }
    }

    private fun showHome() {
        b.browserView.root.visibility = View.GONE
        b.homeView.root.visibility    = View.VISIBLE
        updateHomeStats()
    }

    // ── Lifecycle ─────────────────────────────────────────────────

    override fun onStop() {
        super.onStop()
        if (isFinishing || s.wipeOnBackground) {
            (applicationContext as App).wipeWebData()
            vm.wipeAll(); BookmarkStore.clear()
            sessionTrackers = 0
        }
    }

    private fun registerBackHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (br.findBar.root.visibility == View.VISIBLE) {
                    activeWebView?.clearMatches(); br.findBar.root.visibility = View.GONE; return
                }
                when {
                    b.browserView.root.visibility == View.VISIBLE && activeWebView?.canGoBack() == true ->
                        activeWebView?.goBack()
                    b.browserView.root.visibility == View.VISIBLE && vm.tabs.size > 1 -> {
                        vm.closeTab(vm.activeTabIndex); switchToActiveTab()
                    }
                    b.browserView.root.visibility == View.VISIBLE -> showHome()
                    else -> { isEnabled = false; onBackPressedDispatcher.onBackPressed() }
                }
            }
        })
    }

    override fun onDestroy() { super.onDestroy() }

    private fun applyTheme(t: Int) = AppCompatDelegate.setDefaultNightMode(when (t) {
        1 -> AppCompatDelegate.MODE_NIGHT_NO; 2 -> AppCompatDelegate.MODE_NIGHT_YES
        else -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
    })

    private fun hideKeyboard(v: View) {
        (getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager)
            .hideSoftInputFromWindow(v.windowToken, 0)
    }
}
