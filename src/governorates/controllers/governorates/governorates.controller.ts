import { Controller, Get, Param } from '@nestjs/common';
import { GovernoratesService } from 'src/governorates/services/governorates/governorates.service';

@Controller('governorates')

export class GovernoratesController {
    constructor(private governorateSrevice : GovernoratesService){}
    @Get()
    getGovernorates(){
        return this.governorateSrevice.findGovernorates();
    }

    @Get(':governorateId/areas')
    getAreas(@Param('governorateId') governorateId: number){
        return this.governorateSrevice.findAreas(governorateId);
    }
}
