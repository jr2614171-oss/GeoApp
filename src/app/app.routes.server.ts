import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
   
  
  /* FALLBACK */
  {
    path: '**',
    renderMode: RenderMode.Prerender // Esta ruta captura cualquier ruta no definida
  }
];