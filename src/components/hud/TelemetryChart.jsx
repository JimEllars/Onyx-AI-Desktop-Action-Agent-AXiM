import React, { useRef, useEffect, Component } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDesktopAgentStore } from '../../store/useDesktopAgentStore';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error('Chart Error:', error, errorInfo); }
  render() {
    if (this.state.hasError) return <div className="h-32 w-full flex items-center justify-center text-red-500 text-xs">[CHART_RENDER_ERROR]</div>;
    return this.props.children;
  }
}


export default function TelemetryChart() {
  const cpuHistory = useDesktopAgentStore(state => state.cpuHistory);
  const memoryHistory = useDesktopAgentStore(state => state.memoryHistory);
  const latencyHistory = useDesktopAgentStore(state => state.latencyHistory);
  const telemetrySource = useDesktopAgentStore(state => state.telemetrySource);
  const networkLatencyMs = useDesktopAgentStore(state => state.networkLatencyMs);
  const heartbeatStatus = useDesktopAgentStore(state => state.heartbeatStatus);

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
    animationDurationUpdate: 500,
    animationEasingUpdate: 'linear',
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
    <ErrorBoundary>
      <div className="relative h-32 w-full">
        <div className="absolute top-0 right-2 z-10 flex flex-col items-end pointer-events-none text-[8px] font-mono opacity-80 mt-1">
          <div className="flex items-center gap-1">
             <span className="text-slate-400">RTT:</span>
             <span className={networkLatencyMs < 50 ? 'text-emerald-400' : 'text-amber-400'}>{Math.round(networkLatencyMs)}ms</span>
          </div>
          <div className="flex items-center gap-1">
             <span className="text-slate-400">PKT_DROP:</span>
             <span className="text-emerald-400">0.0%</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
             <span className="text-slate-400">ORIGIN:</span>
             <span className={
         heartbeatStatus === 'nominal' ? 'text-emerald-400 uppercase' :
         heartbeatStatus === 'degraded' ? 'text-amber-400 uppercase animate-pulse' :
         'text-red-400 uppercase'
       }>{heartbeatStatus || 'standby'}</span>
          </div>
        </div>
        <ReactECharts ref={chartRef} option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </ErrorBoundary>
  );
}
