// import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Patient } from 'src/typeorm/entities/patient';

// @WebSocketGateway()
//   export class PatientMessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   constructor(
//     @InjectRepository(Patient) 
//       private patientRepository : Repository<Patient>,
//   ) {
//     console.log('PatientMessagingGateway instantiated');
//   }

//   @WebSocketServer() server: Server;


//   async sendNotification(patientId: number, message: string) {
//     console.log("helooooooooo")

//     // fetch the client's socket id from the database
//     const patient = await this.patientRepository.findOne({
//         where : {
//             patientId : patientId
//         }
//     })
//     const socketId = patient.socketId;
//     console.log(socketId)
//     // send the notification to the client
//     if (socketId) {
//       console.log(this.server)
//       this.server.to(socketId).emit('notification', message);
//     }
//   }




//   async handleConnection(socket: Socket) {


//     const patientId = parseInt(socket.handshake.query.patientId as string, 10);
//     const patient = await this.patientRepository.findOne({
//         where : {
//             patientId : patientId
//         }
//     })
//     patient.socketId = socket.id;
        
//     console.log(socket.id)
//     await this.patientRepository.save(patient);
//   }

//   async handleDisconnect(socket: Socket) {
//     console.log("helooooooooo")

//     const patientId = parseInt(socket.handshake.query.patientId as string, 10);
//     const patient = await this.patientRepository.findOne({
//         where : {
//             patientId : patientId
//         }
//     })
//     patient.socketId = null;
//     await this.patientRepository.save(patient);
//   }
// }


// import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Patient } from 'src/typeorm/entities/patient';

// @WebSocketGateway()
// export class PatientMessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   constructor(
//     @InjectRepository(Patient) private patientRepository: Repository<Patient>,
//   ) {
//     console.log('PatientMessagingGateway instantiated');
//   }

//   @WebSocketServer() public server: Server;

//   async sendNotification(patientId: number, message: string) {
//     console.log("sendNotification");
//     console.log( this.server);

//     // fetch the client's socket id from the database
//     const patient = await this.patientRepository.findOne({
//       where: { patientId },
//     });
//     const socketId = patient.socketId;
//     // send the notification to the client
//     if (socketId && this.server) {
//       this.server.to(socketId).emit('notification', message);
//     }
//   }

//   async handleConnection(socket: Socket) {
//     const patientId = parseInt(socket.handshake.query.patientId as string, 10);
//     const patient = await this.patientRepository.findOne({
//       where: { patientId },
//     });
//     patient.socketId = socket.id;
//     console.log('handleConnection', this.server);
//     await this.patientRepository.save(patient);
//   }

//   async handleDisconnect(socket: Socket) {
//     const patientId = parseInt(socket.handshake.query.patientId as string, 10);
//     const patient = await this.patientRepository.findOne({
//       where: { patientId },
//     });
//     patient.socketId = null;
//     console.log('handleDisconnect');
//     await this.patientRepository.save(patient);
//   }
// }



import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/typeorm/entities/patient';
import { PatientNotification } from 'src/typeorm/entities/patient-notification';
import { HttpException, HttpStatus } from '@nestjs/common';
let server1;
// @WebSocketGateway()
// export class PatientMessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() public server: Server;

//   private static instance: PatientMessagingGateway;

//   constructor(
//     @InjectRepository(Patient) 
//     private patientRepository: Repository<Patient>,
//     @InjectRepository(PatientNotification) 
//     private patientNotificationRepository: Repository<PatientNotification>,
//     ) {
//   }

//   static getInstance(patientRepository: Repository<Patient>): PatientMessagingGateway {
//     if (!PatientMessagingGateway.instance) {
//       PatientMessagingGateway.instance = new PatientMessagingGateway(patientRepository);
//     }
//     return PatientMessagingGateway.instance;
//   }


@WebSocketGateway()
export class PatientMessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(PatientNotification) 
      private patientNotificationRepository: Repository<PatientNotification>,
  ) {
  }

  @WebSocketServer() public server: Server;

  async sendNotification(patientId: number, message: string) {
    // fetch the client's socket id from the database
    const patient = await this.patientRepository.findOne({
      where: { patientId },
    });
    if (!patient ) {
      throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
    }
    const socketId = patient.socketId; 
    if(!socketId || !server1)
    {
      const patientNotification =  await this.patientNotificationRepository.create({
        message : message,
        patient : patient
      })
      await this.patientNotificationRepository.save(patientNotification)
    }
    else
    {
        // send the notification to the client
        const success = await server1.to(socketId).emit('notification', { message: message });
        if (success) {
          console.log(`Notification sent to socket ${socketId}`);
        } else {
          console.log(`Failed to send notification to socket ${socketId}`);
        }
    }
  }



  async sendNumberOfUnReadMessages(patientId: number,numberOfUnRead : number) {

    // fetch the client's socket id from the database
    const patient = await this.patientRepository.findOne({
      where: { patientId },
    });
    if(!patient)
    {
      throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
    }
    const socketId = patient.socketId;
    // send the notification to the client
    if (socketId && server1) {
        server1.to(socketId).emit('numberOfUnRead',{
          numberOfUnRead : numberOfUnRead
        } );
      
    }
  }

  async handleConnection(socket: Socket) {
    const patientId = parseInt(socket.handshake.query.patientId as string, 10);
    const patient = await this.patientRepository.findOne({
      where: { patientId },
    });
    if(!patient)
    {
      throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
    }
    server1 = this.server;
    patient.socketId = socket.id;
    await this.patientRepository.save(patient);

    //send old notifications
    const patientNotification =  await this.patientNotificationRepository.find({
      where :{
        patient : {
          patientId : patientId
        }
      }
    })
    if(patientNotification.length != 0)
    {
      let i = 0;
      while(patientNotification[i]){
        await this.sendNotification(patientId, patientNotification[i].message);
        await this.patientNotificationRepository.delete(patientNotification[i])
        i++;
      }
    }

    //send number Of UnRead
    const numberOfUnRead = patient.numberOfDelay + patient.numberOfReminder;
    await this.sendNumberOfUnReadMessages(patientId,numberOfUnRead)

  }

  async handleDisconnect(socket: Socket) {
    const patientId = parseInt(socket.handshake.query.patientId as string, 10);
    const patient = await this.patientRepository.findOne({
      where: { patientId },
    });
    if(!patient)
    {
      throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
    }
    patient.socketId = null;
    await this.patientRepository.save(patient);
  }
}