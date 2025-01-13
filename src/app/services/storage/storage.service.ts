import { Injectable } from '@angular/core';


// -- modulo para manejar token 
import * as jwtDecode from 'jwt-decode';
// import { CookieService } from 'ngx-cookie-service';

import { I_UserSessionStorage } from '../../interface/user.interface';
import { LocalStorageService } from '../../global_ref_variables/localStorage';


const USER_KEY = 'auth-user';

interface itemToSaveOnStorage {
  id?: string;
  timestamp?: string | number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  localStorage:any;


  constructor(
    private localStorageRef: LocalStorageService,
    // private cookieService: CookieService
  ) {

    this.localStorage = localStorageRef.nativeLocalStorage;
   }


  clean(): void {
    if (this.localStorage) {
      this.localStorage.removeItem(USER_KEY);
      this.localStorage.removeItem('token');
    }
  }
  cleanStorage(): void {
    if (this.localStorage) {
      this.localStorage.clear();
    }
  }

  public saveUser(user: I_UserSessionStorage): void {

    if (this.localStorage) {
      // this.localStorage.removeItem(USER_KEY);
      this.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
      // console.log("🚀 ~ StorageService ~ saveUser ~ user:", user)

    // sessionStorage.removeItem(USER_KEY);
    // sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    if (this.localStorage) {

      const user = this.localStorage.getItem(USER_KEY);

      if (user) {
        return JSON.parse(user);
      }
    }
    return {};
  }

  public isLoggedIn(): boolean {

    // Accede a la propiedad localStorage del objeto window
    if (this.localStorage) {

      return this.localStorage.getItem(USER_KEY) !== null;
    }

    return false;
  }

  // TODO -- COOKIES



  f_setToken_cookies(token: string, name: string = 'token') {
    // const tokenData = this.decodeToken(token);
    // const expirationDate = new Date(tokenData.exp * 1000); // convert seconds to milliseconds
    // this.cookieService.set(name, token, {
    //   sameSite: 'Strict',
    //   secure: true,
    //   expires: expirationDate
    // });
  }

  f_getToken_cookies(name: string = 'token'): string {
    // return this.cookieService.get(name);
    return '';
  }

  f_removeToken_cookies(name: string = 'token') {
    // this.cookieService.delete(name);
  }
  // TODO -- COOKIES

  // TODO ----- TOKEN   

  f_setToken(token: string, name: string = 'token') {

    // const tokenDecode = this.decodeToken(token);
    // const expiresAt = new Date(tokenDecode.exp * 1000); // convert seconds to milliseconds

    // const tokenData = { token, expiresAt };

    if (this.localStorage) {

      this.localStorage.setItem(name, token);
    }

  }
  decodeToken(token: string): any {
    try {

      if(!token) return null;
      
      return jwtDecode.jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  f_getToken(token: string = "token"): string {

    if (this.localStorage) {
      const token_storage = this.localStorage.getItem(token)
      return token_storage ? token_storage : '0';
    }

    return '';
  }


   /*
   *
   * -- Agrega el item al Storage
   * -> item es el objeto a guardar
   * -> p_index es el index dentro de el objeto 
   * -> labelToSave es el label con el que se identifica el objeto en el Storage 
   */

   saveOnStorage(item: itemToSaveOnStorage, p_index:string, labelToSave: string) {


    const storedItem: any = this.getOnStorage(labelToSave);

    storedItem[p_index] = storedItem[p_index] || [];

    const storedItemLength = Object.keys(storedItem[p_index]).length;

    const index = storedItem[p_index].findIndex((storedItem:any) => (storedItem.id === item.id) || (storedItem.timestamp == item.timestamp));
    if (storedItemLength && storedItemLength >= 10 || index != -1) {

      storedItem[p_index][index] = item;
    } else {
      // Agregar el nuevo mensaje al array de chats del viaje
      

      storedItem[p_index].push(item);

    }


      // Guardar los chats actualizados en el almacenamiento local
      this.setOnStorage(labelToSave, storedItem);
  }

  /*
   *
   * -- // obtener lugares del almacenamiento local
   *
   */
  getOnStorage(labelToGet: string = '') {
    if (this.localStorage) {
      // Uso seguro de 'localStorage'

      // Obtener items existentes del almacenamiento local
      const storedItemsJson = this.localStorage.getItem(labelToGet);
      const storedItems = storedItemsJson
        ? JSON.parse(storedItemsJson)
        : {};

      return storedItems;
    }

    return {};
  }


  /*
   *
   * -- // Guardar un objeto en el almacenamiento local
   *
   */
  private setOnStorage(labelToSave:string, storedItem:any) {
    if (this.localStorage) {
      this.localStorage.setItem(labelToSave, JSON.stringify(storedItem));
    }
  }

  // TODO ------- TOKEN 


  // isBrowser(): boolean {
  //   return typeof window !== 'undefined';
  // }
}
