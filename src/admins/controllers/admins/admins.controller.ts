import { Body, Controller, Get, Post, UseGuards,ValidationPipe  } from '@nestjs/common';
import { CreateAdminDto } from 'src/admins/dtos/CreateAdmin.dto';
import { AuthLoginDto } from 'src/admins/dtos/auth-login.dto';
import { AdminsService } from 'src/admins/services/admins/admins.service';
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
        return {message : 'doctor has been created'}
    }
    
    @Post('login')
    async login(@Body(new ValidationPipe({ whitelist: true })) authLoginDto: AuthLoginDto) {
      return this.adminSrevice.login(authLoginDto);
    }

    @Post('send-email')
    async sendResetEmail(@Body('email') email: string) {
        await this.adminSrevice.sendResetEmail(email);
        return {message : 'message has been sent to your Email'}
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
