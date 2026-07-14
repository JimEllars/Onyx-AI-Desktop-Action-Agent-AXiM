cat << 'PATCH' > telemetry.patch
--- src/components/hud/TelemetryChart.jsx
+++ src/components/hud/TelemetryChart.jsx
@@ -48,11 +48,11 @@
       itemHeight: 8
     },
     grid: { top: 10, bottom: 25, left: 10, right: 10, containLabel: false },
-    xAxis: { show: false, type: 'category' },
+    xAxis: { show: false, type: 'category', splitLine: { show: false } },
     yAxis: [
-      { show: false, type: 'value', scale: true },
-      { show: false, type: 'value', scale: true },
-      { show: false, type: 'value', scale: true }
+      { show: false, type: 'value', scale: true, splitLine: { show: false } },
+      { show: false, type: 'value', scale: true, splitLine: { show: false } },
+      { show: false, type: 'value', scale: true, splitLine: { show: false } }
     ],
     series: [
       {
PATCH
patch src/components/hud/TelemetryChart.jsx telemetry.patch
