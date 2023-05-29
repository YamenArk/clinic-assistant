import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthLoginDto } from 'src/patients/dtos/AuthLogin.dto';
import { Patient } from 'src/typeorm/entities/patient';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { patientSignUp } from 'src/utils/types';
import { verifyParams } from 'src/utils/types';

import { validate } from 'class-validator';
import { CACHE_MANAGER} from '@nestjs/common'; // import CACHE_MANAGER

import { v4 as uuid } from 'uuid';

@Injectable()
export class PatientsService {
    constructor (
        private jwtService : JwtService,
        @InjectRepository(Patient) 
        private patientRepository : Repository<Patient>,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        ){}

    async login(authLoginDto : AuthLoginDto){
        const {phoneNumber , password} = authLoginDto
        const patient = await this.patientRepository.findOne({
          where : {phoneNumber : phoneNumber,password :password},
          select : ['patientId','birthDate','firstname','lastname','profilePicture','phoneNumber','numberOfMissAppointment']
        })
        if(!patient)
        {
            // If no matching user found, throw UnauthorizedException
            throw new UnauthorizedException('Invalid credentials')
        }
        const payload = {
            patientId: patient.patientId,
            type : 4
          };  
        return {
        accessToken: this.jwtService.sign(payload),
        patient
        };
    }
    async signUp(patientSignUp : patientSignUp){

        const duplicates = await this.patientRepository.findOne({
          where : {
            phoneNumber :  patientSignUp.phoneNumber
          }
        })
        if(duplicates)
        {
          throw new BadRequestException('this phone number already exist')
        }
        const patient = new Patient();
        patient.gender = patientSignUp.gender;
        patient.phoneNumber = patientSignUp.phoneNumber;
        patient.password = patientSignUp.password;
        patient.firstname = patientSignUp.firstname;
        patient.lastname = patientSignUp.lastname;
        patient.birthDate = patientSignUp.birthDate;
        
        // generate unique identifier for patient
        const patientId = uuid();
          const code = Math.floor(10000 + Math.random() * 90000);
      console.log(code)
        // create a new object that contains both the patient and the code
        const patientData = {
          patient: patient,
          code: code
        };

        // store patient data in cache
        const cacheKey = `patient:${patientId}`;
        await this.cacheManager.set(cacheKey, patientData, { ttl: 300 });
        console.log(patientId)
        // send verification code to patient phone number using your preferred SMS service
        // ...
      

        // return success response
        return  patientId ;
      }

      async verify(verifyParams : verifyParams){
        const {patientId,code} = verifyParams
        const cacheKey = `patient:${patientId}`;
        const cachedCode = await this.cacheManager.get(cacheKey);
        if (!cachedCode || cachedCode.code !== code) {
          throw new HttpException(
            `Invalid reset code for patient with id ${patientId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        const newPatient = cachedCode.patient;
        this.patientRepository.save(newPatient);

      }
}
