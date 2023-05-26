enum Day {
  الأحد = 'الأحد',
  الإثنين = 'الإثنين',
  الثلاثاء = 'الثلاثاء',
  الأربعاء = 'الأربعاء',
  الخميس = 'الخميس',
  الجمعة = 'الجمعة',
  السبت = 'السبت',
}
export interface CreateAdminParams {
    email: string;
    phonenumber: string;
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
  active?:boolean
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
  Latitude:string;
  Longitude:string;
};

export interface UpdateClinicParams  {
  clinicName ?:string;
  Latitude ?:string;
  Longitude ?:string;
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
  subSpecialtyId?:number;  
    filterName ?: string;
    orderByEvaluate?:boolean;
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