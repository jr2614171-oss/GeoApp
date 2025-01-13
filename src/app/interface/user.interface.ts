import { Coordinate } from "ol/coordinate";


export interface I_UserSession {
  id: string;
  ci: string;
  ci_verified: boolean,
  name: string;
  email: string;
  exp: number;
  iat: number;
  phone_number: string;
  user_type:string; 
  status?:any; 
}

export interface I_UserSessionStorage {
  id: string;
  name: string;
  ci?: string;
  ci_verified: boolean,
  phone_number: string;
  email_verified?: boolean;
  exp?: number;
  iat?: number;
  picture?: string;
  picture_gdrive?: any;
  description?: any;
  email: string;
  user_type: string;
  status?:any;
  last_connected?:any,
  date_created?: string

}

// export interface I_UserDrivers {
  
// }

export interface I_UserTraveler {
  id: string;
  ci: string;
  ci_verified: boolean,
  name: string;
  email: string;
  phone_number: string;
}


export interface I_UserMap {
  id: string;
  name: string;
  markerColor:string;
  currentPosition: {
    long: number;
    lat: number;
  };
  type:string;
}

// export interface I_ConnectedUser {
//   id: string;
//   user: I_UserSessionStorage;
//   currentPosition: {
//     lat: number;
//     long: number;
//   };
// }