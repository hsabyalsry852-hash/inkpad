package com.inkpad.app;

import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

@CapacitorPlugin(name = "InkOpen")
public class InkOpenPlugin extends Plugin {

    private static JSObject pending = null;

    /** Called from MainActivity with the launching / new intent. */
    public static void handle(final Context ctx, final Intent intent) {
        if (intent == null || intent.getBooleanExtra("ink_handled", false)) return;
        String action = intent.getAction();
        Uri uri = null;
        if (Intent.ACTION_VIEW.equals(action)) {
            uri = intent.getData();
        } else if (Intent.ACTION_SEND.equals(action)) {
            uri = (Uri) intent.getParcelableExtra(Intent.EXTRA_STREAM);
        }
        if (uri == null) return;
        intent.putExtra("ink_handled", true);
        final Uri u = uri;
        new Thread(() -> {
            JSObject o = new JSObject();
            try {
                String name = "file.pdf";
                try (Cursor c = ctx.getContentResolver().query(u, null, null, null, null)) {
                    if (c != null && c.moveToFirst()) {
                        int i = c.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                        if (i >= 0) name = c.getString(i);
                    }
                } catch (Exception ignored) {}
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                try (InputStream in = ctx.getContentResolver().openInputStream(u)) {
                    byte[] buf = new byte[65536];
                    int n;
                    while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                }
                o.put("name", name);
                o.put("data", Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP));
            } catch (Exception e) {
                o.put("error", String.valueOf(e.getMessage()));
            }
            synchronized (InkOpenPlugin.class) { pending = o; }
        }).start();
    }

    @PluginMethod
    public void getPending(PluginCall call) {
        JSObject r;
        synchronized (InkOpenPlugin.class) {
            r = pending != null ? pending : new JSObject();
            pending = null;
        }
        call.resolve(r);
    }
}
