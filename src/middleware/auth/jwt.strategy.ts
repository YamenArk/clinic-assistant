import { ForbiddenException, Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-jwt";
import { Admin } from "src/typeorm/entities/admin";
import { Doctor } from "src/typeorm/entities/doctors";
import { NumericType, Repository } from "typeorm";
import { ExecutionContext } from '@nestjs/common';
import { Patient } from "src/typeorm/entities/patient";
import { Secretary } from "src/typeorm/entities/secretary";

@Injectable()
export class AdminIsAdminJwtStrategy extends PassportStrategy(Strategy, 'admin-is-admin-jwt') {
  constructor(
    @InjectRepository(Admin) 
    private adminRepository : Repository<Admin>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { adminId: number , type :  number}) {
    if (payload.type != 0 ) {
      throw new UnauthorizedException('Access denied');
    }
    const admin = await this.adminRepository.findOne({where : {adminId : payload.adminId}});

    if (!admin) {
      throw new UnauthorizedException('Access denied');
    }
    return { admin };
  }
}


@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    @InjectRepository(Admin) 
    private adminRepository : Repository<Admin>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { adminId: number,type : number }) {
    const admin = await this.adminRepository.findOne({where : {adminId : payload.adminId}});
    if (!admin) {
      throw new UnauthorizedException('Access denied');
    }
    if(admin.active == false)
    {
      throw new ForbiddenException('you are not active anymore');
    }
    return { user: { admin } };

  }
}






@Injectable()
export class DoctorAdminJwtStrategy extends PassportStrategy(Strategy, 'doctor-admin-jwt') {
  constructor(
    @InjectRepository(Admin) 
    private adminRepository : Repository<Admin>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { adminId: number,type : number }) {
    if (!(payload.type == 0 || payload.type == 1 || payload.type == 4)) {
      throw new UnauthorizedException('Access denied');
    }
    const admin = await this.adminRepository.findOne({where : {adminId : payload.adminId}});
    if (!admin) {
      throw new UnauthorizedException('Access denied');
    }
    if(admin.active == false)
    {
      throw new ForbiddenException('you are not active anymore');
    }
    return { user: { admin } };

  }
}


@Injectable()
export class MoneyAdminJwtStrategy extends PassportStrategy(Strategy, 'money-admin-jwt') {
  constructor(
    @InjectRepository(Admin) 
    private adminRepository : Repository<Admin>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { adminId: number,type : number }) {
    if (!( payload.type == 1 || payload.type == 5)) {
      throw new UnauthorizedException('Access denied');
    }
    const admin = await this.adminRepository.findOne({where : {adminId : payload.adminId}});
    if (!admin) {
      throw new UnauthorizedException('Access denied');
    }
    if(admin.active == false)
    {
      throw new ForbiddenException('you are not active anymore');
    }
    return { user: { admin } };

  }
}





@Injectable()
export class DoctorJwtStrategy extends PassportStrategy(Strategy, 'doctor-jwt') {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { doctorId: number , type : number}) {
    if (!(payload.type == 2)) {
      throw new UnauthorizedException('Access denied');
    }
    const doctor = await this.doctorRepository.findOne({where : {doctorId : payload.doctorId}});
    if (!doctor) {
      throw new UnauthorizedException('Access denied');
    }
    if(doctor.active == false)
    {
      throw new ForbiddenException('you are not active anymore');
    }
    return { user: { doctor } };
  }
}





@Injectable()
export class SecretaryJwtStrategy extends PassportStrategy(Strategy, 'secretary-jwt') {
  constructor(
    @InjectRepository(Secretary)
    private secretaryRepository: Repository<Secretary>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { secretaryId: number , type : number}) {
    if (!(payload.type == 3)) {
      throw new UnauthorizedException('Access denied');
    }
    const secretary = await this.secretaryRepository.findOne({where : {secretaryId : payload.secretaryId}});
    if (!secretary) {
      throw new UnauthorizedException('Access denied');
    }
    return { user: { secretary } };
  }
}





@Injectable()
export class PatientJwtStrategy extends PassportStrategy(Strategy, 'patient-jwt') {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { patientId: number , type : number}) {
    if (!(payload.type == 4)) {
      throw new UnauthorizedException('Access denied');
    }

    const patient = await this.patientRepository.findOne({where : {patientId : payload.patientId}});
    if (!patient) {
      throw new UnauthorizedException('Access denied');
    }
    if(patient.active == false)
    {
      throw new ForbiddenException('you are not active anymore');
    }
    return { user: { patient } };
  }
}




