import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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

    @Post()
    @UseGuards(JWTAuthGuardAdminIsAdmin)
    createAdmin(@Body() createUserDto: CreateAdminDto){
        return this.adminSrevice.createAdmin(createUserDto)
    }
    
    @Post('login')
    async login(@Body() authLoginDto: AuthLoginDto){

      return this.adminSrevice.login(authLoginDto)
    }
}
