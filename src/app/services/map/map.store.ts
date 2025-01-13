import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';


/*
 *
 *   ROUTE-CART => { ROUTE[] }
 *
 *
 */
const initialState = {
  /* STATUS-STORE  */
  isLoading: false,
  filter: { query: '', order: 'asc' },
  /* STATUS-STORE  */

  /* DATA-STORE  */
  map: undefined,
  /* DATA-STORE  */
};

export const MapCartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(({ map, ...cart }) => ({
    /*
     *
     *  agregar Map
     */
    setMap: (map: any | null) => {
      if (map == null) {
        patchState(cart, {
          map: undefined,
        });
      } else patchState(cart, { map: map });
    },
    /*
     *
     *  obtener Map
     */
    loadMap() {
      return map();
    },
     
  }))
);
