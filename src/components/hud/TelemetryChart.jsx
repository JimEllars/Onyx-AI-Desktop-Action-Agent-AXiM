import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

export default function TelemetryChart() {
  const { cpuLoad, cpuHistory } = useDesktopAgentStore();

  const option = {
    backgroundColor: 'transparent',
    tooltip: { show: false },
    grid: { top: 10, bottom: 10, left: 10, right: 10 },
    xAxis: { show: false, type: 'category' },
    yAxis: { show: false, type: 'value', min: 0, max: 100 },
    series: [
      {
        data: cpuHistory,
        type: 'line',
        smooth: true,
        symbol: 'none',
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
      }
    ]
  };

  return (
    <div className="h-24 w-full">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}