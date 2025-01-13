import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  afterNextRender,
  effect,
  inject,
  signal,
} from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatCardModule } from '@angular/material/card';

import {
  Router,
  RouterOutlet,
} from '@angular/router';

import { NavbarComponent } from './modules/public-module/shared/navbar/navbar.component';

import { I_UserSessionStorage } from './interface/user.interface';

import { WindowRefService } from './global_ref_variables/window';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../environments/environment';

import NoSleep from 'nosleep.js';
import { isPlatformBrowser } from '@angular/common';
import { MapCartStore } from './services/map/map.store';

declare global {
  interface Window {}
  // not let or else local to this file
  var gapi: any;
  var google: any;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, MatCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  /*
   *
   * @ INJECT
   *
   */
  private injector = inject(Injector);
  private platform = inject(PLATFORM_ID);
  applicationRef = inject(ApplicationRef);
  private windowRef = inject(WindowRefService);
  private router = inject(Router);
  private ref = inject(ChangeDetectorRef);
  private renderer2 = inject(Renderer2);
  private _snackBar = inject(MatSnackBar);
  private cdkOverlayContainer = inject(OverlayContainer);

  mapCartStore = inject(MapCartStore);

  /*
   *
   * @SIGNALS
   *
   */
  s_session_status = signal(false);
  s_updateAvailable = signal(false);
  s_alertConfigAvailable = signal(false);
  s_showAlertUpdate = signal<'admin' | 'traveler' | 'driver'>('admin');
  s_searchingUpdateAvailable = signal(false);

  s_userData = signal<I_UserSessionStorage>({
    id: '',
    ci: '',
    ci_verified: false,
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone_number: '',
    user_type: '',
  });

  /*
   *
   *  STORE
   *
   */

  /*
   *
   *  DATA
   *
   */
  window: any;
  // Prevenir zoom mientras se permite el scroll
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    // Prevenir zoom
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    // Prevenir zoom con Ctrl + scroll
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }

  @ViewChild(RouterOutlet) outlet!: RouterOutlet;

  title = 'Linki';
  appVersion = environment.appVersion;

  private noSleep: any;
  alert: boolean = false;
  showTips = {
    shareApp: false,
  };

  constructor() {
    this.initializeEffects();

    effect(() => {
      
    });

    afterNextRender({
      write: () => {
        this.window = this.windowRef.nativeWindow;
  
      },
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    

    if (isPlatformBrowser(this.platform)) {
      // // Safe to check `scrollHeight` because this will only run in the browser, not the server.
      this.permissionLockScreen();

      this.initFunctionAfterStable();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platform)) {
      // Desactivar NoSleep al destruir el componente
      this.disablePermissionLockScreen();
    }
  }

  /*
   *
   * -- eventos para la visibilidad en la pantalla
   *
   */
  @HostListener('window:visibilitychange', ['$event']) // O 'window:blur', 'window:focus'
  async onVisibilityChange(event: Event) {
    if (document.visibilityState === 'visible') {
      // console.log('VISIVILITY CHANGE ACTIVE => ', event)

       
    } else if (document.visibilityState === 'hidden') {
    }
  }

  /*
   *
   * -- eventos para la accion Ir Atras
   *
   */
  @HostListener('window:popstate', ['$event'])
  async onPopState(event: Event) {
    if (this.window) {
       
      // Mostrar el mensaje de 'Presione 2 veces para salir'
         
    }
  }

  /**
   *
   * --inicia los effect para signals
   *
   *  */
  private initializeEffects(): void {
    
  }
 

  /*
   *
   * -- funcion para ejecutar despues de q la app es estable
   *
   */
  initFunctionAfterStable() {
     

    this.cdkOverlayContainer
      .getContainerElement()
      .classList.add('high-z-index');
 
  }
 

  // -- para dejar la pantalla encendida
  permissionLockScreen() {
    if ('wakeLock' in navigator) {
      // Tu código para usar la API de Wake Lock
      if (!this.noSleep) this.noSleep = new NoSleep();

      // Activar NoSleep
      this.noSleep.enable();
    }
  }
  disablePermissionLockScreen() {
    if ('wakeLock' in navigator) {
      // Tu código para usar la API de Wake Lock

      if (!this.noSleep) this.noSleep = new NoSleep();

      // Activar NoSleep
      this.noSleep.disable();
    }
  }
  
}
