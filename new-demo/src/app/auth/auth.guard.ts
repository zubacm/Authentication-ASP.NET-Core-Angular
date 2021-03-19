import { UserService } from './../shared/user.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  /**
   *
   */
  constructor(private router: Router, private service: UserService) {  
  }
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      var token = localStorage.getItem('token');
      if(token!=null) {
        if(this.tokenExpired(token))
        {
          const isRefreshSuccess = await this.tryRefreshingTokens(token);//http zahtijev
          if(!isRefreshSuccess)
          {
            this.router.navigate(['/user/login']);
            return false;
          }
        }
        let roles = next.data['permittedRoles'] as Array<string>;
        if(roles) {        
            if(this.service.roleMatch(roles)) 
              return true;
            else {
              this.router.navigate(['/forbidden']);
              return false;
            }
        }
        return true;
      }
      else {
        this.router.navigate(['/user/login']);   
        return false;
      }    
  }
  
  private async tryRefreshingTokens(token: string): Promise<boolean> {
    const refreshToken: string = localStorage.getItem("refreshToken");
    if(!token || !refreshToken) {
      return false;
    }
    var isRefreshSuccess = this.service.tryRefreshingToken(token, refreshToken);
     return isRefreshSuccess;
  }

  private tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

}
