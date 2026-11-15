package com.inkpad.app;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.os.Build;
import android.os.CancellationSignal;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.atomic.AtomicBoolean;

/** Fingerprint / face unlock using the framework BiometricPrompt (Android 9+). No extra dependency. */
@CapacitorPlugin(name = "InkLock")
public class InkLockPlugin extends Plugin {

    private boolean canUse() {
        if (Build.VERSION.SDK_INT < 28) return false;
        try {
            if (Build.VERSION.SDK_INT >= 30) {
                BiometricManager bm = getContext().getSystemService(BiometricManager.class);
                return bm != null && bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)
                        == BiometricManager.BIOMETRIC_SUCCESS;
            }
            if (Build.VERSION.SDK_INT >= 29) {
                BiometricManager bm = getContext().getSystemService(BiometricManager.class);
                return bm != null && bm.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS;
            }
            return getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_FINGERPRINT);
        } catch (Exception e) {
            return false;
        }
    }

    private static JSObject res(boolean ok, String err) {
        JSObject r = new JSObject();
        r.put("ok", ok);
        if (err != null) r.put("error", err);
        return r;
    }

    @PluginMethod
    public void available(PluginCall call) {
        call.resolve(res(canUse(), null));
    }

    @PluginMethod
    public void authenticate(final PluginCall call) {
        if (!canUse()) {
            call.resolve(res(false, "unavailable"));
            return;
        }
        final Activity a = getActivity();
        final String title = call.getString("title", "InkPad");
        final String sub = call.getString("subtitle", "");
        final AtomicBoolean done = new AtomicBoolean(false);
        a.runOnUiThread(() -> {
            try {
                BiometricPrompt.Builder b = new BiometricPrompt.Builder(a)
                        .setTitle(title)
                        .setNegativeButton("استخدم الرقم السري", a.getMainExecutor(), (d, w) -> {
                            if (done.compareAndSet(false, true)) call.resolve(res(false, "cancel"));
                        });
                if (sub != null && !sub.isEmpty()) b.setSubtitle(sub);
                if (Build.VERSION.SDK_INT >= 30) {
                    b.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK);
                }
                b.build().authenticate(new CancellationSignal(), a.getMainExecutor(),
                        new BiometricPrompt.AuthenticationCallback() {
                            @Override
                            public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                                if (done.compareAndSet(false, true)) call.resolve(res(true, null));
                            }

                            @Override
                            public void onAuthenticationError(int code, CharSequence msg) {
                                if (done.compareAndSet(false, true)) call.resolve(res(false, String.valueOf(msg)));
                            }
                        });
            } catch (Exception e) {
                if (done.compareAndSet(false, true)) call.resolve(res(false, String.valueOf(e.getMessage())));
            }
        });
    }
}
