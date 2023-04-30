import { AuthGuard } from "@nestjs/passport";

export class JWTAuthGuardAdminIsAdmin extends AuthGuard('admin-jwt') {

}