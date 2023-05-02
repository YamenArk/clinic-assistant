import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Admin } from 'src/typeorm/entities/admin';
import { CreateAdminParams } from 'src/utils/types';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';
import * as bcrypt from 'bcryptjs'
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/middleware/mail/mail.service';
import { CACHE_MANAGER, CacheInterceptor, CacheModule } from '@nestjs/common'; // import CACHE_MANAGER
import { Inject } from '@nestjs/common';

@Injectable()
export class AdminsService {
    constructor (
        private jwtService : JwtService,
        @InjectRepository(Admin) 
        private adminRepository : Repository<Admin>,
        private readonly mailService: MailService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        ){}



    async findAdmins(){
      const select: Array<keyof Admin> =['adminId', 'email', 'phonenumber', 'createdAt'];
        const admins =  await this.adminRepository.find({select, where:{ isAdmin : false}});
        return {admins};
    }
    async createAdmin(adminDetails: CreateAdminParams) {
        const duplicates = await this.adminRepository.findOne({ where: { email: adminDetails.email } });
        if (duplicates) {
          throw new BadRequestException(`admin with name "${adminDetails.email}" already exists"`);
        }
      
        const newAdmin = this.adminRepository.create({
          ...adminDetails,
        //   password: hashedPassword, // store the hashed password
          createdAt: new Date(),
        });
      
        // Validate the newAdmin object using class-validator
        const errors = await validate(newAdmin);
        if (errors.length > 0) {
          throw new HttpException(`Validation failed: ${errors.join(', ')}`, HttpStatus.BAD_REQUEST);
        }
      
        return this.adminRepository.save(newAdmin);
      }
    
     
    async login(authLoginDto: AuthLoginDto) {
        const { email, password } = authLoginDto;
        const admin = await this.adminRepository.findOne({ where: { email: email } });
      
        if (!admin) {
          throw new UnauthorizedException('Invalid credentials');
        }
      
        const isPasswordMatch = await bcrypt.compare(password, admin.password); // compare the hashed passwords
        if (!isPasswordMatch) {
          throw new UnauthorizedException('Invalid credentials');
        }
      
        const payload = {
          adminId: admin.adminId,
        };
      
        return {
          access_token: this.jwtService.sign(payload),
        };
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
