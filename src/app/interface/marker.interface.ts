import { Coordinate } from "ol/coordinate";

export interface I_Marker {
  id: string;
  name: string;
  currentPosition: {
    long: number;
    lat: number;
  };
  type:string;
}
