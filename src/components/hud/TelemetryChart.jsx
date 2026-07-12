import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function TelemetryChart() {
  const { cpuHistory, memoryHistory, latencyHistory } = useDesktopAgentStore();

  const option = {
    backgroundColor: 'transparent',
    tooltip: { show: true, trigger: 'axis' },
    legend: {
      show: true,
      textStyle: { color: '#94a3b8', fontSize: 9 },
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8
    },
    grid: { top: 10, bottom: 25, left: 10, right: 10, containLabel: false },
    xAxis: { show: false, type: 'category' },
    yAxis: [
      { show: false, type: 'value', scale: true },
      { show: false, type: 'value', scale: true },
      { show: false, type: 'value', scale: true }
    ],
    series: [
      {
        name: 'CPU Core Use',
        yAxisIndex: 0,
        data: cpuHistory,
        type: 'line',
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
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
