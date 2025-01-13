import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { GeolocService } from '../../../../../services/geolocation/geoloc.service';
import { Coordinate } from 'ol/coordinate';

@Component({
    selector: 'app-error-location',
    imports: [MatCardModule],
    templateUrl: './error-location.component.html',
    styleUrl: './error-location.component.scss'
})
export class ErrorLocationComponent {

  constructor(
    private geolocService: GeolocService
  ){

  }
// -------------------------------------------
  // TODO -- cancela la busqueda de la localizacion y vueve a obtener localizacion del usuario
  // -------------------------------------------
  reload_location() {
    this.geolocService.stopWatchingPosition();

    this.geolocService.permissionGPS();

    // -- Mantener activa la ubicacion ante movimiento
    this.geolocService.startWatchingPosition((currentPosition: Coordinate) => {
      // Aquí puedes manejar la nueva posición del usuario
    });
  }
}
