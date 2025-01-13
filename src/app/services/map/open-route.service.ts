import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

import * as ors from 'openrouteservice';

import { Coordinate } from 'ol/coordinate';

// Crea una instancia de la clase Openrouteservice con tu clave de API
const ORS = new ors.default(environment.api_ors);

@Injectable({
  providedIn: 'root',
})
export class OpenRouteService {
  // private apiKey = environment.api_GraphHopper;
  //  -9081059.226249881, 2636147.411602837
  // private apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248694920327f1c4d81ad3c9c7231c5a802&start=8.681495,49.41461&end=8.687872,49.420318';
  private apiKey_graphHopper = environment.api_GraphHopper;
  private apiKey = environment.api_ors;
  private apiUrl = 'https://api.openrouteservice.org';
  private apiUrl_OSRM = 'https://router.project-osrm.org/route';

  // private

  constructor(private http: HttpClient) {}

  getRoute_OSRM(start: number[], end: number[]): Observable<any> {
    const url = `${this.apiUrl_OSRM}/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

    return this.http.get<any>(url);

    // return this.http.post(`https://graphhopper.com/api/1/route?key=${this.apiKey_graphHopper}`, body, { headers });
  }

  // -- SITIO WEB API Open route service
  getRoute(start: number[], end: number[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`, // Replace 'your_api_token' with your actual token
    });

    const apiUrl =
      this.apiUrl +
      '/v2/directions/driving-car?api_key=' +
      this.apiKey +
      '&start=' +
      start[0] +
      ',' +
      start[1] +
      '&end=' +
      end[0] +
      ',' +
      end[1] +
      '&instructions=false';

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('start', `${start[1]},${start[0]}`)
      .set('end', `${end[1]},${end[0]}`);
 

    const request = this.http.get(apiUrl, { headers });

    return request;
  }

  getStreetInformation(coord: Coordinate): Observable<any> {
    // const url = 'https://api.openrouteservice.org/geocode/reverse?' + queryParams.toString();
    // const url = 'https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf6248694920327f1c4d81ad3c9c7231c5a802&point.lon=2.294471&point.lat=48.858268';

    // const apiUrl = this.apiUrl + '/geocode/reverse?api_key=' + this.apiKey + '&point.lon=' + coord[0] + '&point.lat=' + coord[1];

    // const query = coord[1] + ',' + coord[0]; // Reemplaza LATITUD y LONGITUD con las coordenadas del punto que deseas obtener la dirección

    const apiUrl = `https://nominatim.openstreetmap.org/reverse?zoom=18&format=jsonv2&lat=${coord[1]}&lon=${coord[0]}&countrycodes=cu`;

    const request = this.http.get(apiUrl);

    return request;
    // return this.http.get(`https://nominatim.openstreetmap.org/reverse?zoom=18&format=jsonv2&lat=${coord[1]}&lon=${coord[0]}&countrycodes=cu`);
    // return this.http.get(apiUrl);
  }

  searchPlace(place: string): Observable<any> {
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${place}&zoom=18&format=jsonv2&limit=5&countrycodes=cu`;

    const request = this.http.get(apiUrl);

    return request;

    // return this.http.get(
    //   `https://nominatim.openstreetmap.org/search?q=${place}&zoom=18&format=jsonv2&limit=5&countrycodes=cu`
    // );
  }
}
