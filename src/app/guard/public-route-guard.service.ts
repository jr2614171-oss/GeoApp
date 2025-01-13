import {
  ChangeDetectorRef,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PublicRouteGuardService {
  /*
   *
   *  @INJECT
   *
   */
  platform = inject(PLATFORM_ID);

  /*
   *
   *  STORE
   *
   */

    

  constructor(
    private router: Router,
     
  ) // private changeDetectorRef: ChangeDetectorRef,
  {
    effect(() => {
      
    });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Aquí va la lógica de tu guard de ruta

    
    if (isPlatformBrowser(this.platform)) {
      
      
      
       return true;
      // console.log('ESTA EN EL NAVEGADOR')
    }

    return this.router.navigateByUrl('/loading', { replaceUrl: true });
 
  }
 
}
