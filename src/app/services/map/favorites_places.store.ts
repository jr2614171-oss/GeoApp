 

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { I_Places } from '../../interface/places.interface';
 


/*
 *
 *   FAVORITE_PLACES-CART => { }
 *
 *
 */
const initialState = {
  /* STATUS-STORE  */
  isLoading: false,
  filter: { query: '', order: 'asc' },
  /* STATUS-STORE  */

  /* DATA-STORE  */
  
  favorite_places: <I_Places[]>([]),
  favorite_place: <I_Places>({
     name: '',
     address: '',
     coordinates: {}
  }),
  /* DATA-STORE  */
};

export const FavoritePlaceCartStore = signalStore(
  {providedIn : 'root'},
  withState(initialState),
  withMethods(({ favorite_places, ...cart }) => ({
    
    
    /*------------------------------
     *
     *  agregar FavoritePlafavorite_places
     */
    setFavoritePlaces: (favorite_places: I_Places[]| null) => {
      
      if(favorite_places == null){
        
        patchState(cart, {favorite_places: []});


      } else
      patchState(cart, { favorite_places: favorite_places });
    },
    /*
     *
     *  obtener favorite_places
     */
    loadFavoritePlaces() {
      return favorite_places();
    },
     


  }))
);

