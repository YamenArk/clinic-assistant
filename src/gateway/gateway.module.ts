import { Module } from "@nestjs/common";
import { Gateway } from "./gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "src/typeorm/entities/patient";
import { PatientNotification } from "src/typeorm/entities/patient-notification";
import { Doctor } from "src/typeorm/entities/doctors";
import { Doctornotification } from "src/typeorm/entities/doctor-notification";

@Module({
  imports: [TypeOrmModule.forFeature([Patient,PatientNotification,Doctor,Doctornotification])],
  providers: [Gateway]  
})
export class GatewayModule {}