import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './typeorm/entities/admin';
import { AdminsModule } from './admins/admins.module';
import { DoctorsModule } from './doctors/doctors.module';
import { Doctor } from './typeorm/entities/doctors';
import { Specialty } from './typeorm/entities/specialty';
import { SubSpecialty } from './typeorm/entities/sub-specialty';
import { Patient } from './typeorm/entities/patient';
import { Insurance } from './typeorm/entities/insurance';
import { SpecialtiesModule } from './specialties/specialties.module';
import { SubSpecialtiesModule } from './sub-specialties/sub-specialties.module';
import { ClinicsModule } from './clinics/clinics.module';
import { Clinic } from './typeorm/entities/clinic';
import { InsurancesModule } from './insurances/insurances.module';
import { DoctorClinic } from './typeorm/entities/doctor-clinic';
import { Secretary } from './typeorm/entities/secretary';
import { WorkTime } from './typeorm/entities/work-time';
import { Appointment } from './typeorm/entities/appointment';
import { MailService } from './middleware/mail/mail.service';
import { AuthModule } from './middleware/auth/auth.module';
import { Governorate } from './typeorm/entities/Governorate';
import { Area } from './typeorm/entities/Area';
import { QueryService } from './middleware/sql/query/query.service';
import { GovernoratesModule } from './governorates/governorates.module';
import { PatientsModule } from './patients/patients.module';
// import { PhoneService } from './middleware/phone/phone.service';
import { SecretariesModule } from './secretaries/secretaries.module';
import { DoctorPatient } from './typeorm/entities/doctor-patient';
import { PayInAdvance } from './typeorm/entities/pay-in-advance';
import {  Transctions } from './typeorm/entities/transctions';
import { MonthlySubscription } from './typeorm/entities/monthly-subscription';
import { SubAdminPayment } from './typeorm/entities/sub-admin-payment';
import { TransctionsReports } from './typeorm/entities/transctions-reports';
import { SubAdminPaymentReport } from './typeorm/entities/sub-admin-payment-report';
import { NewDoctorReports } from './typeorm/entities/new-doctor-reports';
import { PatientDoctosReport } from './typeorm/entities/patient-doctos-report';
import { DoctorMessage } from './typeorm/entities/doctor-message';
import { Doctornotification } from './typeorm/entities/doctor-notification';
import { PatientNotification } from './typeorm/entities/patient-notification';
import { PatientReminders } from './typeorm/entities/patient-reminders';
import { PatientDelay } from './typeorm/entities/patient-delays';
import { SharedModule } from './shared/shared.module';
// clinicassistant
@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'clinicassistant',
      entities: [
        Admin,
        Doctor,
        Specialty,
        SubSpecialty,
        Patient,
        Insurance,
        Clinic,
        DoctorClinic,
        Secretary,
        WorkTime,
        Appointment,
        Governorate,
        Area,
        DoctorPatient,
        PayInAdvance,
        Transctions,
        MonthlySubscription,
        SubAdminPayment,
        TransctionsReports,
        SubAdminPaymentReport,
        NewDoctorReports,
        PatientDoctosReport,
        DoctorMessage,
        Doctornotification,
        PatientNotification,
        PatientReminders,
        PatientDelay
      ],
      synchronize:  false ,
      migrationsRun: false,
      dropSchema: false
    }),
    AdminsModule,
    DoctorsModule,
    SpecialtiesModule,
    SubSpecialtiesModule,
    ClinicsModule,
    InsurancesModule,
    AuthModule,
    GovernoratesModule,
    PatientsModule,
    SecretariesModule,
      ],
  providers: [MailService, QueryService]
})
export class AppModule {}
