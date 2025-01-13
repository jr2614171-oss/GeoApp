import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Injector,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as sphere from 'ol/sphere';
  
import { catchError, finalize, map, take, tap } from 'rxjs';
import { ErrorLocationComponent } from '../../shared/errors/error-location/error-location.component';

import { MatCardModule } from '@angular/material/card';

import { MatSnackBar } from '@angular/material/snack-bar';

import { Coordinate } from 'ol/coordinate';
// -- Components
import { MapPageComponent } from './map-page/map-page.component';
 
// -- Services
import { GeolocService } from '../../../../services/geolocation/geoloc.service'; 
import {
  I_UserSessionStorage,
} from '../../../../interface/user.interface';
import { LocationCartStore } from '../../../../services/geolocation/location.store';

// -- Services

@Component({
  selector: 'app-page-geo',
  imports: [
    MapPageComponent,
    ErrorLocationComponent,
    MatCardModule,
  ],
  templateUrl: './page-geo.component.html',
  styleUrl: './page-geo.component.scss',
})
export class PageGeoComponent
  implements OnInit, AfterViewInit, OnChanges
{
  /*
   *
   * -- INFO
   *
   * . inicia los signals
   * . -> constructor
   *
   * . inicia la funcion para obtener ubicacion del usuario
   * . -> getLocation
   *
   *
   */

  /*
   *
   * @ INJECT
   *
   */

  private injector = inject(Injector);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private _snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private geolocService = inject(GeolocService);

  private locationCartStore = inject(LocationCartStore);
 

  /*
   *
   * @SIGNALS
   *
   */
     
  s_location_status = signal(true);
  s_permission_location = signal(true);
 

  s_coord_user = signal<Coordinate>([0, 0]);
  s_coord_destination = signal<Coordinate>([0, 0]);
  
  constructor() {
    // obtengo el parametro en la ruta
    this.route.queryParams.subscribe((params) => {
      
    });

    this.initializeEffects();

    this.getLocation();
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnDestroy(): void {
     
  }
  ngAfterViewInit(): void {}

  async ngOnInit() {
      
  }

  /**
   *
   * --inicia los effect para signals
   *
   *  */
  private initializeEffects(): void {
    this.effectLocation();
     
  }
  /**
   *
   * --EFFECT para LOCATION
   *
   *  */
  private effectLocation(): void {
    // Effect para LOCATION
    effect(
      () => {
        /** Effect para LOCATION_STATUS */
        this.s_location_status.set(this.locationCartStore.loadLocationStatus());

        /** Effect para PERMISSION_STATUS */
        this.s_permission_location.set(
          this.locationCartStore.loadLocationPermission()
        );

        /** Effect para COORD USER */
        const coord_user = this.locationCartStore.loadLocation();
        // console.log("🚀 ~ effectLocation ~ coord_user:", coord_user)
        if (this.geolocService.checkCoordinates(coord_user)) {
          this.s_coord_user.set(coord_user);
        }
      },
      { injector: this.injector }
    );
  }
  

  /*
   *
   * cancela la busqueda de la localizacion y vueve a obtener localizacion del usuario
   *
   */
  reload_location() {
    this.geolocService.stopWatchingPosition();

    this.getLocation();
  }
 

  /*
   *
   *
   * Buscar coordinadas en el storage
   */
  async getLocationByStorage() {
    const coord = await this.geolocService.getLocationByStorage();
    // console.log("🚀 ~ getLocationByStorage ~ coord:", coord)

    if (coord && this.geolocService.checkCoordinates(coord)) {
      this.s_coord_user.set(coord);
    }
    // console.log("🚀 ~ getLocationByStorage ~ this.s_coord_user:", this.s_coord_user())
  }

  /*
   *
   * Obtener la ubicacion del usuario
   *
   */
  async getLocation() {
    // -- Buscar posicion en el Storage
    this.getLocationByStorage();

    // -- Mantener activa la ubicacion ante movimiento
    this.geolocService.startWatchingPosition((currentPosition: Coordinate) => {
      // console.log("🚀 ~ this.geolocService.startWatchingPosition ~ currentPosition:", currentPosition)
       

      // console.log('setLocation ',this.coord_origin, currentPosition)
      const distance = sphere.getDistance(this.s_coord_user(), currentPosition);
    });
  }
}
