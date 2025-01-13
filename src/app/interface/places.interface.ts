// ------------
// --Interfaz para usuario que inicia sesion
// ------------

export interface I_Places {
  id?: string;
  coordinates:any,
  name:string,
  address:string
  
}

export interface I_Places_db {

  coordinates:any,
  address:string,
  id?:string,
  name:string,
  user_id:string
  
}
 

export interface I_NominatimResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  name: string;
  display_name: string;
  // ... other properties
}