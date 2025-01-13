import {
  Component,
  OnDestroy,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  ChangeDetectorRef,
  effect,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-navbar',
  imports: [
    MatCardModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements AfterViewInit, OnDestroy, OnChanges {
  /*
   *
   * @ INJECT
   *
   */

  private cdr = inject(ChangeDetectorRef);
  private _snackBar = inject(MatSnackBar);

  /*
   *
   * @OUTPUTS
   *
   */

  /*
   *
   * @INPUTS
   *
   */
  

  /*
   *
   * @SIGNALS
   *
   */
  s_isActive = signal(false);
  s_titleApp = signal('GeoApp');

  
  constructor() {

    effect(() => {

      
    });
  }

  async ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}
  ngAfterViewInit() {}
  ngOnDestroy(): void {}
 
}
