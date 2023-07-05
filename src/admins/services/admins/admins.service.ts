import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { Admin } from 'src/typeorm/entities/admin';
import { AmountCollectedByAdminParams, CreateAdminParams, filterNameParams, updateAdminParams } from 'src/utils/types';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';
import * as bcrypt from 'bcryptjs'
import { Between, Equal, In, NumericType, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/middleware/mail/mail.service';
import { CACHE_MANAGER } from '@nestjs/common'; // import CACHE_MANAGER
import { Inject } from '@nestjs/common';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Secretary } from 'src/typeorm/entities/secretary';
import { MonthlySubscription } from 'src/typeorm/entities/monthly-subscription';
import { Transctions } from 'src/typeorm/entities/transctions';
import { PayInAdvance } from 'src/typeorm/entities/pay-in-advance';

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
        @InjectRepository(PayInAdvance) 
        private payInAdvanceRepository : Repository<PayInAdvance>,
        @InjectRepository(Transctions) 
        private transctionsRepository : Repository<Transctions>,
        @InjectRepository(MonthlySubscription) 
        private monthlySubscriptionRepository : Repository<MonthlySubscription>,
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
    

    async deleteAdmin(adminId : number){
      const admin = await this.adminRepository.findOne({
        where : {
          adminId : adminId
        }
      })
      if (!admin ) {
        throw new HttpException(`admin with id ${adminId} not found`, HttpStatus.NOT_FOUND);
      }
      if(admin.isAdmin)
      {
        throw new BadRequestException(`you can not delete the admins`);
      }
      await this.adminRepository.remove(admin);
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


      async resetPassword(adminId: number, code: number, newPassword: string): Promise<void> {
        const admin = await this.adminRepository.findOne({where: {adminId : adminId}});
        
        if (!admin) {
          throw new HttpException(
            `admin with id ${admin} not found`,
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

      async getMyAccount(adminId : number){
        const admin = await this.adminRepository.findOne({
          where : {
            adminId : adminId
          },
          select : ['adminId','email','phonenumber','firstname','lastname']
        })
        if (!admin) {
          throw new HttpException(
            `admin with id ${admin} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        if(admin.isAdmin)
        {
          throw new BadRequestException('you cant get your information')
        }
        return admin;
      } 

      async MonthlySubscription(){
        const monthlySubscription = await this.monthlySubscriptionRepository.findOne({
          where :{
            id : 1
          }
        })
        if(!monthlySubscription)
        {
          throw new BadRequestException ('thier is something wrong');
        }
        return monthlySubscription.amountOfMoney
      }

      async changeMonthlySubscription(amountOfMoney : number){
        const monthlySubscription = await this.monthlySubscriptionRepository.findOne({
          where :{
            id : 1
          }
        })
        if(!monthlySubscription)
        {
          throw new BadRequestException ('thier is something wrong');
        }
        monthlySubscription.amountOfMoney = amountOfMoney;
        await this.monthlySubscriptionRepository.save(monthlySubscription);
      }

      async addMoneyToMyAccount(adminId : number,doctorId : number,amountPaid : number){
        const admin = await this.adminRepository.findOne({
          where : {
            adminId : adminId
          }
        })
        if (!admin) {
          throw new HttpException(
            `admin with id ${adminId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        const doctor = await this.doctorRepository.findOne({
          where : {
            doctorId : doctorId
          }
        })
        if (!doctor) {
          throw new HttpException(
            `doctor with id ${doctorId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        doctor.accountBalance = doctor.accountBalance + amountPaid;
        await this.doctorRepository.save(doctor);

        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const newpaid = this.payInAdvanceRepository.create({
          admin : admin,
          doctor : doctor,
          amountPaid : amountPaid,
          createdAt : today.toISOString()
        });
        await this.payInAdvanceRepository.save(newpaid);
      }


      async activeDoctor(doctorId : number,adminId : number){
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const nextMonth = now.getUTCMonth() + 1;
        const nextYear = nextMonth > 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
        const nextDate = new Date(Date.UTC(nextYear, nextMonth % 12, now.getUTCDate()));
        const doctor = await this.doctorRepository.findOne({
          where :{
            doctorId : doctorId
          }
        })
        if (!doctor) {
          throw new HttpException(
            `doctor with id ${doctorId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        const admin = await this.adminRepository.findOne({
          where :{
            adminId : adminId
          }
        })
        if (!admin) {
          throw new HttpException(
            `admin with id ${adminId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        const isActive: boolean = doctor.active;
        const isActiveString: string = isActive.toString();
        if (isActiveString === 'true') {
          throw new BadRequestException('This doctor is already active');
        }
        const monthlySubscription = await this.monthlySubscriptionRepository.findOne({where :{ id : 1}});
        if(doctor.accountBalance < monthlySubscription.amountOfMoney)
        {
          throw new BadRequestException('this doctor does not have enough money to reactive his account')
        }
        else
        {
          const newPayment = await this.transctionsRepository.create({
            amountPaid : monthlySubscription.amountOfMoney,
            doctor : doctor,
            admin : admin,
            createdAt: today.toISOString()
          });
          await this.transctionsRepository.save(newPayment)
          doctor.accountBalance = doctor.accountBalance - monthlySubscription.amountOfMoney;
          doctor.dateToReactivate = nextDate.toISOString();
          doctor.active = true;
          await this.doctorRepository.save(doctor);
        }
      }


      async MonthlySubscriptions(){
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const nextMonth = now.getUTCMonth() + 1;
        const nextYear = nextMonth > 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
        const nextDate = new Date(Date.UTC(nextYear, nextMonth % 12, now.getUTCDate()));
        
        // Use Intl.DateTimeFormat to format the date as "YYYY-MM-DD"
        const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const nextDateString = dateFormatter.format(nextDate); 
        const activeValues = ['true'];
        const doctor = await this.doctorRepository.find({
          where : {
            dateToReactivate  : Equal(today.toISOString()),
            active: In(activeValues)
          }
        })
        if(doctor.length == 0)
        {
          throw new HttpException(
            `No doctos has to pay to Reactivate today`,
            HttpStatus.NOT_FOUND,
          );
        }
        const monthlySubscription = await this.monthlySubscriptionRepository.findOne({where :{ id : 1}});
        let i = 0;
        while(doctor[i])
        {
          if(doctor[i].accountBalance < monthlySubscription.amountOfMoney)
          {
            doctor[i].active = false;
            await this.doctorRepository.save(doctor);

          }
          else
          {
            const newPayment = await this.transctionsRepository.create({
              amountPaid : monthlySubscription.amountOfMoney,
              doctor : doctor[i],
              createdAt: today.toISOString()
            });
            await this.transctionsRepository.save(newPayment)
            doctor[i].accountBalance = doctor[i].accountBalance - monthlySubscription.amountOfMoney;
            doctor[i].dateToReactivate = nextDateString;
            await this.doctorRepository.save(doctor);
          }
          i++;
        }

      }

      async AmountCollectedByAdmin(adminId : number,amountCollectedByAdmin : AmountCollectedByAdminParams){
        const admin = await this.adminRepository.findOne({
          where :{
            adminId
          }
        })
        if(!admin)
        {
          throw new HttpException(
            `admin with id ${adminId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        if(admin.isAdmin)
        {
          throw new HttpException(
            `you are not allowed`,
            HttpStatus.METHOD_NOT_ALLOWED,
          );
        }
        //get date        
        const month = parseInt(amountCollectedByAdmin.month, 10);
        const year = parseInt(amountCollectedByAdmin.year, 10);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const adminrows = await this.payInAdvanceRepository.find({
          where :{
            admin :{
              adminId : adminId,
            },
            createdAt: Between(startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)), 
          }
        })
        if(adminrows.length == 0)
        {
          throw new BadRequestException('this admin did not get any money this month');
        }
        let amountOfMoney = 0;
        let i = 0;
        while(adminrows[i])
        {
          amountOfMoney = await amountOfMoney + adminrows[i].amountPaid;
          i++;
        }
        return {
          Details  : adminrows ,
          amountOfMoney : amountOfMoney
        }
      }
      async doctorsactivatedByAdmin(adminId : number,amountCollectedByAdmin : AmountCollectedByAdminParams){
        const admin = await this.adminRepository.findOne({
          where :{
            adminId
          }
        })
        if(!admin)
        {
          throw new HttpException(
            `admin with id ${adminId} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        if(admin.isAdmin)
        {
          throw new HttpException(
            `you are not allowed`,
            HttpStatus.METHOD_NOT_ALLOWED,
          );
        }
        //get date        
        const month = parseInt(amountCollectedByAdmin.month, 10);
        const year = parseInt(amountCollectedByAdmin.year, 10);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const adminrows = await this.transctionsRepository.find({
          relations : ['doctor'],
          where :{
            admin :{
              adminId : adminId,
            },
            createdAt: Between(startDate.toISOString().slice(0, 10), endDate.toISOString().slice(0, 10)), 
          },
          select :{
            id : true,
            createdAt : true,
            doctor :{
              doctorId : true,
              firstname : true,
              lastname : true
            }
          }
        })
        if(adminrows.length == 0)
        {
          throw new BadRequestException('this admin did not active any account this month');
        }
        return {
          Details  : adminrows ,
        }
      }
      
      async filterDoctorsByPhoneNumber(phonenumberForAdmin : number){
        console.log("whyyyyyy")
        const query =  this.doctorRepository.createQueryBuilder('doctor')
        .where('phonenumberForAdmin LIKE :phonenumberForAdmin', {
          phonenumberForAdmin: `%${phonenumberForAdmin}%`,
        });
        const doctors = await query.getMany();
        if(doctors.length === 0)
        {
            throw new HttpException(`No doctor met the conditions `, HttpStatus.NOT_FOUND);
        }
        return doctors;
      }
}
