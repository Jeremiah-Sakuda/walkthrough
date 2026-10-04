import { spawn } from 'node:child_process';
const children = [spawn(process.execPath, ['--watch','--env-file-if-exists=.env','server/index.mjs'], {stdio:'inherit'}), spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5173'],{stdio:'inherit'})];
for (const sig of ['SIGINT','SIGTERM']) process.on(sig, () => {children.forEach(c=>c.kill(sig));process.exit(0)});
children.forEach(c=>c.on('exit', code=>{if(code){children.forEach(p=>p.kill());process.exit(code)}}));
