// import { Injectable } from '@nestjs/common';
// import { Twilio } from 'twilio';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class PhoneService {

//     private twilioClient: Twilio;

//   constructor(private readonly configService: ConfigService) {
//     this.twilioClient = new Twilio(
//       configService.get('TWILIO_ACCOUNT_SID'),
//       configService.get('TWILIO_AUTH_TOKEN'),
//     );
//   }
//   async sendCode(phone: string, message: string){
//     const result = await this.twilioClient.messages.create({
//         body: message,
//         from: this.configService.get('TWILIO_PHONE_NUMBER'),
//         to: phone,
//       });
//   }
// }
