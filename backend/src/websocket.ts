import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let wss: WebSocketServer | null = null;

// Room mapping: Room name -> Set of connected WebSocket clients
const rooms = new Map<string, Set<WebSocket>>();

// Reverse mapping: WebSocket client -> Set of joined room names
const clientRooms = new Map<WebSocket, Set<string>>();

export function initWebSocketServer(server: HttpServer): WebSocketServer {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    clientRooms.set(ws, new Set<string>());

    ws.send(JSON.stringify({
      event: 'CONNECTED',
      message: 'Connected to Client Project Dashboard WebSocket server',
      timestamp: new Date().toISOString(),
    }));

    ws.on('message', async (messageBuffer: Buffer) => {
      try {
        const data = JSON.parse(messageBuffer.toString());
        const { action, room, limit, projectId, userId } = data;

        if (action === 'join' && typeof room === 'string') {
          joinRoom(ws, room);
        } else if (action === 'leave' && typeof room === 'string') {
          leaveRoom(ws, room);
        } else if ((action === 'auth' || action === 'join_user') && typeof userId === 'string') {
          joinRoom(ws, `user:${userId}`);
          ws.send(JSON.stringify({
            event: 'USER_CHANNEL_SUBSCRIBED',
            userId,
            room: `user:${userId}`,
            timestamp: new Date().toISOString(),
          }));
        } else if (action === 'request_recent_activities' || action === 'get_missed_events') {
          await handleMissedEventsResync(ws, limit, projectId);
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      removeClientFromAllRooms(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
      removeClientFromAllRooms(ws);
    });
  });

  console.log('🚀 WebSocket server initialized with room & user notifications support');
  return wss;
}

/**
 * Executes a direct PostgreSQL database query to retrieve the last 20 activity logs.
 * No in-memory cache is used for this requirement.
 */
async function handleMissedEventsResync(ws: WebSocket, limitInput?: any, projectIdInput?: any): Promise<void> {
  try {
    const limit = Math.min(Number(limitInput) || 20, 50);
    const projectId = typeof projectIdInput === 'string' ? projectIdInput : undefined;

    // DIRECT DATABASE QUERY - No in-memory caching
    const rawLogs = await prisma.activityLog.findMany({
      where: projectId ? { projectId } : {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const activities = rawLogs.map(log => {
      let parsedDetails: any = null;
      try {
        if (log.details) parsedDetails = JSON.parse(log.details);
      } catch (err) {
        parsedDetails = { message: log.details };
      }

      return {
        id: log.id,
        action: log.action,
        timestamp: log.createdAt,
        user: log.user,
        project: log.project,
        task: log.task,
        oldStatus: parsedDetails?.oldStatus || null,
        newStatus: parsedDetails?.newStatus || null,
        formattedMessage: parsedDetails?.formattedMessage || parsedDetails?.message || null,
        details: parsedDetails,
      };
    });

    ws.send(JSON.stringify({
      event: 'MISSED_EVENTS_RESYNC',
      count: activities.length,
      limit,
      projectId: projectId || null,
      activities,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching missed activity logs from database:', error);
    ws.send(JSON.stringify({
      event: 'ERROR',
      error: 'Failed to query missed activity logs from database',
    }));
  }
}

function joinRoom(ws: WebSocket, room: string): void {
  if (!rooms.has(room)) {
    rooms.set(room, new Set<WebSocket>());
  }
  rooms.get(room)!.add(ws);

  if (!clientRooms.has(ws)) {
    clientRooms.set(ws, new Set<string>());
  }
  clientRooms.get(ws)!.add(room);

  ws.send(JSON.stringify({
    event: 'ROOM_JOINED',
    room,
    timestamp: new Date().toISOString(),
  }));
}

function leaveRoom(ws: WebSocket, room: string): void {
  if (rooms.has(room)) {
    rooms.get(room)!.delete(ws);
    if (rooms.get(room)!.size === 0) {
      rooms.delete(room);
    }
  }

  if (clientRooms.has(ws)) {
    clientRooms.get(ws)!.delete(room);
  }

  ws.send(JSON.stringify({
    event: 'ROOM_LEFT',
    room,
    timestamp: new Date().toISOString(),
  }));
}

function removeClientFromAllRooms(ws: WebSocket): void {
  const joinedRooms = clientRooms.get(ws);
  if (joinedRooms) {
    joinedRooms.forEach((room) => {
      if (rooms.has(room)) {
        rooms.get(room)!.delete(ws);
        if (rooms.get(room)!.size === 0) {
          rooms.delete(room);
        }
      }
    });
  }
  clientRooms.delete(ws);
}

/**
 * Targeted WebSocket push to a specific user (room: "user:{userId}").
 * Used to push real-time unread count updates.
 */
export function pushToUser(userId: string, event: string, payload: any): void {
  const userRoom = `user:${userId}`;
  broadcastToRoom(userRoom, event, payload);
}

/**
 * Broadcast event exclusively to clients connected to specified room (e.g. "project:proj-123" or "user:user-456").
 */
export function broadcastToRoom(room: string, event: string, payload: any): void {
  const message = JSON.stringify({
    event,
    room,
    payload,
    timestamp: new Date().toISOString(),
  });

  const roomClients = rooms.get(room);
  if (roomClients && roomClients.size > 0) {
    roomClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Also broadcast to global clients if not user-specific room
  if (!room.startsWith('user:')) {
    broadcastEvent(event, { ...payload, room });
  }
}

/**
 * Broadcast event to all connected WebSocket clients.
 */
export function broadcastEvent(event: string, payload: any): void {
  if (!wss) return;

  const message = JSON.stringify({
    event,
    payload,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
