import { UserService } from './../../shared/user.service';
import { NgForm, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  formModel = {
    UserName: '',
    Password: ''
  }

  constructor(private service: UserService, private router: Router, private toastr: ToastrService) { }

  ngOnInit(): void {
    if(localStorage.getItem('token')!=null)
        this.router.navigate(['/home']);
  }

  onSubmit(form: NgForm) {
    console.log('on submit');
    this.service.login(form.value).subscribe(
      (res:any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('refreshToken', res.refreshToken);
        this.router.navigateByUrl('home');
      },
      err => {
        console.log('some error');
        if(err.status == 400)
          this.toastr.error('Incorrect username or password', 'Authentication failed');
        else 
          console.log(err);
      }
    );
  }

}
