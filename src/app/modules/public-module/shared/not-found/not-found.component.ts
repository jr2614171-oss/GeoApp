import { ApplicationRef, ChangeDetectorRef, Component, effect, inject, Injector, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { I_UserSessionStorage } from '../../../../interface/user.interface';

import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WindowRefService } from '../../../../global_ref_variables/window';

@Component({
    selector: 'app-not-found',
    imports: [MatCardModule],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

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

  constructor() {
    effect(() => {
 
    });
  }

  goBackByUrl() {
    window.history.back();
  }

  /**
   * 
   * @params route: string -> ruta a redirigir
    */
  goToUrl(route: string =  '/loading') {
    this.router.navigateByUrl(route, { replaceUrl: true });
  }
    
}
