import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards,ValidationPipe  } from '@nestjs/common';
import { CreateAdminDto } from 'src/admins/dtos/CreateAdmin.dto';
import { UpdateAdminDto } from 'src/admins/dtos/UpdateAdmin.dto';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';
import { AdminsService } from 'src/admins/services/admins/admins.service';
import { filterNameDto } from 'src/doctors/dtos/filterName.dto';
import { JWTAuthGuardAdminIsAdmin } from 'src/middleware/auth/jwt-auth.guard';

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


    @Post('send-email')
    async sendResetEmail(@Body('email') email: string) {
        const adminId = await this.adminSrevice.sendResetEmail(email);
        return {message : 'message has been sent to your Email',adminId : adminId}
    }
  
    @Post('reset-password')
    async resetPassword(
      @Body('adminId') adminId: number,
      @Body('code') code: number,
      @Body('newPassword') newPassword: string,
    ): Promise<void> {
      await this.adminSrevice.resetPassword(adminId, code, newPassword);
    }


}
