import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = 'https://localhost:44344/api';

  formModel = this.fb.group({
    UserName: ['', Validators.required],
    Email: ['', Validators.email],
    FullName: [''],
    Passwords : this.fb.group({
      Password: ['',  Validators.required],//ovaj validator minl nista ne radi????
      ConfirmPassword: ['',  Validators.required]
    }, {validator: [this.comparePasswords] })
  });

  comparePasswords(fb: FormGroup)  {
    let confirmPswrdCtrl = fb.get('ConfirmPassword');
    //passwordMismatch
    //confirmPswrdCtrl.errors = {passwordMismatch: true}
    if(confirmPswrdCtrl.errors == null || 'passwordMismatch' in confirmPswrdCtrl.errors) {
      if(fb.get('Password').value != confirmPswrdCtrl.value) {
        confirmPswrdCtrl.setErrors({passwordMismatch: true});
      }
      else {
        confirmPswrdCtrl.setErrors(null);
      }
    }
  }


  register() {
    var body = {
      UserName: this.formModel.value.UserName,
      Email: this.formModel.value.Email,
      FullName: this.formModel.value.FullName,
      Password: this.formModel.value.Passwords.Password
    };
    return this.http.post(this.BaseURI+'/ApplicationUser/Register', body);
  }


  login(formData) {
    return this.http.post(this.BaseURI+'/ApplicationUser/Login', formData);
  }

  getUserProfile() {
   // var tokenHeader = new HttpHeaders({'Authorization': 'Bearer ' + localStorage.getItem('token')});
    return this.http.get(this.BaseURI + '/UserProfile');
  }

  roleMatch(allowedRoles): boolean {
    var isMatch = false;
    console.log(allowedRoles + "this");
    var payLoad = JSON.parse(window.atob(localStorage.getItem('token').split('.')[1]));
    var userRole = payLoad.role;
    //if(allowedRoles.array) {
    allowedRoles.forEach(element => {
      console.log("element " + element);
      if(userRole== element) {
        console.log("user role" + element);
        isMatch = true;
        return false;
        }
        return isMatch;
      });
   // }
    return isMatch;
  }

  async tryRefreshingToken(token: string, refreshToken: string): Promise<boolean> {
    var isRefreshSuccess = false;
    const credentials = JSON.stringify({ token: token, refreshToken: refreshToken});
    try {
      const response = await this.http.post(this.BaseURI + "/token/refresh", credentials, {
        headers: new HttpHeaders({
          "Content-Type": "application/json"
        }),
        observe: 'response'
      }).toPromise();

      const newToken = (<any>response).body.token;
      const newRefreshToken = (<any>response).body.refreshToken;
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      isRefreshSuccess = true;
    }
    catch (ex) {
      alert(ex.message);
      isRefreshSuccess = false;
    }
    return isRefreshSuccess;
  }
}
