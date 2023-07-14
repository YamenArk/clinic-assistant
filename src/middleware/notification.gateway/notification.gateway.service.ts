import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationGatewayService {
    @WebSocketServer() server: Server;

    sendNotification(userId: string, message: string) {
      // Send a notification to the client with the specified user ID
      this.server.to(userId).emit('notification', message);
    }
}
