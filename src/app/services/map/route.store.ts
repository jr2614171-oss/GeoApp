import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { I_Offers, I_OffersProccess } from '../../interface/offers.interface';


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
  byTravel: <any[]>[],
  /* DATA-STORE  */
};

export const RouteCartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(({ byTravel, ...cart }) => ({
    /*
     *
     *  agregar Route byTravel
     */
    setByTravel: (routes: any[] | null) => {
      if (routes == null) {
        patchState(cart, {
          byTravel: [],
        });
      } else patchState(cart, { byTravel: routes });
    },
    /*
     *
     *  obtener Route ByTravel
     */
    loadByTravel() {
      return byTravel();
    },
     
  }))
);
