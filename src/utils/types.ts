
export type CreateAdminParams = {
    username: string;
    password: string;
    phonenumber: string;
  };
  
export type CreateDoctorParams = {
  username: string;
  password: string;
  phonenumber: string;
  gender: boolean
  firstname : string;
  lastname : string;
};

export type UpdateDoctorParams = {
  Descreption: string;
  password : string;
  profilePicture : string;
  appointmentDuring : number;
  checkupPrice : number;
  phonenumber : string;
}
 export type AddDocrotSpecialtyParams= {
  doctorId : number;
  specialtyId : number;
 }

 export type SpecialtyParams = {
  specialtyName:string;
};

export type CreateSubSpecialtyParams = {
  subSpecialtyName:string;
};
export type ClinicParams = {
  clinicName:string;
  location:string;
  locationId:string;
  phonenumber: string;
};

export type InsuranceParams = {
  companyName:string;
};

export type filterDocrotsParams = {
  insuranceId:number;
  subSpecialtyId:number;
  gender : boolean
};
