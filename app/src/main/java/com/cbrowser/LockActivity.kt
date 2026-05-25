package com.cbrowser

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class LockActivity : AppCompatActivity() {

    private lateinit var s: Settings
    private var attempts = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        s = Settings(this)
        AppCompatDelegate.setDefaultNightMode(when (s.theme) {
            1 -> AppCompatDelegate.MODE_NIGHT_NO
            2 -> AppCompatDelegate.MODE_NIGHT_YES
            else -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM
        })
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_lock)

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.lock_root)) { v, insets ->
            val sys = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(0, sys.top, 0, sys.bottom)
            insets
        }

        val input  = findViewById<EditText>(R.id.lock_input)
        val btnOk  = findViewById<Button>(R.id.lock_btn)
        val errTxt = findViewById<TextView>(R.id.lock_error)

        fun unlock() {
            val entered = input.text.toString()
            if (entered == s.appPassword) {
                startActivity(Intent(this, MainActivity::class.java).apply {
                    data = intent?.data   // forward any external URL
                })
                finish()
            } else {
                attempts++
                input.text.clear()
                errTxt.visibility = View.VISIBLE
                errTxt.text       = "Incorrect password (attempt $attempts)"
            }
        }

        input.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_DONE) { unlock(); true } else false
        }
        btnOk.setOnClickListener { unlock() }
    }
}
