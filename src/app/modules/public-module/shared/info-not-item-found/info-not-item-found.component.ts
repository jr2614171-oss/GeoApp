import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  input,
  PLATFORM_ID,
  Injector
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DataService } from '../../../../services/data/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-info-not-item-found',
  imports: [MatCardModule, MatIcon],
  templateUrl: './info-not-item-found.component.html',
  styleUrl: './info-not-item-found.component.scss',
})
export class InfoNotItemFoundComponent implements OnInit, AfterViewInit, OnDestroy {
  /*
   *
   *  @INJECT
   *
   */
  platform = inject(PLATFORM_ID);
  injector = inject(Injector);
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);


  /*
   *
   *  @INPUT
   *
   */
  readonly currentState = input<'primary' | 'spiner'>('primary');
  readonly text_info = input('No se han encontrado elementos.');

  /*
   *
   *  @SIGNALS
   *
   */
  s_text_info = signal(this.text_info());
  s_currentState = signal(this.currentState());
  

  constructor() {
    
    this.initializeEffects();
  }
  ngOnInit(): void {}
  ngAfterViewInit(): void {
     
  }

  ngOnDestroy(): void {
     
  }

  
  /**
   *
   * --inicia los effect para signals
   *
   *  */
  private initializeEffects(): void {
    this.effectText();
  }   

  /**
   *
   * --EFFECT para TEXT
   *
   *  */
  private effectText(): void {
    // Effect para LOCATION
    effect(
      () => {
        /** Effect para LOCATION_STATUS */
        this.s_text_info.set(this.text_info());
 
      },
      { injector: this.injector }
    );
  }
  
  goToTravelerView() {
    this.dataService.reloadComponent(
      this.router,
      false,
      '/traveler/travel-request'
    );
  }
  goToDriverView() {
    this.dataService.reloadComponent(
      this.router,
      false,
      '/driver/offers-request'
    );
  }
  goToAdminView() {
    this.dataService.reloadComponent(this.router, false, '/admin/home');
  }

  goToDefaultView() {
    this.dataService.reloadComponent(this.router, false, '/public/home');
     
  }

  reloadComponent(self: boolean = true, urlToNavegateTo: string = '/loading') {
    this.dataService.reloadComponent(this.router, self, urlToNavegateTo, {});
  }

  activateUpdate(): void {
    // this.ws.activateUpdate();

    this.dataService.reload();
  }
}
