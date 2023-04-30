import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-jwt";
import { Repository } from "typeorm";

export class JWTStrategy extends PassportStrategy(Strategy){
    constructor(){

        super({
            jwtFromRequest :ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration : false,
            secretOrKey: process.env.JWT_SECRET
        })

    }

    async validate(payload : {adminId : Number}){
        console.log("===================")
        console.log(payload)
        if (payload.adminId == 1) {
            console.log("helo")
            throw new UnauthorizedException('Access denied');
        }
        return {
            adminId : payload.adminId
        }
    }
}



// @Injectable()
// export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
//   constructor(
//     @InjectRepository(Admin) 
//     private adminRepository : Repository<Admin>
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.JWT_SECRET,
//     });
//   }

//   async validate(payload: { adminId: number }) {
//     const admin = await this.adminRepository.findOne({where : {adminId : payload.adminId}});

//     if (!admin) {
//       throw new UnauthorizedException('Access denied');
//     }

//     return { admin };
//   }
// }
