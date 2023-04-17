import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAdminDto } from 'src/admins/dtos/CreateAdmin.dto';
import { AdminsService } from 'src/admins/services/admins/admins.service';

@Controller('admins')
export class AdminsController {
    constructor(private adminSrevice : AdminsService){}
    @Get()
    getAdmins(){
        return this.adminSrevice.findAdmins();
    }

    @Post()
    createAdmin(@Body() createUserDto: CreateAdminDto){
        return this.adminSrevice.createAdmin(createUserDto)
    }
    
    
}
