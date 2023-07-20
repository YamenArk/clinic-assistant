import { Module } from "@nestjs/common";
import { PatientMessagingGateway } from "./gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Patient } from "src/typeorm/entities/patient";
import { PatientNotification } from "src/typeorm/entities/patient-notification";

@Module({
  imports: [TypeOrmModule.forFeature([Patient,PatientNotification])],
  providers: [PatientMessagingGateway]  
})
export class GatewayModule {}