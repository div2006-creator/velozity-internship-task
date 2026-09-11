import http from 'http';
import app from './app';
import { initWebSocketServer } from './websocket';
import { initOverdueScheduler } from './services/overdueScheduler';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize WebSocket server
initWebSocketServer(server);

// Initialize background overdue task scheduler
initOverdueScheduler();

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Healthcheck route: http://localhost:${PORT}/api/health`);
  console.log(`⚡ WebSocket server listening on ws://localhost:${PORT}`);
  console.log(`⏰ Overdue task background scheduler running...`);
});
