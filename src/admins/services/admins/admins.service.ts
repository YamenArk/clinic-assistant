import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Admin } from 'src/typeorm/entities/admin';
import { CreateAdminParams } from 'src/utils/types';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';

import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminsService {
    constructor (
        private jwtService : JwtService,
        @InjectRepository(Admin) 
        private adminRepository : Repository<Admin>
        ){}



    findAdmins(){
        return this.adminRepository.find({ where:{ isAdmin : false}});
    }
    async createAdmin(adminDetails : CreateAdminParams){
        const duplicates = await this.adminRepository.findOne({where : {email : adminDetails.email}})
        if (duplicates) {
            throw new BadRequestException(`admin with name "${adminDetails.email}" already exists"`);
          }
        const newAdmin = this.adminRepository.create({
            ...adminDetails,
            createdAt : new Date()
        });
    
        // Validate the updatedDoctor object using class-validator
        const errors = await validate(newAdmin);
        if (errors.length > 0) {
            throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
        }
        return this.adminRepository.save(newAdmin);
    }
  
    
    async login(AuthLoginDto : AuthLoginDto){
        const {email,password} = AuthLoginDto
        const admin = await this.adminRepository.findOne({where :{email : email}})
        console.log(admin)
        //check the password ..
        const payload = {
            adminId : admin.adminId
        }
        return  {
            access_token : this.jwtService.sign(payload)
        };
    }

}
