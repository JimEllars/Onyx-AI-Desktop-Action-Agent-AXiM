import re

with open("src/components/hud/ActionConsole.jsx", "r") as f:
    content = f.read()

# Replace the conditional styles logic
search = """            const isError = log.text?.includes('[ERROR]');
            const isFault = log.text?.includes('[FAULT]');
            const isIdentity = log.text?.includes('[IDENTITY]');
            const isConnect = log.text?.includes('[CONNECT]') || log.text?.includes('[CLOUDFLARE_EDGE]');
            const isRecovery = log.text?.includes('[RECOVERY]') || log.text?.includes('[RESET]');"""

replace = """            const isError = log.text?.includes('[ERROR]');
            const isFault = log.text?.includes('[FAULT]');
            const isIdentity = log.text?.includes('[IDENTITY]');
            const isConnect = log.text?.includes('[CONNECT]') || log.text?.includes('[CLOUDFLARE_EDGE]');
            const isRecovery = log.text?.includes('[RECOVERY]') || log.text?.includes('[RESET]');
            const isAsguardShield = log.text?.includes('[ASGUARD_SHIELD]');
            const isEnrichment = log.text?.includes('[ENRICHMENT]');"""

content = content.replace(search, replace)

search_styles = """                <span className={`${
                  isIdentity ? 'text-amber-400 tracking-wide font-bold' :
                  isConnect ? 'text-purple-400' :
                  isRecovery ? 'text-cyan-400 font-bold' :
                  isError ? 'text-red-400' :
                  isFault ? 'text-amber-500' :
                  log.type === 'action' ? 'text-cyan-400' :
                  log.type === 'task' ? 'text-emerald-400' : 'text-slate-400'
                }`}>"""

replace_styles = """                <span className={`${
                  isAsguardShield ? 'text-red-400 font-bold tracking-wide animate-pulse' :
                  isEnrichment ? 'text-emerald-400 tracking-wide font-medium' :
                  isIdentity ? 'text-amber-400 tracking-wide font-bold' :
                  isConnect ? 'text-purple-400' :
                  isRecovery ? 'text-cyan-400' :
                  isError ? 'text-red-400' :
                  isFault ? 'text-amber-500' :
                  log.type === 'action' ? 'text-cyan-400' :
                  log.type === 'task' ? 'text-emerald-400' : 'text-slate-400'
                }`}>"""

content = content.replace(search_styles, replace_styles)

with open("src/components/hud/ActionConsole.jsx", "w") as f:
    f.write(content)
