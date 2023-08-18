import { type } from "os";

enum Day {
  الأحد = 'الأحد',
  الاثنين = 'الاثنين',
  الثلاثاء = 'الثلاثاء',
  الأربعاء = 'الأربعاء',
  الخميس = 'الخميس',
  الجمعة = 'الجمعة',
  السبت = 'السبت',
}

enum TypeEnum {
  One = 1,
  Four = 4,
  Five = 5,
}
export type CreateAdminParams  = {
    email: string;
    phonenumber: string;
    firstname: string;
    lastname: string;
    type: TypeEnum;

  };
  
  export interface  CreateDoctorParams {
    email: string;
    phonenumberForAdmin: string;
    gender: 'male' | 'female';
    firstname: string;
    lastname: string;
    clinics: { clinicId: number }[];
    subSpecialties: { subSpecialtyId: number }[];
    insurances?: { insuranceId: number }[];
  }


  export interface CreateWorkTimeParams {
    startingTime: string;
    finishingTime: string;
    days: Day[];
    startDate: string;
    endDate: string;
  }

  export interface CreateManyWorkTimeParams {
    appointments: {
      day: Day;      
      startingTime: string;
      finishingTime: string;
    }[];
    startDate: string;
    endDate: string;
  }

  
  
  export interface DeleteWorkTimeParams {
    startDate: string;
    endDate: string;
  }


  export interface UpdateDoctoeClinicParams {
    appointmentDuring ?: number;
    daysToSeeLastAppointment ?: number;
    checkupPrice ?: number;
  }



export type UpdateDoctorParams = {
  description: string;
  password : string;
  profilePicture : string;
  appointmentDuring : number;
  checkupPrice : number;
  phoneNumber : string;
}

export interface UpdateDoctorForAdminParams {
  email?: string;
  phonenumberForAdmin?: string;
  gender?: string;
  firstname?: string;
  lastname?: string;
}

 export type AddDocrotSpecialtyParams= {
  doctorId : number;
  specialtyId : number;
 }

 export type emailParams= {
  email: string;
 }
 export interface SpecialtyParams  {
  specialtyName:string;
};

export type CreateSubSpecialtyParams = {
  subSpecialtyName:string;
};
export interface ClinicParams  {
  clinicName:string;
  Latitude:number;
  Longitude:number;
};

export interface UpdateClinicParams  {
  clinicName ?:string;
  Latitude ?:number;
  Longitude ?:number;
};

export type InsuranceParams = {
  companyName:string;
};


export type filterDocrotsParams = {
  insuranceId:number;
  subSpecialtyId:number;
  gender : string
};

export type secondFilterDocrotsParams = {
  subSpecialtyId:number;  
    filterName : string;
    orderByEvaluate:boolean;
};

export type patientSignUp = {
  phoneNumber: string;
  password: string;
  firstname: string;
  lastname: string;
  birthDate: string;
  gender: 'ذكر' | 'أنثى';
};


export type verifyParams = {
  patientId: string;
  code: number;
};

export type restPasswordParams = {
  phoneNumber: string;
}

export type newPasswordParams = {
  patientId: number;
  code: number;
  newPassword: string;
}



export type profileDetailsParams = {
  description ?: string;
  phonenumber ?: string;
  profilePicture ?: string;

}


export type createSecretaryParams = {
  email: string;
  phonenumber: string;
  firstname: string;
  lastname: string;
  age: number;
}


export type filterNameParams = {
  filterName : string
}

export type updateAdminParams = {
  email?: string;
  phonenumber?: string;   
  firstname?: string;
  lastname?: string;
  active?: boolean;
  type: TypeEnum;

}

export type evaluateDoctorParams = {
  evaluate: number;
}



export interface WorkTimeWithAppointments {
  workTimeId: number;
  startingTime: string;
  finishingTime: string;
  day: Day;
  date: string;
  haveAppointments: boolean;
}

export interface appointmentwithBooked {
  id: number;
  startingTime: string;
  finishingTime: string;
  isBooked: boolean;
}


export type workTimeFilterParams = {
  month: string;
  year: string;

}

export type LongitudeLatitudeParam = {
  Latitude:number;
  Longitude:number;
}


export type AmountCollectedByAdminParams = {
  month: string;
  year: string;
}
