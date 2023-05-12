import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
export class JWTAuthGuardAdminIsAdmin extends AuthGuard('admin-is-admin-jwt') {

}
export class JWTAuthGuardAdmin extends AuthGuard('admin-jwt') {
 
}


@Injectable()
export class JWTAuthGuardDoctor extends AuthGuard('doctor-jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Call the super method to authenticate the user and get the doctor object
    const isAuthed = await super.canActivate(context);

    const isObservable = isAuthed instanceof Observable;
    if (isObservable) {
      const isAuthedValue = await isAuthed.toPromise();
      return isAuthedValue;
    }
    const doctor = request.user.user.doctor;
    // Save the doctor object to the request object
    request.doctorId = doctor.doctorId;

    return isAuthed;
  }
}
