package com.attendease.android

import android.annotation.SuppressLint
import android.content.res.Configuration
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.attendease.android.databinding.ActivityMainBinding

/**
 * AttendEase — Android host activity.
 *
 * This activity embeds the exact AttendEase Single Page Application that ships
 * in the repository's `html-app/` folder (bundled under `src/main/assets/`).
 * The SPA keeps its own design system, hash router, state manager, seed data
 * and rendering engines — this activity provides the native Android shell:
 *
 *  1. WebView runtime with JavaScript + `localStorage` (DOM storage) enabled,
 *     so attendance, leave, salary and invoice data persist across launches.
 *  2. Hardware/gesture back button wired to the SPA hash history.
 *  3. A JavaScript bridge (`window.AttendEasePrint`) that replaces
 *     `window.print()` with the Android system print sheet via [PrintBridge].
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    /** Injected on every page-load: routes window.print() to the native print sheet. */
    private val printHookJs =
        "(function () {" +
        "  if (window.__attendEasePrintHooked) return;" +
        "  window.__attendEasePrintHooked = true;" +
        "  if (window.AttendEasePrint) {" +
        "    window.print = function () {" +
        "      var job = 'AttendEase';" +
        "      try {" +
        "        var title = document.querySelector('.topbar-title');" +
        "        if (title && title.textContent) { job = 'AttendEase — ' + title.textContent.trim(); }" +
        "      } catch (ignored) {}" +
        "      window.AttendEasePrint.printDocument(job);" +
        "    };" +
        "  }" +
        "})();"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configureWebView()

        if (savedInstanceState != null) {
            binding.webView.restoreState(savedInstanceState)
        } else {
            binding.webView.loadUrl(APP_URL)
        }

        // Hardware back / predictive-back gesture: walk the SPA hash history
        // first (login -> dashboard -> leaves -> ...), exit when exhausted.
        onBackPressedDispatcher.addCallback(
            this,
            object : OnBackPressedCallback(true) {
                override fun handleOnBackPressed() {
                    if (binding.webView.canGoBack()) {
                        binding.webView.goBack()
                    } else {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        )
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        binding.webView.settings.apply {
            javaScriptEnabled = true

            // DOM storage == window.localStorage: the SPA's entire persistence
            // layer (users, attendance, leaves, salaries, invoices, rules,
            // session) lives here and survives app restarts.
            domStorageEnabled = true
            databaseEnabled = true

            // Render the responsive mobile layout (<= 768px branch of style.css).
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false

            // Only the bundled file:// assets are needed for the app itself.
            allowFileAccess = true
            allowContentAccess = false

            // Google Fonts (Plus Jakarta Sans / Inter) are fetched over https.
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }

        binding.webView.setBackgroundColor(getColor(R.color.app_background))
        binding.webView.isVerticalScrollBarEnabled = false
        binding.webView.overScrollMode = View.OVER_SCROLL_NEVER

        binding.webView.webViewClient = object : WebViewClient() {
            // Keep all navigation (hash routes included) inside the WebView.
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val url = request.url.toString()
                return !(url.startsWith("file:///android_asset/") || url.startsWith("#"))
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                // (Re)install the native print bridge. Safe to run repeatedly;
                // the hook guards itself with __attendEasePrintHooked.
                view.evaluateJavascript(printHookJs, null)
            }
        }

        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, newProgress: Int) {
                if (newProgress < 100 && binding.progressBar.visibility == View.GONE) {
                    binding.progressBar.visibility = View.VISIBLE
                }
                binding.progressBar.progress = newProgress
                if (newProgress >= 100) binding.progressBar.visibility = View.GONE
            }
        }

        binding.webView.addJavascriptInterface(PrintBridge(this), "AttendEasePrint")
    }

    fun getWebView(): WebView = binding.webView

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        // The SPA re-lays itself out; nothing to rebuild here.
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }

    companion object {
        private const val APP_URL = "file:///android_asset/index.html"
    }
}
