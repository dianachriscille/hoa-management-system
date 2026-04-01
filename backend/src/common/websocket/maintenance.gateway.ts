import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL }, namespace: '/' })
export class MaintenanceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(MaintenanceGateway.name);

  constructor(private jwtService: JwtService, private config: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      const payload = this.jwtService.verify(token, { publicKey: this.config.get('app.jwtPublicKey'), algorithms: ['RS256'] });
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${payload.sub}`);
    } catch {
      this.logger.warn('Unauthorized WebSocket connection attempt');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.data.userId}`);
  }

  broadcastStatusUpdate(userId: string, payload: { requestId: string; requestNumber: string; newStatus: string }) {
    this.server.to(`user:${userId}`).emit('maintenance:status-update', payload);
  }
}
