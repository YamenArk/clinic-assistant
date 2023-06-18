import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
export class JWTAuthGuardAdminIsAdmin extends AuthGuard('admin-is-admin-jwt') {

}
export class JWTAuthGuardAdmin extends AuthGuard('admin-jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Call the super method to authenticate the user and get the doctor object
    const isAuthed = await super.canActivate(context);

    const isObservable = isAuthed instanceof Observable;
    if (isObservable) {
      const isAuthedValue = await isAuthed.toPromise();
      return isAuthedValue;
    }
    const admin = request.user.user.admin;
    // Save the doctor object to the request object
    request.adminId = admin.adminId;

    return isAuthed;
  }
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


@Injectable()
export class JWTAuthGuardPatient extends AuthGuard('patient-jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // Call the super method to authenticate the user and get the doctor object
    const isAuthed = await super.canActivate(context);

    const isObservable = isAuthed instanceof Observable;
    if (isObservable) {
      const isAuthedValue = await isAuthed.toPromise();
      return isAuthedValue;
    }
    const patient = request.user.user.patient;
    // Save the doctor object to the request object
    request.patientId = patient.patientId;

    return isAuthed;
  }
}


@Injectable()
export class JWTAuthGuardSecretary extends AuthGuard('secretary-jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Call the super method to authenticate the user and get the doctor object
    const isAuthed = await super.canActivate(context);

    const isObservable = isAuthed instanceof Observable;
    if (isObservable) {
      const isAuthedValue = await isAuthed.toPromise();
      return isAuthedValue;
    }
    const secretary = request.user.user.secretary;
    // Save the doctor object to the request object
    request.secretaryId = secretary.secretaryId;

    return isAuthed;
  }
}
