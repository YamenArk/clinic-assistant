import { AuthGuard } from "@nestjs/passport";

export class JWTAuthGuardAdminIsAdmin extends AuthGuard('admin-is-admin-jwt') {

}
export class JWTAuthGuardAdmin extends AuthGuard('admin-jwt') {

}
