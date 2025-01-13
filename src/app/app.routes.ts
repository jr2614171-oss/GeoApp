
import { Routes } from '@angular/router';
import { PublicRouteGuardService } from './guard/public-route-guard.service';


export const routes: Routes = [
  {
    path: 'public',
    canActivate: [],
    loadChildren: () =>
      import('./modules/public-module/public.module').then(
        (m) => m.PublicModule
      ),
    title: 'Geo | Public',
  },
  {
    path: '**',
    loadComponent: () =>
      import(
        './modules/public-module/shared/not-found/not-found.component'
      ).then((m) => m.NotFoundComponent),

    title: 'Geo | NotFound',
  }, // Redirige rutas no encontradas al componente de carga

];
