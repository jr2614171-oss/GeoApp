import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { DataService } from '../data/data.service';
import { StorageService } from '../storage/storage.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, catchError, finalize, map, tap, throwError } from 'rxjs';
import { I_Places, I_Places_db } from '../../interface/places.interface';
import { UserCartStore } from '../users/user.store';
import { I_UserSessionStorage } from '../../interface/user.interface';


const BASE_URL = environment.FAVORITES_PLACES_API;


@Injectable({
  providedIn: 'root'
})
export class FavoritesPlacesService {

  userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    phone_number: '',
    ci_verified: false,
    user_type: ''
  };
  /*
   *
   *  STORE
   *
   */

  userCartStore = inject(UserCartStore);


  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private router: Router,
    private storageService: StorageService
  ) { 
    

    effect(() => {
      
      /* DATA */
      this.userData = this.userCartStore.loadUserValue();
      
      /* DATA */
    });
    
  }


  /*
   *
   *   FAVORITE-PLACES SIGNAL
   * -> ofertas que fueron aceptadas del viaje
   *
   */
  // private favoritePlacesSignal = signal<I_Places[]>([]);

  // // Getter para exponer el Signal de oferta
  // get favoritePlacesSignal$() {
  //   return this.favoritePlacesSignal.asReadonly();
  // }

  // // Método para actualizar los datos oferta
  // setfavoritePlacesSignal(favoritePlaces: I_Places[] | null) {
  //   if (favoritePlaces == null) {
  //     this.favoritePlacesSignal.set([]);
  //   } else this.favoritePlacesSignal.set(favoritePlaces);
  // }
  

  // ----------------------------------
  // TODO: funcion para guardar formulario de solicitud de viaje   
  // ----------------------------------
  savePlace(dataForm: I_Places, user_id:string): Observable<any> {

    const url = `${BASE_URL}` ;
  
    const placeData: I_Places_db = {
      user_id: user_id,
      coordinates: dataForm.coordinates,
      name: dataForm.name,
      address: dataForm.address
    };

    // console.log('Favorite Places save', placeData); 
    return this.http.post<any>(url, placeData).pipe(

      tap((data: any) => {

        // console.log('Favorite Places', data);

      }),


      catchError(this.handleError)
    );


  }

  // ----------------------------------
  // TODO: funcion para actualizar formulario de solicitud de viaje   
  // ----------------------------------
  updatePlace(id:string, place:I_Places): Observable<any> {

    const user_id: string = this.userCartStore.loadUserValue().id;

    const placeData: I_Places_db = {
      user_id: user_id,
      coordinates: place.coordinates,
      address: place.address,
      name: place.name
    };

    const url = `${BASE_URL}update/${id}`;

    return this.http.patch<any>(url, place).pipe(
      tap((data: any) => {
        // Realizar acciones con los datos si es necesario
      }),
      
    );
  }


  // ----------------------------------
  // TODO: funcion para eliminar formulario de solicitud de viaje   
  // ----------------------------------
  deletePlace(id:string): Observable<I_Places_db> {

    // const token = this.storageService.f_getToken();

    const url = `${BASE_URL}/place_id=${id}`;

    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + token, // Ejemplo de encabezado de autorización si es necesario
    //   'Content-Type': 'application/json' // Ejemplo de encabezado de tipo de contenido si es necesario
    // });

    return this.http.delete<I_Places_db>(url).pipe(
      tap((data: any) => {
        // Realizar acciones con los datos si es necesario
      }),
      
    );
  }

  
   // ----------------------------------
  // TODO: funcion para obtener Lugares   
  // ----------------------------------
  getPlaceByUser(user_id:string): Observable<any> { 

    const random: number = Math.random();

    const url = `${BASE_URL}by_user/${user_id}?random=${random}`;

    return this.http.get<any>(url).pipe(
      map(data => data),
      catchError(this.handleError),
      finalize(() => {
        // console.log('Petición completada');
      })
    );
     
  }

  // ----------------------------------
  // TODO: funcion para manejar errores
  // ----------------------------------
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // console.log('Se ha producido un error ', error.error);
      this.dataService.showMsj('Ha ocurriddo un error, por favor intente más tarde.', 'Error.', 'danger');

    } else if (error.status === 400) {
      console.error('Error en la petición ' + error.status)

    } else if (error.status === 401) {

      console.error('Sin Autorización! ' + error.status);
      this.dataService.showMsj('Credenciales Incorrectas, por favor rectifique.', 'Error.', 'danger');

    } else if (error.status === 500) {

      console.error('Error en el Servidor ' + error.status);
      this.dataService.showMsj('Ha ocurriddo un error, por favor si es posible comuníquese con nosotros.', 'Error.', 'danger');

    }
    else {
    }
    return throwError(() => new Error(`${error.status}`));


  }
}
