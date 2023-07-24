import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/typeorm/entities/patient';
import { PatientNotification } from 'src/typeorm/entities/patient-notification';
import { ConsoleLogger, HttpException, HttpStatus } from '@nestjs/common';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Doctornotification } from 'src/typeorm/entities/doctor-notification';
import { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';

let server1;
@WebSocketGateway()
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    @InjectRepository(PatientNotification) 
      private patientNotificationRepository: Repository<PatientNotification>,
      @InjectRepository(Doctornotification) 
      private doctornotificationRepository: Repository<Doctornotification>,
  ) {
  }

  @WebSocketServer() public server: Server;


  ///////////////////////////////////for doctor  
  async sendNotificationForDoctor(doctorId: number, message: string) {
    try{
       // fetch the client's socket id from the database
    const doctor = await this.doctorRepository.findOne({
      where: { doctorId },
    })
    if (!doctor ) {
      throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
    }
    const socketId = doctor.socketId; 
    if(!socketId || !server1)
    {
      const doctornotification =  await this.doctornotificationRepository.create({
        message : message,
        doctor : doctor
      })
      await this.doctornotificationRepository.save(doctornotification)
    }
    else
    {
        await server1.to(socketId).emit('notification', { message: message });
    }  
    }catch (error) {
      const socket: Socket = null;
      socket.emit('error', { message: error.message });
      socket.disconnect(); // Disconnect the socket if an error occurs
    }
  }
  


  async  handleDoctorConnection(socket: Socket) {
    try{
        // handle doctor connection logic here
    const doctorId = parseInt(socket.handshake.query.doctorId as string, 10);
    if(!doctorId)
    {
      throw new HttpException(`doctor Id must be included`, HttpStatus.NOT_FOUND);
    }
    const doctor = await this.doctorRepository.findOne({
      where: { doctorId },
    });
    if(!doctor)
    {
      throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
    }
    const oldSocketId = doctor.socketId;
    let oldSocket;

    // Check if the patient is already connected
    if (oldSocketId && oldSocketId !== socket.id) {
      const sockets = await server1.sockets.sockets;
      oldSocket = sockets.get(oldSocketId);
      if (oldSocket) {
          await oldSocket.disconnect();
        await this.handleDoctorDisconnect(oldSocket);
      }
    }
    doctor.socketId = socket.id;
    await this.doctorRepository.save(doctor);

    //send old notifications
    const doctornotification =  await this.doctornotificationRepository.find({
      where :{
        doctor : {
          doctorId :  doctorId 
        }
      }
    })
    if(doctornotification.length != 0)
    {
      let i = 0;
      while(doctornotification[i]){
        await this.sendNotificationForDoctor(doctorId, doctornotification[i].message);
        await this.doctornotificationRepository.delete(doctornotification[i])
        i++;
      }
    }
    }catch (error) {
    socket.emit('error', { message: error.message });
    socket.disconnect(); // Disconnect the socket if an error occurs
    }
  }

  async  handleDoctorDisconnect(socket: Socket) {
    try{
      const doctorId = parseInt(socket.handshake.query.doctorId as string, 10);
      const doctor = await this.doctorRepository.findOne({
        where: { doctorId },
      });
      if(!doctor)
      {
        throw new HttpException(`doctor with id ${doctorId} not found`, HttpStatus.NOT_FOUND);
      }
      doctor.socketId = null;
      await this.doctorRepository.save(doctor);
    }catch (error) {
      socket.emit('error', { message: error.message });
    }
  }



  ////////////////////////////////////for patient
  async sendNotification(patientId: number, message: string) {
    try{
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
    }catch (error) {
      const socket: Socket = null;
      socket.emit('error', { message: error.message });
       socket.disconnect(); // Disconnect the socket if an error occurs  
    }
  }



  async sendNumberOfUnReadMessages(patientId: number,numberOfUnRead : number) {
    try{
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
    }catch (error) {
      const socket: Socket = null;
      socket.emit('error', { message: error.message });
      socket.disconnect(); // Disconnect the socket if an error occurs
    } 
  }

  
  async  handlePatientConnection(socket: Socket) {
    try
    {
      const token = socket.handshake.query.token as string;
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload; // Decode the token using the secret key and cast to JwtPayloax
      const patientId = decodedToken.patientId;
      const patient = await this.patientRepository.findOne({
        where: { patientId },
      });
      if(!patient)
      {
        await socket.disconnect();
        throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
      }
      
      const oldSocketId = patient.socketId;
      let oldSocket;

      // Check if the patient is already connected
      if (oldSocketId && oldSocketId !== socket.id) {
        const sockets = await server1.sockets.sockets;
        oldSocket = sockets.get(oldSocketId);
        if (oldSocket) {
            await oldSocket.disconnect();
          await this.handlePatientDisconnect(oldSocket);
        }
      }
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

    }catch (error) {
      socket.emit('error', { message: error.message });
      await socket.disconnect();

  }
  }

  async  handlePatientDisconnect(socket: Socket) {
    try{
      const token = socket.handshake.query.token as string;
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload; // Decode the token using the secret key and cast to JwtPayloax
      const patientId = decodedToken.patientId;

      const patient = await this.patientRepository.findOne({
        where: { patientId },
      });

      if(!patient)
      {
        throw new HttpException(`patient with id ${patientId} not found`, HttpStatus.NOT_FOUND);
      }
        patient.socketId = null;
        await this.patientRepository.save(patient);
    }catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  ///////////////////////////////////////for both
  async handleConnection(socket: Socket) {
    if(!server1)
    {
      server1 = this.server;
    }  
    try{
      const role = socket.handshake.query.role as string;
      if (role === 'patient') {
        await this.handlePatientConnection(socket);
      } else if (role === 'doctor') {
        await this.handleDoctorConnection(socket);
      }else {
        throw new HttpException(`invalid role: ${role}`, HttpStatus.BAD_REQUEST);
       }
    }catch (error) {
      socket.emit('error', { message: error.message });
      await socket.disconnect();
    }
  }


  async handleDisconnect(socket: Socket) {
    try{
      const role = socket.handshake.query.role as string;
      if (role === 'patient') {
        await this.handlePatientDisconnect(socket);
      } else if (role === 'doctor') {
        await this.handleDoctorDisconnect(socket);
      }else {
        throw new HttpException(`invalid role: ${role}`, HttpStatus.BAD_REQUEST);
       }
    }catch (error) {
      socket.emit('error', { message: error.message });
      socket.disconnect(); // Disconnect the socket if an error occurs
    }
  }
}