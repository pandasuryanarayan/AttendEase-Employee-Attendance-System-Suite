package com.attendease.android

import android.content.Context
import android.print.PrintAttributes
import android.print.PrintManager
import android.webkit.JavascriptInterface

/**
 * JavaScript → Android bridge exposed to the bundled SPA as
 * `window.AttendEasePrint`.
 *
 * The HTML application calls `window.print()` from three places:
 *   • Monthly Reports console   (#reports  → “Print Report”)
 *   • Payslip portal            (#my-invoices → invoice print action)
 *   • Tax Invoice view          (#invoice-view → “Print / Save PDF”)
 *
 * `window.print()` is a no-op inside an Android WebView, so [MainActivity]
 * rewrites it on load to call this bridge, which hands the rendered page —
 * including the app's `@media print` stylesheet (A4 invoice layout) — to the
 * Android system print sheet, where the user can print or "Save as PDF".
 */
class PrintBridge(private val activity: MainActivity) {

    @JavascriptInterface
    fun printDocument(jobName: String) {
        activity.runOnUiThread {
            val webView = activity.getWebView()
            val printManager =
                activity.getSystemService(Context.PRINT_SERVICE) as PrintManager
            val adapter = webView.createPrintDocumentAdapter(jobName)
            val attributes = PrintAttributes.Builder()
                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                .setResolution(PrintAttributes.Resolution("pdf", "pdf", 600, 600))
                .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                .build()
            printManager.print(jobName, adapter, attributes)
        }
    }
}
