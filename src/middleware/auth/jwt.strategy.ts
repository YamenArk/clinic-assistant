import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-jwt";
import { Admin } from "src/typeorm/entities/admin";
import { Doctor } from "src/typeorm/entities/doctors";
import { Repository } from "typeorm";


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

  async validate(payload: { adminId: number }) {
    const admin = await this.adminRepository.findOne({where : {adminId : payload.adminId}});

    if (!admin || !admin.isAdmin) {
      throw new UnauthorizedException('Access denied');
    }

    return { admin };
  }
}

@Injectable()
export class DoctorJwtStrategy extends PassportStrategy(Strategy, 'doctor-jwt') {
  constructor( 
    @InjectRepository(Doctor) 
  private doctorRepository : Repository<Doctor>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { doctorId: number }) {
    const doctor = await this.doctorRepository.findOne({where : {doctorId : payload.doctorId}});

    if (!doctor) {
      throw new UnauthorizedException('Access denied');
    }

    return { doctor };
  }
}





// export class JWTStrategy extends PassportStrategy(Strategy) {
//     constructor(@InjectRepository(Admin) private adminRepository: Repository<Admin>, @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>) {
//       super({
//         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//         ignoreExpiration: false,
//         secretOrKey: process.env.JWT_SECRET,
//         passReqToCallback: true, // add request object as first argument to validate()
//       });
//     }
  
//     async validate(req: Request, payload: { adminId?: number, doctorId?: number }): Promise<any> {
//       if (req.baseUrl === '/admins') {
//         // validation logic for admins
//         const admin = await this.adminRepository.findOne({ id: payload.adminId });
//         if (!admin) {
//           throw new UnauthorizedException();
//         }
//         return { adminId: admin.id };
//       } else if (req.baseUrl === '/doctors') {
//         // validation logic for doctors
//         const doctor = await this.doctorRepository.findOne({ id: payload.doctorId });
//         if (!doctor) {
//           throw new UnauthorizedException();
//         }
//         return { doctorId: doctor.id };
//       } else {
//         throw new UnauthorizedException();
//       }
//     }
//   }