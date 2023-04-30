
export type CreateAdminParams = {
    email: string;
    password: string;
    phonenumber: string;
  };
  
export type CreateDoctorParams = {
  email: string;
  phonenumberForAdmin: string;
  gender: string
  firstname : string;
  lastname : string;
};

export type UpdateDoctorParams = {
  description: string;
  password : string;
  profilePicture : string;
  appointmentDuring : number;
  checkupPrice : number;
  phoneNumber : string;
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
  gender : string
};
