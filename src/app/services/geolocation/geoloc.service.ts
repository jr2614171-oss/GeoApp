import {
  effect,
  inject,
  Injectable,
  NgZone,
  signal,
  SimpleChange,
} from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';

import Geolocation from 'ol/Geolocation';
import { Coordinate } from 'ol/coordinate';
import * as sphere from 'ol/sphere';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { I_UserSessionStorage } from '../../interface/user.interface';
import { LocationCartStore } from './location.store';

import * as geoCap from '@capacitor/geolocation';
import { FavoritePlaceCartStore } from '../map/favorites_places.store';

@Injectable({
  providedIn: 'root',
})
export class GeolocService {
  locationCartStore = inject(LocationCartStore);

  // public locationStatus = new BehaviorSubject<boolean>(false);

  private geolocation: Geolocation;

  private isWatching: boolean = false;

  private userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    phone_number: '',
    ci_verified: false,
    user_type: '',
  };

  // Variable para almacenar la última ubicación conocida
  private last_currentPosition: Coordinate = [0, 0];
  watchId: any;
  constructor(
    private http: HttpClient,
  ) {
    this.geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000, // Establecer el tiempo máximo de la última ubicación conocida en 1 minutos
      },
    });

    const geolocation_fast = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: false,
        timeout: 5000, // Reducir la frecuencia de actualización
        maximumAge: 5000, // Establecer el tiempo máximo de la última ubicación conocida
      },
    });

    effect(() => {
      
    });
  }

  permissionGPS(autoCheck = false): Promise<boolean> {
    // this.requestPermission();

    return new Promise((resolve, reject) => {
      if (navigator && navigator.geolocation) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then(async (result) => {
            if (result.state === 'granted' || result.state === 'prompt') {
             
              if (!autoCheck){
                
                navigator.geolocation.getCurrentPosition(
                  (data: any) => {
                    // console.log("🚀 ~ .then ~ coord - 2 :", data)

                    const coords: Coordinate = [
                      data.coords.longitude,
                      data.coords.latitude,
                    ];

                    this.locationCartStore.setLocation(coords);
                    this.locationCartStore.setLocationPermission(true);
                    this.locationCartStore.setLocationStatus(true);

                    resolve(true);
                  },
                  async () => {
                    const storedLocation = await this.getLocationByStorage();

                    if (this.checkCoordinates(storedLocation)) {
                      this.locationCartStore.setLocation(storedLocation);
                      this.locationCartStore.setLocationStatus(false);
                    }

                    reject(false);
                  }
                );
              }else if(result.state === 'granted'){
                resolve(true);
              }else{
                resolve(false);
              }
            } else {
              console.error('La geolocalización está desactivada.');
              this.locationCartStore.setLocationPermission(false);

              // Detener la observación de la posición
              this.stopWatchingPosition();
              this.geolocation.getPosition();

              reject(false);
            }
          })
          .catch((error) => {
            this.locationCartStore.setLocationPermission(false);

            console.error(
              'Error al consultar permisos de geolocalización:',
              error
            );
          });
      } else {
        console.error('Geolocalización no soportada en este navegador.');
        this.locationCartStore.setLocationPermission(false);

        reject(false);
      }
    });
  }
  // -----------------------------------

  /*
   * Geoloc Capacitor
   * -- startWatchPosition
   *
   *
   * */

  async startWatchingPosition(
    callback: (position: any) => void
  ): Promise<void> {
    try {
      // Solicitar permiso al navegador
      if (!(await this.permissionGPS())) {
        this.locationCartStore.setLocationStatus(false);
      }

      if (!this.isWatching) {
        const options = {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 3000,
        };

        const watchId = await geoCap.Geolocation.watchPosition(
          options,
          async (position: any) => {
            if (position) {
              const coord = [
                position.coords.longitude,
                position.coords.latitude,
              ];
              // console.log('🚀 ~ position:', coord, this.last_currentPosition);

              if (coord && this.checkCoordinates(this.last_currentPosition)) {
                const distance = sphere.getDistance(
                  this.last_currentPosition,
                  coord
                );
                // console.log('🚀 ~ distance:', distance);

                if (distance > 5) {
                  // console.log('🚀 ~ position > 5M:', coord);
                  this.last_currentPosition = coord;

                  this.locationCartStore.setLocation(coord);
                  this.locationCartStore.setLocationPermission(true);
                  this.locationCartStore.setLocationStatus(true);
                }
                if (distance > 500) {
                   
                }
              } else {
                // console.log('🚀 ~ position > NOT DISTANCE:', coord);
                this.last_currentPosition = coord;

                // this.locationCartStore.setLocation(coord);
                this.locationCartStore.setLocationPermission(true);
                this.locationCartStore.setLocationStatus(true);
              }
            } else {
              const coord = await this.getCurrentPosition();

              // console.log('🚀 ~ position NULL:', coord);
              // this.last_currentPosition = coord;
              this.locationCartStore.setLocation(coord);
              this.locationCartStore.setLocationStatus(false);
            }
          }
        );

        this.isWatching = true;

        // Guardar el watchId para detener el seguimiento más tarde
        this.watchId = watchId;
      }
    } catch (e: any) {
      console.error(e);
      // Manejar errores según tus necesidades

      const storedLocation = await this.getLocationByStorage();

      if (this.checkCoordinates(storedLocation)) {
        this.locationCartStore.setLocation(storedLocation);
        this.locationCartStore.setLocationStatus(false);
      }

      this.stopWatchingPosition();
      setTimeout(() => {
        this.startWatchingPosition(() => {});
      }, 2000);
    }
  }

  /*
   * Geoloc Capacitor
   * --Detener el WatchPosition
   *
   *
   * */
  stopWatchingPosition(): void {
    if (this.isWatching) {
      geoCap.Geolocation.clearWatch({ id: this.watchId });
      this.isWatching = false;
    }
  }
  async stopTrackingPosition(watchId: any) {
    await geoCap.Geolocation.clearWatch({ id: watchId });
  }

  /*
   * Geoloc Capacitor
   * --Obtener permiso de ubicacion
   *
   *
   * */
  async requestLocationPermission() {
    const permission = await geoCap.Geolocation.requestPermissions();
    if (permission.location == 'granted') {
      // console.log('Permiso concedido');
    } else {
      // console.log('Permiso denegado');
    }
  }
  /*
   * Geoloc Capacitor
   * --Obtener ubicacion por storage o por currentPosition
   *
   *
   * */
  async getCurrentPosition(): Promise<Coordinate> {
    const currentPosition = await geoCap.Geolocation.getCurrentPosition();

    const coords = [
      currentPosition.coords.longitude,
      currentPosition.coords.latitude,
    ];
    // console.log('🚀 ~ getCurrentPosition ~ coords:', coords);

    return coords;
  }
  /*
   *
   * --Obtener ubicacion por storage o por currentPosition
   *
   *
   * */
  async getLocationByStorage(): Promise<Coordinate> {
    const coord = {
      storage: [0, 0],
      fast: [0, 0],
    };

    try {
      // -- Obtener CurrentPosition
      coord.fast = await this.getCurrentPosition();
      // console.log('🚀 ~ getLocationByStorage ~ currentPosition:', coord.fast);
    } catch (e: any) {
      // -- Obtener Storage
      
    }

    if (this.checkCoordinates(coord.fast)) {
       

      return coord.fast;
    } else {
      if (this.checkCoordinates(coord.storage)) {
        return coord.storage;
      } else {
         
        return [0, 0];
      }
    }
  }
 
  

  checkCoordinates(coord: Coordinate | undefined): boolean {
    if (coord && coord[0] != 0 && coord[1] != 0) {
      return true;
    } else return false;
  }

  /* *
   *
   * -- Verifica si hay cambios en las coordenadas
   *
   */

  hasCoordinateChanged(changes: SimpleChange) {
    const hasChange: boolean =
      changes.firstChange ||
      (changes.previousValue && changes.currentValue !== changes.previousValue);
    // console.log('hasCoordinateChanges=> ', hasChange)
    return hasChange;
  }
}
