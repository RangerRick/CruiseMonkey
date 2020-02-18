#import <Capacitor/Capacitor.h>

CAP_PLUGIN(MemoryInfoPlugin, "MemoryInfoPlugin",
  CAP_PLUGIN_METHOD(getMemoryInfo, CAPPluginReturnPromise);
)
