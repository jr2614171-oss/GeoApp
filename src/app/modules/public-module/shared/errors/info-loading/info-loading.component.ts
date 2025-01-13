import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  input,
  PLATFORM_ID
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';


import { I_UserSessionStorage } from '../../../../../interface/user.interface';

@Component({
  selector: 'app-info-loading',
  imports: [MatCardModule],
  templateUrl: './info-loading.component.html',
  styleUrl: './info-loading.component.scss',
})
export class InfoLoadingComponent implements OnInit, AfterViewInit, OnDestroy {
  /*
   *
   *  @INJECT
   *
   */
  platform = inject(PLATFORM_ID);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  /*
   *
   *  @INPUT
   *
   */
  readonly currentState = input<'primary' | 'spiner'>('primary');
  readonly intoComponent = input(false);
  readonly text_info = input('Cargando... espere...');

  /*
   *
   *  @SIGNALS
   *
   */
  s_text_info = signal(this.text_info());
  s_currentState = signal(this.currentState());
  private userData = signal<I_UserSessionStorage>({
    id: '',
    ci: '',
    name: '',
    email: '',
    phone_number: '',
    ci_verified: false,
    user_type: '',
  });

  /*
   *
   *  STORE
   *
   */

  intervalId: any;
  private timeoutLimit: number = 20; // Tiempo límite en milisegundos (por ejemplo, 20 segundos)
  private elapsed: number = 0; // Tiempo transcurrido

  isUsedInRoute: boolean = false;

  constructor() {
    
  }
  ngOnInit(): void {}
  ngAfterViewInit(): void {
    // console.log("🚀 ~ InfoLoadingComponent ~ ngOnInit ~ this.userData:", this.userData)

    // Suscribirse a los cambios en la ruta
    this.route.url.subscribe((urlSegments) => {
      
      // Convertir los segmentos de la URL a una cadena
      const url = urlSegments.map((segment) => segment.path).join('/');
      
      // console.log('🚀 ~ InfoLoadingComponent ~ ngOnInit ~ url:', url);

      // Verificar si la URL contiene 'loading'
      if (url.includes('loading')) {
        // console.log('La URL contiene "loading"');

        this.isUsedInRoute = true; // Si se accede a la URL, se considera que está en una ruta
        this.s_text_info.set('Cargando Datos... espere...');
      } else {
        // console.log('La URL no contiene "loading"');
        this.isUsedInRoute = false;
        this.s_text_info.set('Comprobando estado...');
      }
    });

    setTimeout(() => {
      // Inicia el intervalo si no es desde la ruta de carga
      if (!this.isUsedInRoute) {
        this.startInterval();
      } else {
        this.redirect();
      }
    }, 3);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  redirect(): void {
    switch (this.userData().user_type) {
      case 'traveler':
         
        break;
      case 'driver':
         
        break;
      case 'admin':
         
        break;
      default:
        
        break;
    }
  }
  private startInterval() {
    this.intervalId = setInterval(() => {
      this.elapsed ++; // Aumenta el tiempo transcurrido en 1 segundo

      if (this.elapsed >= this.timeoutLimit / 2) {
        // Si se alcanza el límite de tiempo, recarga la página o emite una señal de no conexión
        this.handleTimeout('half-time');
      }
      if (this.elapsed >= this.timeoutLimit) {
        // Si se alcanza el límite de tiempo, recarga la página o emite una señal de no conexión
        this.handleTimeout('timeout');
      }
    }, 1000); // Ejecuta cada segundo
  }

  private handleTimeout(time: string) {
    // console.log('Tiempo de espera alcanzado. Recargando la página...');
    if (time == 'half-time') {
      this.s_text_info.set(this.text_info() ? this.text_info() : 'Estableciendo conexión');
    } else if (time == 'timeout') {
      this.s_text_info.set('Sin conexión, por favor recargue la página..');
    }
  }
  
}
