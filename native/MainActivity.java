package com.inkpad.app;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ActionMode;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // The app draws its own selection bar (colors / translate / copy), so hide Android's floating
    // text toolbar (Copy / Web search / Google Translate ...) while text is selected in the PDF.
    // It stays visible when the cursor is in an input box so paste keeps working.
    private ActionMode selMode;
    private final Handler selH = new Handler(Looper.getMainLooper());
    private final Runnable selHide = new Runnable() {
        @Override
        public void run() {
            final ActionMode m = selMode;
            if (m == null) return;
            try {
                getBridge().getWebView().evaluateJavascript(
                    "(function(){var a=document.activeElement;return !!(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.isContentEditable))})()",
                    value -> {
                        if (m != selMode || "true".equals(value)) return;
                        try {
                            m.getMenu().clear();
                            if (Build.VERSION.SDK_INT >= 23) m.hide(3000);
                        } catch (Exception ignored) {}
                    });
            } catch (Exception ignored) {}
            selH.postDelayed(this, 2000);
        }
    };

    @Override
    public void onActionModeStarted(ActionMode mode) {
        super.onActionModeStarted(mode);
        if (Build.VERSION.SDK_INT >= 23 && mode.getType() == ActionMode.TYPE_FLOATING) {
            selMode = mode;
            selH.removeCallbacks(selHide);
            selH.post(selHide);
        }
    }

    @Override
    public void onActionModeFinished(ActionMode mode) {
        super.onActionModeFinished(mode);
        if (mode == selMode) {
            selMode = null;
            selH.removeCallbacks(selHide);
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(InkOpenPlugin.class);
        registerPlugin(InkLockPlugin.class);
        super.onCreate(savedInstanceState);
        InkOpenPlugin.handle(this, getIntent());

        // Back button: ask the page first (close menu / close open document); exit only if it says no.
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                getBridge().getWebView().evaluateJavascript(
                    "(function(){try{return window.inkBack?window.inkBack():false}catch(e){return false}})()",
                    value -> {
                        if (!"true".equals(value)) finish();
                    });
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        InkOpenPlugin.handle(this, intent);
    }
}
