import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Admin } from 'src/typeorm/entities/admin';
import { CreateAdminParams, filterNameParams, updateAdminParams } from 'src/utils/types';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';
import * as bcrypt from 'bcryptjs'
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/middleware/mail/mail.service';
import { CACHE_MANAGER } from '@nestjs/common'; // import CACHE_MANAGER
import { Inject } from '@nestjs/common';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Secretary } from 'src/typeorm/entities/secretary';

@Injectable()
export class AdminsService {
    constructor (
        private jwtService : JwtService,
        @InjectRepository(Doctor) 
        private doctorRepository : Repository<Doctor>,
        @InjectRepository(Secretary) 
        private secretaryRepository : Repository<Secretary>,
        @InjectRepository(Admin) 
        private adminRepository : Repository<Admin>,
        private readonly mailService: MailService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        ){}



    async findAdmins(){
      const select: Array<keyof Admin> =['adminId', 'email', 'phonenumber', 'firstname','lastname','active'];
        const admins =  await this.adminRepository.find({select, where:{ isAdmin : false}});
        return {admins};
    }
    async createAdmin(adminDetails: CreateAdminParams) {
      const email = adminDetails.email;
       //doctor duplicates
       const doctorDuplicates = await this.doctorRepository.findOne({ where: { email: email } });
       if (doctorDuplicates) {
         throw new BadRequestException(`"${email}" already exists"`);
       }

      //admin duplicates
      const adminDuplicates = await this.adminRepository.findOne({ where: { email: email } });
      if (adminDuplicates) {
        throw new BadRequestException(`"${email}" already exists"`);
      }

      //secretary duplicates
      const secretaryDuplicates = await this.secretaryRepository.findOne({ where: { email:email } });
      if (secretaryDuplicates) {
        throw new BadRequestException(`"${email}" already exists"`);
     }
      
      const newAdmin = this.adminRepository.create({
        ...adminDetails,
        active : true,
        createdAt: new Date(),
      });
    
      // Validate the newAdmin object using class-validator
      const errors = await validate(newAdmin);
      if (errors.length > 0) {
        throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
      }
    
      return this.adminRepository.save(newAdmin);
    }
    

    
    
    async filterAdminByName(filte :filterNameParams ){
      const query =  this.adminRepository.createQueryBuilder('admin')
      .select(['admin.adminId','admin.email','admin.phonenumber','admin.firstname','admin.lastname','admin.active',])
      .where('CONCAT(admin.firstname, " ", admin.lastname) LIKE :name', {
        name: `%${filte.filterName}%`,
      })
      const admins = await query.getMany();
      if(admins.length === 0)
      {
          throw new HttpException(`No admin met the conditions `, HttpStatus.NOT_FOUND);
      }
      return {admins : admins};
    }


    


    async updateAdmin(adminId: number, updateAdmin: updateAdminParams) {
      const admin  = await this.adminRepository.findOne({where : {adminId : adminId}});
      if (!admin ) {
          throw new HttpException(`admin with id ${adminId} not found`, HttpStatus.NOT_FOUND);
        }
      // Create a new Doctor object with the updated properties
      const updatedAdmin = this.adminRepository.create({ ...admin, ...updateAdmin });

      // Validate the updatedDoctor object using class-validator
      const errors = await validate(updatedAdmin);
      if (errors.length > 0) {
        throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
      }

      // Update the doctor in the database
      await this.adminRepository.update(adminId, updateAdmin);
    }



      async sendResetEmail(email: string) {
        const admin = await this.adminRepository.findOne({where: {email : email}});

        if (!admin) {
          throw new HttpException(
            `admin not found`,
            HttpStatus.NOT_FOUND,
          );
        }    
        const code = Math.floor(10000 + Math.random() * 90000);
        const message = `Please reset your password using this code: ${code}`;
        await this.mailService.sendMail(admin.email , 'Password reset', message);
      
        // Cache the generated code for 5 minutes
        const cacheKey = `resetCodeForAdmin-${admin.adminId}`;
        await this.cacheManager.set(cacheKey, code, { ttl: 300 });
        return admin.adminId;
      }
    
      async resetPassword(adminId: number, code: number, newPassword: string): Promise<void> {
        const admin = await this.adminRepository.findOne({where: {adminId : adminId}});
        
        if (!admin) {
          throw new HttpException(
            `Doctor with id ${admin} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
      
        const cacheKey = `resetCodeForAdmin-${admin.adminId}`;
        const cachedCode = await this.cacheManager.get(cacheKey);
        if (!cachedCode || cachedCode !== code) {
          throw new HttpException(
            `Invalid reset code for doctor with id ${admin.adminId}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10); // hash the password
        admin.password = hashedPassword;
        await this.adminRepository.save(admin);
      }
}
