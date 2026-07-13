const fs = require('fs');
const file = 'src/components/hud/TelemetryChart.jsx';
let code = fs.readFileSync(file, 'utf8');

const hookCode = `
  useEffect(() => {
    const handleResize = () => {
      chartRef.current?.getEchartsInstance().resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
`;

// Insert the new hook right after the first useEffect
code = code.replace(
  /(\}, \[cpuHistory, memoryHistory, latencyHistory\]\);)/,
  `$1\n${hookCode}`
);

fs.writeFileSync(file, code);
