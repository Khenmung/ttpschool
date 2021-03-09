import { HTTP_INTERCEPTORS, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { TokenStorageService } from '../_services/token-storage.service';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

const TOKEN_HEADER_KEY = 'Authorization';       // for Spring Boot back-end
const CONTENTTYPE = 'Content-Type';
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // export class AuthInterceptor {
  constructor(private token: TokenStorageService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.token.getToken();
    //console.log('token', token != null)
    debugger;
    // if (token != null) {
    //   authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
    // }
    return next.handle(authReq).pipe(
      retry(2),
      catchError((err: HttpErrorResponse) => {
        if ([401, 403].indexOf(err.status) !== -1) {
          // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
          this.token.signOut();
          location.reload(true);
        }

        const error = err.error.message || err.statusText;
        console.log(error);
        return throwError(error);

      })
    );
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];