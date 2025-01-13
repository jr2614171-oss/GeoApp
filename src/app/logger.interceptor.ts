import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from './services/storage/storage.service';
import { environment } from '../environments/environment';
 

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {

  const storageService = inject(StorageService);

  const token = storageService.f_getToken() ? storageService.f_getToken() : '';

  // const token: string | null = storageService.f_getToken_cookies('access_token')? storageService.f_getToken_cookies('access_token') : '';
  
  let httpOptions: any;
  // console.log('Interceptor: => ',req.url, req.url.startsWith(environment.socketUrl + '/api/v1/image_gdrive')) 

  if(req.url.startsWith(environment.socketUrl + '/api') && !req.url.startsWith(environment.socketUrl + '/api/v1/auth') && !req.url.startsWith(environment.socketUrl + '/api/v1/image_gdrive')){

    // console.log('Interceptor 1: => ',req.url) 

    httpOptions = {
      headers: new HttpHeaders({
        'Expires': '0',
        'ngsw-bypass': 'false',
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      })
    };
  
    const authReq = req.clone({
      headers: httpOptions.headers
    });
    

    return next(authReq);

  }else if(req.url.startsWith(environment.socketUrl + '/api/v1/image_gdrive')){

    // console.log('Interceptor 2: => ',req.url) 


    httpOptions = {
      headers: new HttpHeaders({
        'Expires': '0',
        'ngsw-bypass': 'false',
        'Authorization': `Bearer ${token}`
      })
    };
  
    const authReq = req.clone({
      headers: httpOptions.headers
    });
    

    return next(authReq);

  }else{

    // console.log('Interceptor ELSE: => ',req.url) 

    httpOptions = {
      headers: new HttpHeaders({
        // 'Content-Type': 'application/json', 
        // 'Authorization': `Bearer ${token}`
      })
    };
  } 

  const authReq = req.clone({
    headers: httpOptions.headers
  });
  

  // const authReq = req.clone({

  //   headers: req.headers.set('Authorization', 'Bearer ' + token),
  // });
  return next(authReq);
};
