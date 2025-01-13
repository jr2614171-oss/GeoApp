 

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Coordinate } from 'ol/coordinate';

 
/*
 *
 *   LOCATION-CART => { }
 *
 *
 */
const initialState = {
  /* STATUS-STORE  */
  isLoading: false,
  filter: { query: '', order: 'asc' },
  /* STATUS-STORE  */

  /* DATA-STORE  */
  
  location: <Coordinate>([0,0]),
  location_status: <boolean>(false),
  location_permission: <boolean>(true)
  /* DATA-STORE  */
};

export const LocationCartStore = signalStore(
  {providedIn : 'root'},
  withState(initialState),
  withMethods(({ location, location_permission, location_status, ...cart }) => ({
    
    
    /*------------------------------
     *
     *  agregar Ubicacion Actual
     */
    setLocation: (location: Coordinate | null) => {
      
      if(location == null){
        
        patchState(cart, {location: [0,0]});


      } else
      patchState(cart, { location: location });
    },
    /*
     *
     *  obtener location
     */
    loadLocation() {
      return location();
    },

     /*------------------------------
     *
     *  agregar Ubicacion Status
     */
    setLocationStatus: (status: boolean) => {
      
      patchState(cart, { location_status: status });
    },
    /*
     *
     *  obtener location Status
     */
    loadLocationStatus() {
      return location_status();
    },
     
     /*------------------------------
     *
     *  agregar Ubicacion Permission
     */
    setLocationPermission: (permission: boolean) => {
      
      patchState(cart, { location_permission: permission });
    },
    /*
     *
     *  obtener location Permission
     */
    loadLocationPermission() {
      return location_permission();
    },
     


  }))
);

