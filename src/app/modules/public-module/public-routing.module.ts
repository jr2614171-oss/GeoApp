import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    children: [
      {
        path: 'geo',
        loadComponent: () => import('./components/page-geo/page-geo.component').then(m => m.PageGeoComponent),
        title: 'page-geo | GEO LOCATION',
      }, 
      {
        path: '**',
        loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'page-geo | Not Found',
      },
    ]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
