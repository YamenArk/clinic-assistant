import { Body, Controller, Get, Param, ParseIntPipe, Post,Delete, Put,Req, UseGuards,ValidationPipe, BadRequestException  } from '@nestjs/common';
import { CreateAdminDto } from 'src/admins/dtos/CreateAdmin.dto';
import { UpdateAdminDto } from 'src/admins/dtos/UpdateAdmin.dto';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';
import { AdminsService } from 'src/admins/services/admins/admins.service';
import { filterNameDto } from 'src/doctors/dtos/filterName.dto';
import { JWTAuthGuardAdmin, JWTAuthGuardAdminIsAdmin } from 'src/middleware/auth/jwt-auth.guard';
import { Cron, CronExpression } from 'node-cron';
import { IsInt, Min, IsPositive } from 'class-validator';
import { AmountCollectedByAdminDto } from 'src/admins/dtos/AmountCollectedByAdmin.dto';

@Controller('admins')
export class AdminsController {
    constructor(private adminSrevice : AdminsService){}
    @Get()
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    getAdmins(){
        return this.adminSrevice.findAdmins();
       
    }

    //admin
    @Post()
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async createAdmin(@Body(new ValidationPipe({ whitelist: true })) createUserDto: CreateAdminDto){
        await this.adminSrevice.createAdmin(createUserDto)
        return {message : 'admin has been created'}
    }

    
    @Delete(':adminId')
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async deleteAdmin(
      @Param('adminId',ParseIntPipe) adminId: number,
    ){
        await this.adminSrevice.deleteAdmin(adminId)
        return {message : 'admin has been deleted'}
    }

      //filter admins
      @Post('filter-by-names')
      @UseGuards(JWTAuthGuardAdminIsAdmin)
      async  filterAdminByName(@Body(new ValidationPipe({ whitelist: true })) filterName : filterNameDto){
          return this.adminSrevice.filterAdminByName(filterName);
      }
  

      
    @Put('update/:adminId')
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async updateAdmin(
      @Param('adminId',ParseIntPipe) adminId: number,
      @Body(new ValidationPipe({ whitelist: true })) updateAdminDto: UpdateAdminDto,
    ) {
      await this.adminSrevice.updateAdmin(adminId,updateAdminDto);
      return {message : "admin updated successfully"}
    }


    

    
   @Put('doctors-activated-by-admin/:adminId')
   @UseGuards(JWTAuthGuardAdminIsAdmin)
   async doctorsactivatedByAdmin(
     @Param('adminId', new ParseIntPipe()) adminId: number,
     @Body(new ValidationPipe({ whitelist: true })) amountCollectedByAdminDto : AmountCollectedByAdminDto,
   ){

     AmountCollectedByAdminDto.validate(amountCollectedByAdminDto); // Call the validate() method as a static method on CreateWorkTimeDto
     return this.adminSrevice.doctorsactivatedByAdmin(adminId,amountCollectedByAdminDto)
  }

  
  

    @Get('monthly-subscription')
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async MonthlySubscription(
    ){
      const amountOfMoney = await this.adminSrevice.MonthlySubscription()
      return {amountOfMoney : amountOfMoney}
    }


    @Put('change-monthly-subscription')
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async changeMonthlySubscription(
      @Body('amountOfMoney') amountOfMoney: string,
    ){
      const amount = parseInt(amountOfMoney);
      if (!Number.isInteger(amount) || amount < 1000 || amountOfMoney.includes('.')) {
        throw new BadRequestException('monthlySubscription must be a positive integer greater than or equal to 1000 and cannot contain a decimal point.');
      }
      await this.adminSrevice.changeMonthlySubscription(amount)
      return {message : 'monthly subscription changed sucessfully'}
    }


  
    @Post('reset-password')
    async resetPassword(
      @Body('adminId') adminId: number,
      @Body('code') code: number,
      @Body('newPassword') newPassword: string,
    ): Promise<void> {
      await this.adminSrevice.resetPassword(adminId, code, newPassword);
    }

    @Get('myAccount')
    @UseGuards(JWTAuthGuardAdmin)
    async myAccount(
      @Req() request
    ){
      const adminId = request.adminId ;
      const myAccount = await this.adminSrevice.getMyAccount(adminId)
      return {myAccount : myAccount}
    }

    


 

    @Put('add-money-to-my-account/:doctorId')
    @UseGuards(JWTAuthGuardAdmin)
    async addMoneyToMyAccount(
      @Req() request,
      @Param('doctorId',ParseIntPipe) doctorId: number,
      @Body('amountPaid') amountPaid: string,
    ){
      const amount = parseInt(amountPaid);

      if (!Number.isInteger(amount) || amount < 1000 || amountPaid.includes('.')) {
        throw new BadRequestException('Amount must be a positive integer greater than or equal to 1000 and cannot contain a decimal point.');
      }
      const adminId = request.adminId ;
      await this.adminSrevice.addMoneyToMyAccount(adminId,doctorId,amount)
      return {message : 'money has been added to your account sucessfully'}
    }


    @Put('activeDoctor/:doctorId')
    @UseGuards(JWTAuthGuardAdmin)
    async activeDoctor(
      @Req() request,
      @Param('doctorId',ParseIntPipe) doctorId: number,
    ){
      const adminId = request.adminId ;
      await this.adminSrevice.activeDoctor(doctorId,adminId);
      return {message : "doctor activated sucessfully"};
    }


       
   @Post('doctors/filter-doctors-by-phoneNumber')
  //  @UseGuards(JWTAuthGuardAdmin)
   async filterDoctorsByPhoneNumber(
    @Body('phonenumberForAdmin') phonenumberForAdmin: string,
   ){
    console.log(phonenumberForAdmin)
    const phoneNumber = parseInt(phonenumberForAdmin);
    console.log(phoneNumber)
    if (!Number.isInteger(phoneNumber)) {
      throw new BadRequestException('phonenumberForAdmin must be a positive integer greater than or equal to 1000 and cannot contain a decimal point.');
    }
     const doctors = await this.adminSrevice.filterDoctorsByPhoneNumber(phoneNumber)
     return {doctors : doctors}
   }



   @Put('MonthlySubscriptions')
   // @Cron(CronExpression.EVERY_DAY_AT_0AM)
   async MonthlySubscriptions(
   ){
     await this.adminSrevice.MonthlySubscriptions();
     return ;
   }



   @Put('taking-money-from-admin/:adminId')
   @UseGuards(JWTAuthGuardAdmin)
   async TakingMoneyFromAdmin(
    @Param('adminId',ParseIntPipe) adminId: number,
    ){
      await this.adminSrevice.TakingMoneyFromAdmin(adminId);
      return {message : 'money taken sucessfully'};
    }

  @Get('sub-admin-payment-report')
  @UseGuards(JWTAuthGuardAdminIsAdmin)
  async subAdminPaymentReport(
    ){
      const subAdminPaymentReport = await this.adminSrevice.subAdminPaymentReport();
      return {reports : subAdminPaymentReport};
    }


  @Get('new-doctor-report')
  @UseGuards(JWTAuthGuardAdminIsAdmin)
  async newDoctorReports(
    ){
      const newDoctorReports = await this.adminSrevice.newDoctorReports();
      return {reports : newDoctorReports};
    }

  @Get('transctions-report')
  @UseGuards(JWTAuthGuardAdminIsAdmin)
  async transctionsReports(
    ){
      const transctionsReports = await this.adminSrevice.transctionsReports();
      return {reports : transctionsReports};
    }

    @Get('money-from-sub-admin')
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async moneyFromSubAdmin(
      ){
        const moneyFromSubAdmin = await this.adminSrevice.moneyFromSubAdmin();
        return {moneyFromSubAdmin : moneyFromSubAdmin};
      }


    @Get('money-collected-from-doctors-history')
    @UseGuards(JWTAuthGuardAdmin)
    async moneyCollectedFromDoctorsHistory(
      @Req() request,
      ){
        const adminId = request.adminId ;
        const moneyCollectedByAdmin = await this.adminSrevice.moneyCollectedFromDoctorsHistory(adminId);
        return {moneyHistoryCollected : moneyCollectedByAdmin};
      }

    @Get('money-to-admin')
    @UseGuards(JWTAuthGuardAdmin)
    async moneyToAdmin(
      @Req() request,
      ){
        const adminId = request.adminId ;
        const monyPaidToAdmin = await this.adminSrevice.moneyToAdmin(adminId);
        return {monyPaidToAdmin : monyPaidToAdmin};
      }
  
}
