import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChange,
  SimpleChanges,
  input,
  Injector,
} from '@angular/core';

import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

// -- Openlayers
import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { Feature, Overlay, VectorTile } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
// -- Openlayers

// --interfaces
import { I_Marker } from '../../../../../interface/marker.interface';
import { I_UserSessionStorage } from '../../../../../interface/user.interface';
import { I_Places } from '../../../../../interface/places.interface';
 
// -- services
import { GeolocService } from '../../../../../services/geolocation/geoloc.service';

import { InfoLoadingComponent } from '../../../shared/errors/info-loading/info-loading.component';
import { MapCartStore } from '../../../../../services/map/map.store';
import { OlMapMarkerService } from '../../../../../services/map/ol-map-marker.service';

@Component({
  selector: 'app-map-page',
  imports: [
    CommonModule,
    MatCardModule,
    InfoLoadingComponent,
  ],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.scss',
})
export class MapPageComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  /*
   *
   * -- INFO
   *
   * . obtiene variable coordenadas de la posicion del usuario
   * . -> ngOnChanges
   *
   * . inicializa el mapa
   * . -> initMap
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
  private elementRef = inject(ElementRef);
  private mapService = inject(OlMapMarkerService);
  private route = inject(ActivatedRoute);
  private geolocService = inject(GeolocService);
  mapCartStore = inject(MapCartStore);

  /*
   *
   * @INPUTS
   *
   */
  
  readonly location_status = input<boolean>(true);

  readonly coord_user = input<Coordinate>([0, 0]);

  /*
   *
   * @SIGNALS
   *
   */

  s_address = signal('buscando..');
  s_distance = signal('0');
  s_methodToShowFooter = signal('');
  s_footerDisplayed = signal(false);
   
  s_location_status = signal(this.location_status());
  

  s_map = signal<any>;

  s_coord_user = signal<Coordinate>(this.coord_user());
  s_coord_destination = signal<Coordinate>([0, 0]);

  s_matchingFavoritePlace = signal<I_Places>({
    id: '',
    address: '',
    name: '',
    coordinates: {},
  });

  /*
   *
   *  STORE
   *
   */

  map: any;
  @Output() reload_location = new EventEmitter<void>();
  @Output() reload_connection = new EventEmitter<void>();
  @Output() reload_favoritePlaces = new EventEmitter<void>();

  // --
  initPosition = true;

  // ------------------
  // -- Marcadores
  // ------------------
  lineRoute: Feature = new Feature();
  markers: Feature[] = [];
  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer();
  // ------------------
  // -- Marcadores
  // ------------------

  // --

  map_type: string = '';

  client: I_Marker = {
    id: `${'coord_user'}`,
    name: '',
    currentPosition: {
      long: this.s_coord_user()[0],
      lat: this.s_coord_user()[1],
    },
    type: 'user',
  };

  loadingSocketBtn: boolean = false;

  constructor() {
    this.initializeEffects();
  }

  @HostListener('window:visibilitychange', ['$event']) // O 'window:blur', 'window:focus'
  async onVisibilityChange(event: Event) {
    if (document.visibilityState === 'visible') {
      // console.log('VISIVILITY CHANGE ACTIVE => ', event)

      setTimeout(() => {
        this.addMarkerAfterPosition();
 
        this.updateMarkers();
      }, 2);
    } else if (document.visibilityState === 'hidden') {
    }
  }

  /* *
   *
   * --INIT
   *
   *  */
  ngOnInit(): void {
    if (this.map == undefined) {
      this.initMap();
      this.initMapEventClick();
    }
  }

  /* *
   *
   * --AFTER
   *
   *  */
  ngAfterViewInit(): void {}

  /* *
   *
   * --DESTROY
   *
   *  */
  ngOnDestroy(): void {}

  /* *
   *
   * --CHANGES
   *
   *  */
  ngOnChanges(changes: SimpleChanges): void {}

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
        const locationStatus = this.location_status();
        this.s_location_status.set(locationStatus);

        /** Effect para COORD USER */
        const coord_user = this.coord_user();
        if (this.geolocService.checkCoordinates(coord_user)) {
          this.s_coord_user.set(coord_user);
          this.addMarkerAfterPosition();

        }
      },
      { injector: this.injector }
    );
  }
 

  /* *
   *
   * --inicia el marcador del usuario en el mapa
   *
   *  */
  addMarkerAfterPosition() {
    if (this.geolocService.checkCoordinates(this.s_coord_user())) {
     
        const clientData = {
          id: 'coord_user',
          name: '',
          currentPosition: {
            long: this.s_coord_user()[0],
            lat: this.s_coord_user()[1],
          },
          type: 'user',
        };
        this.client = clientData;

        if (this.initPosition) {
          this.centerMap();
          this.initPosition = false;
        }
        this.initMarker(this.s_coord_user(), this.client);
      
    } else {
      setTimeout(() => {
        this.addMarkerAfterPosition();
      }, 2000); // retrasa la ejecución 1 segundo
    }
  }
  // --------------------------------------------
  // -- Inicializar el mapa
  // --------------------------------------------

  private initMap() {
    // -- configuracion del mapa por defecto
    const mapConfig = this.mapService.getMapConfig('user');

    // -- referencia al elemento html
    let mapEl = this.elementRef.nativeElement.querySelector('#map');

    // --establecer longitud de mapa
    mapEl = this.mapService.setSizeMap(
      { height: mapConfig.height, width: mapConfig.width },
      mapEl
    );

    // -- si hay ubicacion centra el mapa, sino centra en un lugar por defecto
    this.s_coord_user.set(this.coord_user());

    let lon =
      this.s_coord_user()[0] == 0 ? mapConfig.lon : this.s_coord_user()[0];
    let lat =
      this.s_coord_user()[1] == 0 ? mapConfig.lat : this.s_coord_user()[1];
    let zoom =
      this.s_coord_user()[0] == 0 || this.s_coord_user()[1] == 0
        ? mapConfig.zoom
        : 15;

    this.map = this.mapService.getMap(
      'normal',
      {
        mapEl,
        coord_center: [lon, lat],
        zoom: { value: zoom, min: mapConfig.minZoom, max: mapConfig.maxZoom },
      },
      {
        vectorLayer: this.vectorLayer,
        route_origin: undefined,
        route_destination: undefined,
      }
    );

    this.s_map(this.map);
  }

  //  ------------------------------
  // EVENTO CLICK
  //  ------------------------------
  centerTransition: boolean = false;

  initMapEventClick() {
    this.map.on(
      'singleclick',
      (event: { coordinate: Coordinate; pixel: any }) => {
        // console.log(
        //   `Has hecho clic en las coordenadas (${event.coordinate[0]}, ${event.coordinate[1]}).`
        // );

        //  -- establece la coord destino
        this.s_coord_destination.set(
          transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
        );

        const features = this.map.getFeaturesAtPixel(event.pixel);
        // console.log('🚀 ~ initMapEventClick ~ features:', features);

        if (features.length > 0) {
          const feature = features[0];

          // console.log(
          //   "🚀 ~ this.map.on ~ feature.get('client'):",
          //   feature.get('client')
          // );

          const coord = [
            feature.get('client').currentPosition.long,
            feature.get('client').currentPosition.lat,
          ];

          this.s_coord_destination.set(coord);

          // if (feature.get('client').type === 'favorite_places') {
          //   // Método 2: usando .find()
          //   const matchingFavoritePlace = this.favoritePlaces().find(
          //     (place) =>
          //       place.coordinates.longitude === coord[0] &&
          //       place.coordinates.latitude === coord[1]
          //   );

          //   // O si quieres el lugar específico
          //   if (matchingFavoritePlace) {
          //     // console.log('Lugar favorito encontrado:', matchingFavoritePlace);
          //     this.s_matchingFavoritePlace.set(matchingFavoritePlace);

          //     this.getAddress(this.s_coord_destination(), 'favorite');
          //   }
          // }
        } else {
          this.s_matchingFavoritePlace.set({
            id: '',
            address: '',
            name: '',
            coordinates: {},
          });
          this.initMarkerDestination(this.s_coord_destination());

          this.getAddress(this.s_coord_destination());
        }

        if (this.s_location_status()) {
          if (!this.s_footerDisplayed()) {
            this.centerMap(this.s_coord_destination(), true); // centrar el mapa al seleccionar el destino
            this.centerTransition = true;
            // console.log('centerTransition :', this.centerTransition);
          }
         }
      }
    );
  }

  /*
   *
   * -- Rotar el mapa
   *
   * */
  rotateMap(degrees: number) {
    const view = this.map.getView();
    view.setRotation((degrees * Math.PI) / 180);
  }

  centerMap(coord = this.s_coord_user(), touchMap = false) {
    // this.map.getView().setCenter(Proj.fromLonLat([this.lon, this.lat]));
    // Función de callback para centrar el mapa en las coordenadas actuales
    const coordinate: Coordinate = transform(coord, 'EPSG:4326', 'EPSG:3857');

    const zoom = !touchMap ? 15 : this.map.getView().getZoom();

    this.map
      .getView()
      .animate({ center: coordinate, zoom: zoom }, { duration: 1000 });
  }

  private async getAddress(coord: Coordinate, type: string = 'any') {
    let data;
    if (type == 'favorite') {
      data = this.s_matchingFavoritePlace();
      this.s_address.set(data.name);
    } else {
      data = await this.mapService.getAddress(coord);
      this.s_address.set(data.address);
    }
  }

  // --------------------------------------------
  // -- inicializar marcador en el mapa
  // --------------------------------------------
  private initMarker(coord: Coordinate, client: I_Marker, type: string = '') {
    // Buscar el índice del marcador que se va a actualizar
    const indexToUpdate = this.markers.findIndex(
      (marker) => marker.get('client').id === client.id
    );

    // console.log(indexToUpdate, client)

    // -- el marcador NO existe en el array
    if (indexToUpdate === -1) {
      // this.markers = this.mapService.initMarker(this.markers, coord, client);
      this.markers = this.mapService.initMarker(this.markers, coord, client);
    } else {
      this.markers = this.mapService.updateMarkers(this.markers, coord, client);
    }
    this.mapService.setMarkerSignal(this.markers);

    this.updateMarkers();
  }

  // -- Inicializa el marcador destino
  initMarkerDestination(coord: Coordinate) {
    let destination: I_Marker = {
      id: 'destination',
      name: '',
      currentPosition: {
        lat: coord[1],
        long: coord[0],
      },
      type: 'route_touch',
    };

    this.initMarker(coord, destination);
  }

  /* *
   *
   * --Inicia marcador Lugares Favoritos del mapa
   *
   *  */
  initMarkerFavoritePlaces(id: string, coord: Coordinate) {
    const client: I_Marker = {
      id: id,
      name: '',
      currentPosition: {
        lat: coord[1],
        long: coord[0],
      },
      type: 'favorite_places',
    };

    this.initMarker(coord, client);
  }

  updateMarkers() {
    if (!this.vectorSource) {
      this.vectorSource = new VectorSource();
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
      });
      this.map.addLayer(this.vectorLayer);
    }

    // Limpia el vectorSource
    this.vectorSource.clear();

    // Agrega todos los features nuevamente, incluyendo el que ha sido actualizado
    this.vectorSource.addFeatures(this.markers);
    this.vectorSource.addFeature(this.lineRoute);

    this.vectorLayer.setSource(this.vectorSource);
  }

  // --------------------------------------------
  // -- Remover marcador en el mapa
  // --------------------------------------------
  public clearMarker(clientId: string): void {
    this.centerTransition = false;

    // Asegúrate de que el servicio y el mapa estén disponibles
    if (this.mapService && this.map) {
      // Buscar el índice del marcador que se va a actualizar
      const indexToUpdate = this.markers.findIndex(
        (marker) => marker.get('client').id === clientId
      );

      // -- el marcador NO existe en el array
      if (indexToUpdate !== -1) {
        this.markers = this.mapService.removeMarker(this.markers, clientId);

        this.updateMarkers();
      } else {
        // this.clearMarker(clientId);
      }

      this.mapService.setMarkerSignal(this.markers);
    }
  }
 
  printMarkers(favoritePlaces: I_Places[]) {
    let markers;

    if (favoritePlaces.length != 0) {
      markers = this.mapService.printMarkers(favoritePlaces, 'favorite_places');
    }
 
    this.updateMarkers();
  }
 
   

  f_reload_location() {
    this.reload_location.emit();
  }
 

  f_rotate_btn(icon_class: string) {
    const icon = this.elementRef.nativeElement.querySelector('.' + icon_class);
    icon.classList.add('rotate-icon');

    setTimeout(() => {
      icon.classList.remove('rotate-icon');
    }, 1000); // Remover la clase después de un segundo (1000ms)
  }
}
