package com.cbrowser

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.appcompat.widget.SwitchCompat
import androidx.appcompat.widget.Toolbar

class SettingsActivity : AppCompatActivity() {

    private lateinit var s: Settings

    override fun onCreate(savedInstanceState: Bundle?) {
        s = Settings(this)
        applyTheme(s.theme)
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        val toolbar = findViewById<Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Settings"

        loadValues()
        setupListeners()
    }

    private fun sw(id: Int) = findViewById<SwitchCompat>(id)
    private fun rg(id: Int) = findViewById<RadioGroup>(id)
    private fun rb(id: Int) = findViewById<RadioButton>(id)

    private fun loadValues() {
        sw(R.id.switchTrackerBlocking).isChecked  = s.trackerBlockingEnabled
        sw(R.id.switchBlock3pCookies).isChecked   = s.thirdPartyCookiesBlocked
        sw(R.id.switchJavascript).isChecked       = s.javascriptEnabled
        sw(R.id.switchWipeOnBg).isChecked         = s.wipeOnBackground
        sw(R.id.switchSafeSearch).isChecked       = s.safeSearch
        sw(R.id.switchDesktopMode).isChecked      = s.desktopMode
        sw(R.id.switchTrackerCount).isChecked     = s.showTrackerCount
        sw(R.id.switchBlockFonts).isChecked       = s.blockFonts
        sw(R.id.switchBlockImages).isChecked      = s.blockImages
        sw(R.id.switchFingerprint).isChecked      = s.fingerprintProtection
        sw(R.id.switchSaveData).isChecked         = s.saveDataMode
        sw(R.id.switchSecIndicator).isChecked     = s.showSecurityIndicator

        sw(R.id.switchAppLock).isChecked = s.appLockEnabled

        when (s.toolbarPosition) { 1 -> rb(R.id.radioToolbarTop).isChecked = true
            else -> rb(R.id.radioToolbarBottom).isChecked = true }
        when (s.toolbarSize) {
            1 -> rb(R.id.radioToolbarCompact).isChecked = true
            2 -> rb(R.id.radioToolbarLarge).isChecked   = true
            else -> rb(R.id.radioToolbarNormal).isChecked = true
        }
        when (s.theme) {
            1 -> rb(R.id.radioLight).isChecked  = true
            2 -> rb(R.id.radioDark).isChecked   = true
            else -> rb(R.id.radioSystem).isChecked = true
        }

        val spinner = findViewById<Spinner>(R.id.spinnerEngine)
        spinner.adapter = ArrayAdapter(this,
            android.R.layout.simple_spinner_dropdown_item,
            BrowserViewModel.Engine.values().map { it.displayName })
        spinner.setSelection(s.searchEngine)
    }

    private fun setupListeners() {
        sw(R.id.switchTrackerBlocking).setOnCheckedChangeListener { _, v -> s.trackerBlockingEnabled  = v }
        sw(R.id.switchBlock3pCookies).setOnCheckedChangeListener  { _, v -> s.thirdPartyCookiesBlocked = v }
        sw(R.id.switchJavascript).setOnCheckedChangeListener      { _, v -> s.javascriptEnabled        = v }
        sw(R.id.switchWipeOnBg).setOnCheckedChangeListener        { _, v -> s.wipeOnBackground         = v }
        sw(R.id.switchSafeSearch).setOnCheckedChangeListener      { _, v -> s.safeSearch               = v }
        sw(R.id.switchDesktopMode).setOnCheckedChangeListener     { _, v -> s.desktopMode              = v }
        sw(R.id.switchTrackerCount).setOnCheckedChangeListener    { _, v -> s.showTrackerCount         = v }
        sw(R.id.switchBlockFonts).setOnCheckedChangeListener      { _, v -> s.blockFonts               = v }
        sw(R.id.switchBlockImages).setOnCheckedChangeListener     { _, v -> s.blockImages              = v }
        sw(R.id.switchFingerprint).setOnCheckedChangeListener     { _, v -> s.fingerprintProtection    = v }
        sw(R.id.switchSaveData).setOnCheckedChangeListener        { _, v -> s.saveDataMode             = v }
        sw(R.id.switchSecIndicator).setOnCheckedChangeListener    { _, v -> s.showSecurityIndicator    = v }

        sw(R.id.switchAppLock).setOnCheckedChangeListener { _, v -> s.appLockEnabled = v }

        rg(R.id.radioGroupToolbarPos).setOnCheckedChangeListener { _, id ->
            s.toolbarPosition = if (id == R.id.radioToolbarTop) 1 else 0 }
        rg(R.id.radioGroupToolbarSize).setOnCheckedChangeListener { _, id ->
            s.toolbarSize = when (id) { R.id.radioToolbarCompact -> 1; R.id.radioToolbarLarge -> 2; else -> 0 } }
        rg(R.id.radioGroupTheme).setOnCheckedChangeListener { _, id ->
            val t = when (id) { R.id.radioLight -> 1; R.id.radioDark -> 2; else -> 0 }
            s.theme = t; applyTheme(t)
        }

        // Password change
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnChangePassword)
            .setOnClickListener { showChangePasswordDialog() }

        // Change search engine
        findViewById<Spinner>(R.id.spinnerEngine)
            .onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p: AdapterView<*>?, v: android.view.View?, pos: Int, id: Long) {
                s.searchEngine = pos }
            override fun onNothingSelected(p: AdapterView<*>?) {}
        }

        // Clear data
        findViewById<com.google.android.material.button.MaterialButton>(R.id.btnClearData)
            .setOnClickListener {
                (applicationContext as App).wipeWebData()
                Toast.makeText(this, "All browsing data cleared", Toast.LENGTH_SHORT).show()
            }
    }

    private fun showChangePasswordDialog() {
        val ctx    = this
        val layout = android.widget.LinearLayout(ctx).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(48, 24, 48, 8)
        }
        val current = android.widget.EditText(ctx).apply {
            hint        = "Current password"
            inputType   = android.text.InputType.TYPE_CLASS_TEXT or
                          android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        val newPass = android.widget.EditText(ctx).apply {
            hint        = "New password (6–36 chars)"
            inputType   = android.text.InputType.TYPE_CLASS_TEXT or
                          android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        val confirm = android.widget.EditText(ctx).apply {
            hint        = "Confirm new password"
            inputType   = android.text.InputType.TYPE_CLASS_TEXT or
                          android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        }
        layout.addView(current); layout.addView(newPass); layout.addView(confirm)

        android.app.AlertDialog.Builder(ctx)
            .setTitle("Change password")
            .setView(layout)
            .setPositiveButton("Save") { _, _ ->
                val cur = current.text.toString()
                val np  = newPass.text.toString()
                val cf  = confirm.text.toString()
                when {
                    cur != s.appPassword ->
                        Toast.makeText(ctx, "Current password incorrect", Toast.LENGTH_SHORT).show()
                    np.length < 6 || np.length > 36 ->
                        Toast.makeText(ctx, "Password must be 6–36 characters", Toast.LENGTH_SHORT).show()
                    np != cf ->
                        Toast.makeText(ctx, "Passwords do not match", Toast.LENGTH_SHORT).show()
                    else -> {
                        s.appPassword = np
                        Toast.makeText(ctx, "Password updated", Toast.LENGTH_SHORT).show()
                    }
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun applyTheme(t: Int) = AppCompatDelegate.setDefaultNightMode(when (t) {
        1 -> AppCompatDelegate.MODE_NIGHT_NO
        2 -> AppCompatDelegate.MODE_NIGHT_YES
        else -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
    })

    override fun onSupportNavigateUp(): Boolean { finish(); return true }
}
