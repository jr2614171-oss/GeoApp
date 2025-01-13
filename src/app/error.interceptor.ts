
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';



export const errorInterceptor: HttpInterceptorFn = (req, next) => {

   


  return next(req).pipe(catchError((error) => {

    if ([401, 403].includes(error.status)) {
      console.error('Unauthorized request');

       

    } else if ([404].includes(error.status)) {

      console.error('Not found request');

    }
     
    console.error(error.message);

    return throwError(() => error);
  }));
};
