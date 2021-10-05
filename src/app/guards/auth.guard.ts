import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedataService } from '../shared/sharedata.service';
import { AuthService } from '../_services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private shareddata:SharedataService,
        private authService:AuthService,
        private router:Router){}
    canActivate(
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot)
        : boolean 
        | UrlTree 
        | Observable<boolean 
        | UrlTree> 
        | Promise<boolean 
        | UrlTree> {
        var userData; 
        this.shareddata.CurrentUserInfo.subscribe(s=>userData =s);
        if(userData && userData.sub){ // sub represents user id value
            if(state.url.indexOf("/login") != -1){
                // loggin user trying to access login page
                this.router.navigate(["/dashboard"]);
                return false;
            }
            else{
                return true;
            }
        }else{
            if(state.url.indexOf("/login") == -1){
                // not logged in users only navigate to login page
                this.router.navigate(["/login"]);
                return false;
            }
            else{
                return true;
            }
        }    
    }

}