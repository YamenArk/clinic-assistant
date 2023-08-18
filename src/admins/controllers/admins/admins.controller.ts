import { Body, Controller, Get, Param, ParseIntPipe, Post,Delete, Put,Req, UseGuards,ValidationPipe, BadRequestException, Query  } from '@nestjs/common';
import { CreateAdminDto } from 'src/admins/dtos/CreateAdmin.dto';
import { UpdateAdminDto } from 'src/admins/dtos/UpdateAdmin.dto';
import { AdminsService } from 'src/admins/services/admins/admins.service';
import{Cron,CronExpression} from '@nestjs/schedule'
import { filterNameDto } from 'src/doctors/dtos/filterName.dto';
import { JWTAuthGuardAdmin, JWTAuthGuardAdminIsAdmin ,JWTAuthGuardDoctorAdmin , JWTAuthGuardMoneyAdmin} from 'src/middleware/auth/jwt-auth.guard';

@Controller('admins')
export class AdminsController {
    constructor(private adminSrevice : AdminsService){}
    

////////////////////// admin type 0
    @Post()
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async createAdmin(@Body(new ValidationPipe({ whitelist: true })) createUserDto: CreateAdminDto){
        await this.adminSrevice.createAdmin(createUserDto)
        return {message : 'admin has been created'}
    }


    @Get()
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async getAdmins(
      @Query('page') page: number,
      @Query('perPage') perPage: number,
    ) {
      
      // Check if page and perPage are not provided, then set them to appropriate values for fetching all elements
      if (!page || !perPage) {
        page = 1;
        perPage = 10000; // A high number to fetch all elements
      }
      const result = await this.adminSrevice.findAdmins(page, perPage);
      return result;
    }
    


    @Put('disactiveDoctor/:doctorId')
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    async disactiveDoctor(
      @Req() request,
      @Param('doctorId',ParseIntPipe) doctorId: number,
    ){
      const adminId = request.adminId ;
      await this.adminSrevice.disactiveDoctor(doctorId,adminId);
      return {message : "doctor disactivated sucessfully"};
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

    
    @Get('monthly-subscription')
    // @UseGuards(JWTAuthGuardAdminIsAdmin)
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
      @Query('page') page: number ,
      @Query('perPage') perPage: number 
    ) {
      // Check if page and perPage are not provided, then set them to appropriate values for fetching all elements
      if (!page || !perPage) {
        page = 1;
        perPage = 10000; // A high number to fetch all elements
      }
      const result = await this.adminSrevice.moneyFromSubAdmin(page, perPage);
      return result;
    }
    


      
   @Put('taking-money-from-admin/:adminId')
   @UseGuards(JWTAuthGuardAdminIsAdmin)
   async TakingMoneyFromAdmin(
    @Param('adminId',ParseIntPipe) adminId: number,
    ){
      await this.adminSrevice.TakingMoneyFromAdmin(adminId);
      return {message : 'money taken sucessfully'};
    }





    ////////////////////////////////////////////////all types
    
    @Get('myAccount')
    @UseGuards(JWTAuthGuardAdmin)
    async myAccount(
      @Req() request
    ){
      const adminId = request.adminId ;
      const type = request.type
      const myAccount = await this.adminSrevice.getMyAccount(adminId,type)
      return {myAccount : myAccount}
    }


    @Post('doctors/filter-doctors-by-phoneNumber')
    //  @UseGuards(JWTAuthGuardAdmin)
     async filterDoctorsByPhoneNumber(
      @Body('phonenumberForAdmin') phonenumberForAdmin: string,
     ){
      const phoneNumber = parseInt(phonenumberForAdmin);
      if (!Number.isInteger(phoneNumber)) {
        throw new BadRequestException('phonenumberForAdmin must be a positive integer greater than or equal to 1000 and cannot contain a decimal point.');
      }
       const doctors = await this.adminSrevice.filterDoctorsByPhoneNumber(phoneNumber)
       return {doctors : doctors}
     }
  
     @Post('reset-password')
     async resetPassword(
       @Body('adminId') adminId: number,
       @Body('code') code: number,
       @Body('newPassword') newPassword: string,
     ): Promise<void> {
       await this.adminSrevice.resetPassword(adminId, code, newPassword);
     }

     //////////////////////////////////////////////////types 0 1 4 

     @Put('activeDoctor/:doctorId')
     @UseGuards(JWTAuthGuardDoctorAdmin)
     async activeDoctor(
       @Req() request,
       @Param('doctorId',ParseIntPipe) doctorId: number,
     ){
       const adminId = request.adminId ;
       await this.adminSrevice.activeDoctor(doctorId,adminId);
       return {message : "doctor activated sucessfully"};
     }


    



     

 
     //////////////////////////////////////////////////types  1 5 

    @Put('add-money-to-my-account/:doctorId')
    @UseGuards(JWTAuthGuardMoneyAdmin)
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
    
    @Get('money-collected-from-doctors-history')
    @UseGuards(JWTAuthGuardMoneyAdmin)
    async moneyCollectedFromDoctorsHistory(
      @Req() request,
      @Query('page') page: number ,
      @Query('perPage') perPage: number 
    ) {
      // Check if page and perPage are not provided, then set them to appropriate values for fetching all elements
      if (!page || !perPage) {
        page = 1;
        perPage = 10000; // A high number to fetch all elements
      }
      const adminId = request.adminId;
      const result = await this.adminSrevice.moneyCollectedFromDoctorsHistory(adminId, page, perPage);
      return result;
    }
    

    @Get('money-to-admin')
    @UseGuards(JWTAuthGuardMoneyAdmin)
    async moneyToAdmin(
      @Req() request,
      @Query('page') page: number ,
      @Query('perPage') perPage: number 
    ) {
      // Check if page and perPage are not provided, then set them to appropriate values for fetching all elements
      if (!page || !perPage) {
        page = 1;
        perPage = 10000; // A high number to fetch all elements
      }
      const adminId = request.adminId;
      const result = await this.adminSrevice.moneyToAdmin(adminId, page, perPage);
      return result;
    }
    
      ///////////////////////////////////////non

      
      // @Put('MonthlySubscriptions')
      @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
      async MonthlySubscriptions(
      ){
        await this.adminSrevice.MonthlySubscriptions();
        // return ;
      }

}


