import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNotIn, validate } from 'class-validator';
import { Admin } from 'src/typeorm/entities/admin';
import { AmountCollectedByAdminParams, CreateAdminParams, filterNameParams, updateAdminParams } from 'src/utils/types';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';
import * as bcrypt from 'bcryptjs'
import { Between, Equal, In, Not, NumericType, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/middleware/mail/mail.service';
import { CACHE_MANAGER } from '@nestjs/common'; // import CACHE_MANAGER
import { Inject } from '@nestjs/common';
import { Doctor } from 'src/typeorm/entities/doctors';
import { Secretary } from 'src/typeorm/entities/secretary';
import { MonthlySubscription } from 'src/typeorm/entities/monthly-subscription';
import { Transctions } from 'src/typeorm/entities/transctions';
import { PayInAdvance } from 'src/typeorm/entities/pay-in-advance';
import { SubAdminPaymentReport } from 'src/typeorm/entities/sub-admin-payment-report';
import { SubAdminPayment } from 'src/typeorm/entities/sub-admin-payment';
import { NewDoctorReports } from 'src/typeorm/entities/new-doctor-reports';
import { TransctionsReports } from 'src/typeorm/entities/transctions-reports';
import { type } from 'os';
import { DoctorClinic } from 'src/typeorm/entities/doctor-clinic';
import { Clinic } from 'src/typeorm/entities/clinic';

@Injectable()
export class AdminsService {
    constructor (
      
        private jwtService : JwtService,
        @InjectRepository(SubAdminPayment) 
        private subAdminPaymentRepository : Repository<SubAdminPayment>,
        @InjectRepository(Doctor) 
        private doctorRepository : Repository<Doctor>,
        @InjectRepository(SubAdminPaymentReport) 
        private subAdminPaymentReportRepository : Repository<SubAdminPaymentReport>,
        @InjectRepository(TransctionsReports) 
        private TransctionsReportsRepository : Repository<TransctionsReports>,
        @InjectRepository(DoctorClinic) 
        private doctorClinicRepository : Repository<DoctorClinic>,
        @InjectRepository(Secretary) 
        private secretaryRepository : Repository<Secretary>,
        @InjectRepository(NewDoctorReports) 
        private newDoctorReportsRepository : Repository<NewDoctorReports>,
        @InjectRepository(Admin) 
        private adminRepository : Repository<Admin>,
        @InjectRepository(PayInAdvance) 
        private payInAdvanceRepository : Repository<PayInAdvance>,
        @InjectRepository(Transctions) 
        private transctionsRepository : Repository<Transctions>,
        @InjectRepository(MonthlySubscription) 
        private monthlySubscriptionRepository : Repository<MonthlySubscription>,
        @InjectRepository(Clinic) 
        private clinicRepository : Repository<Clinic>, 
        private readonly mailService: MailService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: any, // update the type of cacheManager to any
        ){}



    async findAdmins(){
      const select: Array<keyof Admin> =['adminId', 'email', 'phonenumber', 'firstname','lastname','active'];
        const admins =  await this.adminRepository.find({select, where:{  type: Not(Equal(0))}});
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
        accountBalance : 0,
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
      if(admin.type == 0)
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
      if(admin.type == 0)
      {
        throw new HttpException(`you can not update the admin`, HttpStatus.METHOD_NOT_ALLOWED);
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

      async getMyAccount(adminId : number,type : number){
        let admin
        if(type == 4)
        {
          admin = await this.adminRepository.findOne({
            where : {
              adminId : adminId
            },
            select : ['adminId','email','phonenumber','firstname','lastname']
          })
        }
        else
        {
          admin = await this.adminRepository.findOne({
            where : {
              adminId : adminId
            },
            select : ['adminId','email','phonenumber','firstname','lastname','accountBalance']
          })
        }
      
        if (!admin) {
          throw new HttpException(
            `admin with id ${admin} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
        if(admin.type == 0)
        {
          throw new UnauthorizedException('Access denied');
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
        admin.accountBalance = admin.accountBalance + amountPaid;
        await this.adminRepository.save(admin); 
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
        // const isActive: boolean = doctor.active;
        // const isActiveString: string = isActive.toString();
        if (doctor.active === true) {
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


          const doctorClinics = await this.doctorClinicRepository.find({
            where: { doctor: { doctorId: doctor.doctorId } },
            relations : ['clinic']
          });
          const clinicIds = doctorClinics.map((doctorClinic) => doctorClinic.clinic.clinicId);
          const clinics = await this.clinicRepository.find({
            where: { clinicId: In(clinicIds) },
          });
          let i = 0;
          while(clinics[i])
          {
            clinics[i].numDoctors ++;
            await this.clinicRepository.save(clinics[i])
            i++;
          }
          await this.doctorRepository.save(doctor);
        
          //add for reports
          const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
          const year = today.getUTCFullYear();
          const createdAt = `${year}-${month}`;
          let duplicated = await this.TransctionsReportsRepository.findOne({
            where: {
              createdAt: createdAt
            }
          });
          if(!duplicated)
          {
  
            const transctionsReports = await this.TransctionsReportsRepository.create({
              createdAt : createdAt,
              amountCollected : monthlySubscription.amountOfMoney
            })
            await this.TransctionsReportsRepository.save(transctionsReports);
          }
          else
          {
            duplicated.amountCollected = duplicated.amountCollected +Number(monthlySubscription.amountOfMoney);
            await this.TransctionsReportsRepository.save(duplicated);
          }

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
        const doctor = await this.doctorRepository.find({
          where : {
            dateToReactivate  : Equal(today.toISOString()),
            active: true
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
        let numberOfDoctorsWhoActivated = 0;
        while(doctor[i])
        {
          if(doctor[i].accountBalance < monthlySubscription.amountOfMoney)
          {
            doctor[i].active = false;
            
            const doctorClinics = await this.doctorClinicRepository.find({
              where: { doctor: { doctorId: doctor[i].doctorId } },
              relations : ['clinic']
            });
            const clinicIds = doctorClinics.map((doctorClinic) => doctorClinic.clinic.clinicId);
            const clinics = await this.clinicRepository.find({
              where: { clinicId: In(clinicIds) },
            });
            let j = 0;
            while(clinics[j])
            {
              clinics[j].numDoctors --;
              await this.clinicRepository.save(clinics[j])
              j++;
            }
            await this.doctorRepository.save(doctor);

          }
          else
          {
            numberOfDoctorsWhoActivated ++;
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
        const amountOfMoneyCollectedToday = ( numberOfDoctorsWhoActivated * Number(monthlySubscription.amountOfMoney))
        

        
        const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = today.getUTCFullYear();
        const createdAt = `${year}-${month}`;
        let duplicated = await this.TransctionsReportsRepository.findOne({
          where: {
            createdAt: createdAt
          }
        });
        if(!duplicated)
        {

          const transctionsReports = await this.TransctionsReportsRepository.create({
            createdAt : createdAt,
            amountCollected : amountOfMoneyCollectedToday
          })
          await this.TransctionsReportsRepository.save(transctionsReports);
        }
        else
        {
          duplicated.amountCollected = duplicated.amountCollected + amountOfMoneyCollectedToday;
          await this.TransctionsReportsRepository.save(duplicated);
        }
      }

      async TakingMoneyFromAdmin(adminId : number){
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
        if(admin.accountBalance == 0)
        {
          throw new BadRequestException('this admin does not have money');
        }
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const month = (today.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = today.getUTCFullYear();
        const createdAt = `${year}-${month}`;


        const subAdminPayment = await this.subAdminPaymentRepository.create({
          admin : admin,
          amount : admin.accountBalance,
          createdAt : today.toISOString()
        })
        this.subAdminPaymentRepository.save(subAdminPayment)

        let duplicated = await this.subAdminPaymentReportRepository.findOne({
          where: {
            createdAt: createdAt
          }
        });
        if(!duplicated)
        {

          const subAdminPaymentReport = await this.subAdminPaymentReportRepository.create({
            createdAt : createdAt,
            amountCollected : admin.accountBalance,
          })
          await this.subAdminPaymentReportRepository.save(subAdminPaymentReport);

        }
        else
        {
          duplicated.amountCollected = duplicated.amountCollected + admin.accountBalance
          await this.subAdminPaymentReportRepository.save(duplicated);
        }
        admin.accountBalance = 0;
        await this.adminRepository.save(admin);

      }


      async subAdminPaymentReport(){
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const month = (today.getUTCMonth()).toString().padStart(2, '0');
        const year = today.getUTCFullYear();
        const createdAt = `${year}-${month}`;
       const subAdminPaymentReport = await this.subAdminPaymentReportRepository.find({
        where :
        {
          // createdAt :Not(createdAt)
        }
       });
       if(subAdminPaymentReport.length == 0)
       {
         throw new HttpException(
          `you have no reports yet`,
          HttpStatus.NOT_FOUND,
          );
       }
       return subAdminPaymentReport;
      }

      async newDoctorReports(){
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const month = (today.getUTCMonth()).toString().padStart(2, '0');
        const year = today.getUTCFullYear();
        const createdAt = `${year}-${month}`;
        const newDoctorReports = await this.newDoctorReportsRepository.find({
          where :{
            // createdAt :Not(createdAt)
          }
        });
        if(newDoctorReports.length == 0)
        {
          throw new HttpException(
           `you have no reports yet`,
           HttpStatus.NOT_FOUND,
           );
        }
        return newDoctorReports;
      }

      async transctionsReports(){
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const month = (today.getUTCMonth()).toString().padStart(2, '0');
        const year = today.getUTCFullYear();
        const createdAt = `${year}-${month}`;
        const transctionsReports = await this.TransctionsReportsRepository.find({
          where :{
            // createdAt :Not(createdAt)
          }
        });
        if(transctionsReports.length == 0)
        {
          throw new HttpException(
           `you have no reports yet`,
           HttpStatus.NOT_FOUND,
           );
        }
        return transctionsReports;
      }
      
      async filterDoctorsByPhoneNumber(phonenumberForAdmin : number){
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


      async moneyCollectedFromDoctorsHistory(adminId : number){
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
        const moneyCollectedByAdmin = await this.payInAdvanceRepository.find({
          relations : ['doctor'],
          where:{
            admin :{
              adminId : adminId
            }
          },
          order: {
            id: 'DESC'
          },
          select :{
            id : true,
            amountPaid : true,
            doctor :{
              doctorId : true,
              firstname : true,
              lastname : true
            }
          }
        })
        if(moneyCollectedByAdmin.length == 0)
        {
          throw new HttpException(
            `no history yet`,
            HttpStatus.NOT_FOUND,
          );
        }
        return moneyCollectedByAdmin;
      }

      async moneyToAdmin(adminId : number){
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
        const moneyPaid = await this.subAdminPaymentRepository.find({
          where:{
            admin :{
              adminId : adminId
            }
          },
          order: {
            id: 'DESC'
        },
        })
        if(moneyPaid.length == 0)
        {
          throw new HttpException(
            `no history yet`,
            HttpStatus.NOT_FOUND,
          );
        }
        return moneyPaid;
      }

      async moneyFromSubAdmin(){
        const moneyPaid = await this.subAdminPaymentRepository.find({
          order: {
            id: 'DESC'
        },
        relations :['admin'],
        select :{
          id : true,
          amount : true,
          createdAt : true,
          admin :{
            adminId : true,
            firstname : true,
            lastname : true
          }
        }
        })
        if(moneyPaid.length == 0)
        {
          throw new HttpException(
            `no history yet`,
            HttpStatus.NOT_FOUND,
          );
        }
        return moneyPaid;
      }
}
