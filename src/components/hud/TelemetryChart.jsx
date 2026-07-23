import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function TelemetryChart() {
  const { cpuHistory, memoryHistory, latencyHistory } = useDesktopAgentStore();
  const chartRef = useRef(null);

  useEffect(() => {
    if (cpuHistory.length === 0 && memoryHistory.length === 0 && latencyHistory.length === 0) {
      if (chartRef.current) {
        const chartInstance = chartRef.current.getEchartsInstance();
        chartInstance.clear();
      }
    }
  }, [cpuHistory, memoryHistory, latencyHistory]);

  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      show: true,
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: '#334155',
      borderWidth: 1,
      textStyle: {
        color: '#f8fafc',
        fontSize: 11
      },
      formatter: (params) => {
        let result = `<span style="color:#64748b;font-weight:bold;">[TELEMETRY_STREAM]</span><br/>`;
        params.forEach(param => {
          let suffix = '';
          if (param.seriesName === 'CPU Core Use') suffix = '%';
          else if (param.seriesName === 'Physical Memory Delta') suffix = ' MB';
          else if (param.seriesName === 'Cloudflare Edge Latency') suffix = ' ms';
          result += `${param.marker} ${param.seriesName}: ${Math.round(param.value)}${suffix}<br/>`;
        });
        return result;
      }
    },
    legend: {
      show: true,
      textStyle: { color: '#94a3b8', fontSize: 9 },
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8
    },
    grid: { top: 10, bottom: 25, left: 10, right: 10, containLabel: false },
    xAxis: { show: false, type: 'category', splitLine: { show: false } },
    yAxis: [
      { show: false, type: 'value', scale: true, splitLine: { show: false } },
      { show: false, type: 'value', scale: true, splitLine: { show: false } },
      { show: false, type: 'value', scale: true, splitLine: { show: false } }
    ],
    series: [
      {
        name: 'CPU Core Use',
        yAxisIndex: 0,
        data: cpuHistory,
        type: 'line',
        connectNulls: false,
                                smooth: true,
        symbol: 'none',
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 1, color: '#10b981' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.2)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0)' }
            ]
          }
        }
      },
      {
        name: 'Physical Memory Delta',
        yAxisIndex: 1,
        data: memoryHistory,
        type: 'line',
        connectNulls: false,
        smooth: true,
        symbol: 'none',
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 1, color: '#f59e0b' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0)' }
            ]
          }
        }
      },
      {
        name: 'Cloudflare Edge Latency',
        yAxisIndex: 2,
        data: latencyHistory,
        type: 'line',
        connectNulls: false,
        smooth: true,
        symbol: 'none',
        itemStyle: { color: '#06b6d4' },
        lineStyle: { width: 1, color: '#06b6d4' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.2)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0)' }
            ]
          }
        }
      }
    ]
  };

  return (
    <div className="h-32 w-full">
      <ReactECharts ref={chartRef} option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
