const fs = require('fs');
const file = 'src/store/useDesktopAgentStore.js';
let code = fs.readFileSync(file, 'utf8');

// Replace { id: 1, role: 'assistant', text: 'OnyX Mk3 Online. Vector systems initialized. Awaiting architectural commands, Sir.' }
// with timestamp: new Date()
code = code.replace(
  /\{ id: 1, role: 'assistant', text: 'OnyX Mk3 Online\. Vector systems initialized\. Awaiting architectural commands, Sir\.' \}/,
  "{ id: 1, role: 'assistant', text: 'OnyX Mk3 Online. Vector systems initialized. Awaiting architectural commands, Sir.', timestamp: new Date() }"
);

// Replace addMessage: (msg) => set((state) => ({ messages: [...state.messages, { ...msg, id: Date.now() }] })),
// with timestamp: new Date()
code = code.replace(
  /addMessage: \(msg\) => set\(\(state\) => \(\{ \n\s*messages: \[\.\.\.state\.messages, \{ \.\.\.msg, id: Date\.now\(\) \}\] \n\s*\}\)\),/,
  `addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Date.now(), timestamp: new Date() }]
  })),`
);

fs.writeFileSync(file, code);
