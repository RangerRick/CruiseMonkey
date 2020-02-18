package com.raccoonfink.cruisemonkey;

import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;

@NativePlugin()
public class MemoryInfoPlugin extends Plugin {
    @PluginMethod()
    public void getMemoryInfo(final PluginCall call) {
        final Runtime runtime = Runtime.getRuntime();
        final long total = runtime.totalMemory();
        final long used = runtime.totalMemory() - runtime.freeMemory();

        final JSObject ret = new JSObject();
        ret.put("total", total);
        ret.put("used", used);
        call.success(ret);
    }
}