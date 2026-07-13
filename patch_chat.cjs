const fs = require('fs');
const file = 'src/components/chat/ChatInterface.jsx';
let code = fs.readFileSync(file, 'utf8');

const timestampCode = `
                {msg.timestamp && (
                  <span className="text-slate-500 font-mono text-[10px] select-none pr-2">
                    [{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                )}
`;

code = code.replace(
  /<div className={msg.role === 'assistant' && \(msg\.text\.includes\("browser environment"\) \|\| msg\.text\.includes\("PowerShell"\)\) \? "block" : ""}>{msg\.text}<\/div>/,
  `${timestampCode.trim()}
                <span className={msg.role === 'assistant' && (msg.text.includes("browser environment") || msg.text.includes("PowerShell")) ? "block inline" : "inline"}>{msg.text}</span>`
);

fs.writeFileSync(file, code);
