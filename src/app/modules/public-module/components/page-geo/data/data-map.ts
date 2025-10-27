import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';

// export const DEFAULT_HEIGHT = 'auto';
// export const DEFAULT_WIDTH = '500px';

// export const DEFAULT_ZOOM = 10;
// export const DEFAULT_SOCKET_STATUS = false;
// export const DEFAULT_LOCATION_STATUS = false;

// export const DEFAULT_LAT = 23.0415;
// export const DEFAULT_LON = -81.5775;

// -- MARKERS

export const DEFAULT_OPTIONS_MAP = {
  width: 'auto',
  height: '500px',
  lon: -81.5775,
  lat: 23.0415,
  zoom: 10,
  minZoom: 6,
  maxZoom: 19,
};
export const DEFAULT_ICON = 'assets/img/dot.svg';
export const DOT_1_SHADOW = 'assets/img/markers/dot_1_shadow.svg';
export const DOT_SHADOW = 'assets/img/markers/dot_shadow.svg';
export const DOT_DRIVER_CAR = 'assets/img/markers/dot_car.svg';
export const DOT_DRIVER_MOTO = 'assets/img/markers/dot_moto.svg';
export const MAPDOT_ICON = 'assets/img/map_dot.svg';
export const STAR_ICON = 'assets/img/markers/dot_star.svg';
export const DOLLAR_ICON = 'assets/img/markers/dot_dollars.svg';
export const TRAVELER_REQUEST = 'assets/img/markers/dot_travelers.svg';

export const DEFAULT_ANCHOR = [0.5, 1];
export const MARKER_COLOR: { [key: string]: string } = {
  success: 'green',
  primary: 'blue',
  warning: '#ffc107',
  brown: '#763',
  danger: 'red',
  info: 'cornflowerblue',
  dark: '#201e1e',
  dark_transparent: '#23272b69',
  transparent: 'transparent',
  // 'success': [53, 140, 0, 1],
  // 'primary': [10, 27, 300, 1],
  // 'warning': [245, 172, 8],
  // 'danger': [255, 0, 0, 1],
  // 'info': [127, 255, 127, 0.5],
  // 'transparent': [255, 255, 255, 0],
};
// -- MARKERS

// Crea un SVG para el gradiente
const svgGradient = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">

      <stop offset="100%" style="stop-color:'rgba(0, 0, 0, 0.3)'; stop-opacity:0.2" />
      <stop offset="100%" style="stop-color:'rgba(255, 255, 255, 0.0)'; stop-opacity:0.2" />
    </linearGradient>

    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
      <feOffset dx="2" dy="2" result="offsetBlur" />
      <feMerge>
        <feMergeNode in="offsetBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

  </defs>
  <circle cx="15" cy="15" r="10" fill="url(#grad1)" />
</svg>
`;
// Convertir el SVG a una URL de datos
const svgData = 'data:image/svg+xml;base64,' + btoa(svgGradient);

/*
 *
 * -- ESTILO PARA LAS RUTAS POR TIPO
 */
export const ROUTE_STYLE: { [key: string]: Style } = {
  default: new Style({
    stroke: new Stroke({
      color: MARKER_COLOR['dark'],
      width: 5,
      lineDash: [10, 3],
      lineDashOffset: 0,
    }),
  }),
  border: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.1)',
      width: 10,
    }),
  }),
};

/*
 *
 * -- ESTILO PARA LOS MARCADORES POR TIPO
 */
export const MARKER_STYLE: { [key: string]: Style } = {
  default: new Style({
    image: new Icon({
      src: DOT_SHADOW,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.25,
    }),
  }),
  shadow: new Style({
    image: new Circle({
      radius: 11, // Radio para la sombra
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.1)',
        width: 10,
      }),
    }),
  }),
  user: new Style({
    image: new Icon({
      src: DOT_SHADOW,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.3,
      anchor: [0.5, 0.4],
    }),
  }),
  driver_car: new Style({
      image: new Icon({
        src: DOT_DRIVER_CAR,
        color: MARKER_COLOR['transparent'],
        crossOrigin: 'anonymous',
        size: [35, 35],
        scale: 1.3,
        anchor: [0.5, 0.4],
      }),
    }),

  favorite_places: new Style({
    image: new Icon({
      src: STAR_ICON,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.4,
      anchor: [0.5, 0.4],
    }),
  }),
  offer_sent: new Style({

    image: new Icon({
      src: DOLLAR_ICON,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.4,
      anchor: [0.5, 0.4],
    }),
  }),
  travel_origin: new Style({

    image: new Icon({
      src: TRAVELER_REQUEST,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.4,
      anchor: [0.5, 0.4],
    }),
  }),
  travel_destination: new Style({

    image: new Icon({
      src: DOT_1_SHADOW,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.4,
      anchor: [0.5, 0.4],
    }),
  }),
  route_touch: new Style({
    image: new Icon({
      src: MAPDOT_ICON,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.5,
      anchor: [0.5, 0.4],
    }),
  }),
  route_origin: new Style({
    image: new Icon({
      src: DOT_SHADOW,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.3,
      anchor: [0.5, 0.4],
    }),
  }),
  route_destination: new Style({
    image: new Icon({
      src: DOT_1_SHADOW,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.3,
      anchor: [0.5, 0.4],
    }),
  }),
  custom_pin: new Style({
    image: new Icon({
      src: STAR_ICON,
      color: MARKER_COLOR['transparent'],
      crossOrigin: 'anonymous',
      size: [30, 30],
      scale: 1.4,
      anchor: [0.5, 0.4],
    }),
  }),
  // Agrega más estilos para otros tipos de marcadores...
};

interface MapConfig {
  width: string;
  height: string;
  lon: number;
  lat: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  // ...
}

/*
 *
 * -- CONFIGURACION PARA EL MAPA POR TIPO
 */
export const MAP_OPTIONS: { [key: string]: MapConfig } = {
  default: {
    width: '100%',
    height: '100%',
    lon: DEFAULT_OPTIONS_MAP.lon,
    lat: DEFAULT_OPTIONS_MAP.lat,
    zoom: 10,
    minZoom: DEFAULT_OPTIONS_MAP.minZoom,
    maxZoom: DEFAULT_OPTIONS_MAP.maxZoom,
    // Add more options as needed
  },
  user: {
    width: '100%',
    height: '93vh',
    lon: DEFAULT_OPTIONS_MAP.lon,
    lat: DEFAULT_OPTIONS_MAP.lat,
    zoom: 10,
    minZoom: DEFAULT_OPTIONS_MAP.minZoom,
    maxZoom: DEFAULT_OPTIONS_MAP.maxZoom,
    // Add more options as needed
  },
  travel_view: {
    width: '100%',
    height: '30vh',
    lon: DEFAULT_OPTIONS_MAP.lon,
    lat: DEFAULT_OPTIONS_MAP.lat,
    zoom: 10,
    minZoom: DEFAULT_OPTIONS_MAP.minZoom,
    maxZoom: DEFAULT_OPTIONS_MAP.maxZoom,
    // Add more options as needed
  },
  traveler_form: {
    width: '100%',
    height: '65vh',
    lon: DEFAULT_OPTIONS_MAP.lon,
    lat: DEFAULT_OPTIONS_MAP.lat,
    zoom: 10,
    minZoom: DEFAULT_OPTIONS_MAP.minZoom,
    maxZoom: DEFAULT_OPTIONS_MAP.maxZoom,
    // Add more options as needed
  },
  traveler_pending: {
    width: '100%',
    height: '65vh',
    lon: DEFAULT_OPTIONS_MAP.lon,
    lat: DEFAULT_OPTIONS_MAP.lat,
    zoom: 10,
    minZoom: DEFAULT_OPTIONS_MAP.minZoom,
    maxZoom: DEFAULT_OPTIONS_MAP.maxZoom,
    // Add more options as needed
  },
};
