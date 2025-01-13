
import { effect, inject, Injectable, signal } from '@angular/core';

// -- ol map
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';
import { LineString } from 'ol/geom';
import Map from 'ol/Map';

// -- ol map

// --- CONSTANT
import {
  MARKER_STYLE,
  ROUTE_STYLE,
  DEFAULT_OPTIONS_MAP,
  MAP_OPTIONS,
} from '../../modules/public-module/components/page-geo/data/data-map';


import { I_Marker } from './../../interface/marker.interface';

import * as Proj from 'ol/proj';
import { View } from 'ol';
import { OpenRouteService } from './open-route.service';
import { I_Places, I_NominatimResult } from '../../interface/places.interface';
import { Rotate, ScaleLine } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import { BingMaps, OSM, StadiaMaps, XYZ } from 'ol/source';
import { MapCartStore } from './map.store';
// -- constant



@Injectable({
  providedIn: 'root',
})
export class OlMapMarkerService {
  marker: Feature | undefined;
  private markersSignal = signal<Feature[]>([]);
  private map: any;
  private markerStyles = MARKER_STYLE;
  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer({
    source: this.vectorSource,
  });

  /*
   *
   *  STORE
   *
   */
  mapCartStore = inject(MapCartStore);

  lineRoute: Feature = new Feature();

  baseMapLayer: any;

  constructor(private openRouteService: OpenRouteService) {
    effect(() => {
      // this.markers = mapService.markersData$();
      this.baseMapLayer = this.mapCartStore.loadMap();
    });
  }

  // Getter para exponer el Signal de los datos de usuario
  get markersData$() {
    return this.markersSignal;
  }

  // Método para actualizar los datos de usuario
  setMarkerSignal(marker: Feature[]) {
    this.markersSignal.set(marker);
  }

  // --------------------------------------------
  // -- Inicializar marcador en el mapa
  // --------------------------------------------
  initMarker(
    markers: Feature[],
    coord: Coordinate,
    client: I_Marker
  ): Feature[] {
    // -- si el marcador existe
    if (markers.some((marker) => marker.get('client').id === client.id)) {
      return markers;
    }

    // Crear un nuevo Feature con la geometría Point en las coordenadas especificadas

    const createMarker = (style: Style) => {
      const marker = new Feature({
        geometry: new Point(fromLonLat(coord)),
        client: client,
        type: 'data',
      });
      marker.setStyle(style);
      return marker;
    };

    const marker = createMarker(this.markerStyles[client.type]);
    const markerShadow = createMarker(this.markerStyles['shadow']);

    if (client.type === 'user') {
      markers.push(markerShadow);
    }
    markers.push(marker);

    // this.markersSignal.set(markers);

    return markers;
  }

  public updateMarkers(
    markers: Feature[],
    coord: Coordinate,
    client: I_Marker
  ): Feature[] {
    const indexToUpdate = markers.findIndex(
      (marker) => marker.get('client').id === client.id
    );

    if (indexToUpdate === -1) {
      return this.initMarker(markers, coord, client);
    }

    const { shadow, ...styles } = this.markerStyles;
    const markerStyles: Record<string, Style> = {
      data_shadow: shadow,
      data: styles[client.type],
    };

    return markers.map((marker) => {
      if (marker.get('client').id === client.id) {
        // Actualiza la geometría (coordenadas)
        marker.setGeometry(new Point(fromLonLat(coord)));

        // Actualiza las propiedades, manteniendo las existentes y cambiando solo el 'client.type'
        marker.setProperties({
          ...marker.getProperties(), // Mantiene las propiedades existentes
          client: {
            ...marker.get('client'), // Mantiene las propiedades del objeto 'client'
            type: client.type, // Actualiza solo 'type'
          },
        });
      }
      return marker;
    });
  }

  findMarker(markers: Feature[], client: I_Marker): Feature {
    // Buscar el índice del marcador que se va a actualizar
    const indexToUpdate = markers.findIndex(
      (marker) => marker.get('client').id === client.id
    );

    if (indexToUpdate === -1) {
      return new Feature();
    }

    // this.markersSignal.set(markers);

    return markers[indexToUpdate];
  }

  removeMarker(markers: Feature[], clientId: string): Feature[] {
    // Buscar el índice del marcador que se va a actualizar
    const indexToRemove = markers.findIndex(
      (marker) =>
        marker.get('client').id === clientId && marker.get('type') == 'data'
    );
    if (indexToRemove !== -1) markers.splice(indexToRemove, 1);

    const indexToRemove_text = markers.findIndex(
      (marker) =>
        marker.get('client').id === clientId && marker.get('type') == 'text'
    );
    if (indexToRemove_text !== -1) markers.splice(indexToRemove_text, 1);
    // if (indexToRemove_text !== -1)

    // this.markersSignal.set(markers);

    return markers;
  }

  /* 
  PINTAR LA RUTA
  */
  drawRoute(
    startPoint: Coordinate,
    endPoint: Coordinate
  ): Promise<{
    route: [Feature, Feature];
    distance: number;
    time: number;
    coordinates: Coordinate[];
  }> {
    return new Promise((resolve, reject) => {
      this.openRouteService.getRoute(startPoint, endPoint).subscribe({
        next: (response: any) => {
          const coordinates = response.features[0].geometry.coordinates;

          const distance = isNaN(
            parseFloat(response.features[0].properties.summary.distance)
          )
            ? 0
            : response.features[0].properties.summary.distance;

          const time = isNaN(
            parseFloat(response.features[0].properties.summary.duration)
          )
            ? '0'
            : response.features[0].properties.summary.duration;

          // console.log(response);

          const styleLine = ROUTE_STYLE['default'];
          const styleLineBorder = ROUTE_STYLE['border'];

          const lineRoute = new Feature({
            geometry: new LineString(coordinates).transform(
              'EPSG:4326',
              'EPSG:3857'
            ),
          });
          const lineRouteBorder = new Feature({
            geometry: new LineString(coordinates).transform(
              'EPSG:4326',
              'EPSG:3857'
            ),
          });

          lineRoute.setStyle(styleLine);

          resolve({
            route: [lineRoute, lineRouteBorder],
            distance,
            time,
            coordinates,
          });
        },
        error: (error: any) => {
          // Manejar errores al obtener el estado del socket
          console.error('Error en la solicitud a GraphHopper:', error);
          reject(error);
        },
        complete: () => {
          // Realizar acciones adicionales cuando el observable se completa, si es necesario
        },
      });
    });
  }

  getAddress(coord: Coordinate): Promise<{ address: string }> {
    return new Promise((resolve, reject) => {
      this.openRouteService.getStreetInformation(coord).subscribe({
        next: (response: any) => {
          let road = response.address.road;
          let neighbourhood = response.address.neighbourhood;
          let suburb = response.address.suburb;
          let city = response.address.city;
          let state = response.address.state;

          const address = `${road === undefined ? '' : road + ','} ${
            neighbourhood === undefined ? '' : neighbourhood + ','
          } ${city === undefined ? state : city}`;

          resolve({ address });
        },
        error: (error: any) => {
          reject('Error de conexión.');
        },
        complete: () => {
          // Realizar acciones adicionales cuando el observable se completa, si es necesario
        },
      });
    });
  }

  searchPlaces(place: string): Promise<I_Places[]> {
    return new Promise((resolve, reject) => {
      this.openRouteService.searchPlace(place).subscribe({
        next: (response: any) => {
          const places: I_Places[] = [];

          response.forEach((p_place: I_NominatimResult) => {
            const place: I_Places = {
              address: p_place.display_name,
              coordinates: {
                latitude: +p_place.lat,
                longitude: +p_place.lon,
              },
              id: p_place.place_id, // no hay id en la respuesta de la API, así que lo dejamos vacío
              name: p_place.name,
            };

            places.push(place);
          });

          resolve(places);
        },
        error: (error: any) => {
          reject([]);
        },
        complete: () => {
          // Realizar acciones adicionales cuando el observable se completa, si es necesario
        },
      });
    });
  }

  printMarkers(data: any[], type: string) {
    // Código de la función aquí

    for (let i = 0; i < data.length; i++) {
      const _data = data[i];

      let coord: Coordinate;
      let client: I_Marker;
      const markers = this.markersSignal();

      switch (type) {
        case 'favorite_places':
          coord = [_data.coordinates.longitude, _data.coordinates.latitude];

          client = {
            id: `${_data.id}`,
            name: ``,
            currentPosition: {
              lat: coord[1],
              long: coord[0],
            },
            type: type,
          };

          return this.initMarker(markers, coord, client);

          break;
        case 'travel_origin':
          coord = [
            _data.origin_coordinate.longitude,
            _data.origin_coordinate.latitude,
          ];

          client = {
            id: `${_data.id}`,
            name: ``,
            currentPosition: {
              lat: coord[1],
              long: coord[0],
            },
            type: type,
          };
          return this.initMarker(markers, coord, client);
          break;
        case 'travel_destination':
          coord = [
            _data.destination_coordinate.longitude,
            _data.destination_coordinate.latitude,
          ];

          client = {
            id: `${_data.id}`,
            name: ``,
            currentPosition: {
              lat: coord[1],
              long: coord[0],
            },
            type: type,
          };

          return this.initMarker(markers, coord, client);
          break;

        default:
          return [];
          break;
      }
    }
    return [];
  }

  // --------------------------------------------
  // -- Inicializar el mapa
  // --------------------------------------------

  getMapConfig(type: string) {
    return MAP_OPTIONS[type];
  }

  getMap(
    type: string = 'normal',
    options: {
      mapEl: any;
      coord_center: Coordinate;
      zoom: { value: number; min: number; max: number };
    },
    layers: { vectorLayer: any; route_origin: any; route_destination: any }
  ): Map {
    this.baseMapLayer = this.mapCartStore.loadMap();

    const scaleControl = new ScaleLine({
      units: 'metric',
      bar: true,
      text: true,
      minWidth: 100,
  });

    if (!this.baseMapLayer) {
      if (type == 'smooth') {
        this.baseMapLayer = new TileLayer({
          source: new StadiaMaps({
            layer: 'alidade_smoot',
            retina: true,
            cacheSize: 512 * 1024 * 1024,
          }),
        });
      } else if (type == 'smooth_dark') {
        this.baseMapLayer = new TileLayer({
          source: new StadiaMaps({
            layer: 'alidade_smooth_dark',
            retina: true,
            cacheSize: 512 * 1024 * 1024,
          }),
        });
      } else {
        // -- capa principal del mapa
        this.baseMapLayer = new TileLayer({
          source: new OSM({
            cacheSize: 512 * 1024 * 1024,
            opaque: false,
            interpolate: true,
            transition: 0,
            zDirection: 1, // Cambiar a 1 para mejorar la visualización
            reprojectionErrorThreshold: 1.0, // Aumentar el umbral
            wrapX: true,
          }),
        });
      }

      this.mapCartStore.setMap(this.baseMapLayer);
    }

    // -- control de rotacion del mapa
    const rotateControl = new Rotate();

    const map = new Map({
      target: options.mapEl,
      layers: [this.baseMapLayer],
      view: new View({
        center: Proj.fromLonLat([
          options.coord_center[0],
          options.coord_center[1],
        ]),
        minZoom: options.zoom.min,
        maxZoom: options.zoom.max,
        zoom: options.zoom.value,
      }),
      controls: [rotateControl],
    });

    if (layers.vectorLayer) map.addLayer(layers.vectorLayer);
    if (layers.route_origin) map.addLayer(layers.route_origin);
    if (layers.route_destination) map.addLayer(layers.route_destination);

    return map;
  }

  /*
   *
   * -- Remover layers del mapa (menos la capa base del mapa)
   *
   * */
  removeAllLayers(map: Map): Map {
    if (map) {
      const layers = map.getLayers();
      const layersToRemove: any[] = [];

      layers.forEach((layer: any) => {
        // Puedes agregar condiciones aquí para mantener ciertas capas
        // Por ejemplo, si quieres mantener la capa base OSM:
        if (!(layer instanceof TileLayer)) {
          layersToRemove.push(layer);
        }
      });

      layersToRemove.forEach((layer) => {
        map.removeLayer(layer);
      });
    }

    return map;
  }
  /*
   *
   * -- Agregar layers del mapa (menos la capa base del mapa)
   *
   * */
  addLayers(map: Map, layer: any): Map {
    if (map) {
      map.addLayer(layer);
    }

    return map;
  }

  // --------------------------------------------
  // -- Establecer tamaño del mapa
  // --------------------------------------------
  setSizeMap(options: { height: string; width: string }, elementEl: any) {
    const styles = elementEl.style;
    styles.height =
      coerceCssPixelValue(options.height) || DEFAULT_OPTIONS_MAP.height;
    styles.width =
      coerceCssPixelValue(options.width) || DEFAULT_OPTIONS_MAP.width;

    return elementEl;
  }
}

// --------------------------------------------
// -- Propiedades de estilos necesarias para pintar el mapa
// --------------------------------------------
const cssUnitsPattern = /([A-Za-z%]+)$/;

function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return cssUnitsPattern.test(value) ? value : `${value}px`;
}
