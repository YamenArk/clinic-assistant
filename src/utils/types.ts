
export interface CreateAdminParams {
    email: string;
    phonenumber: string;
  };
  
  export interface CreateDoctorParams {
    email: string;
    phonenumberForAdmin: string;
    gender: 'male' | 'female';
    firstname: string;
    lastname: string;
    clinics: { clinicId: number }[];
    subSpecialties: { subSpecialtyId: number }[];
    insurances?: { insuranceId: number }[];
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

 export interface SpecialtyParams  {
  specialtyName:string;
};

export type CreateSubSpecialtyParams = {
  subSpecialtyName:string;
};
export interface ClinicParams  {
  clinicName:string;
  location:string;
  locationId:string;
};

export interface UpdateClinicParams  {
  clinicName ?:string;
  location ?:string;
  locationId ?:string;
};

export type InsuranceParams = {
  companyName:string;
};


export type filterDocrotsParams = {
  insuranceId:number;
  subSpecialtyId:number;
  gender : string
};
