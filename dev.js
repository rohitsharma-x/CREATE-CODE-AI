const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 Starting CreateCode AI Full-Stack Application...');
console.log('   Backend API:  http://localhost:5000');
console.log('   Frontend App: http://localhost:5173');
console.log('====================================================');

// 1. Start Backend Server
const server = spawn('node', ['server/src/server.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: 5000 },
});

// 2. Start Frontend Vite Server
const client = spawn('npm', ['run', 'dev', '--prefix', 'client'], {
  stdio: 'inherit',
  shell: true,
});

server.on('error', (err) => console.error('[Backend Error]:', err));
client.on('error', (err) => console.error('[Frontend Error]:', err));

process.on('SIGINT', () => {
  server.kill();
  client.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  client.kill();
  process.exit(0);
});

