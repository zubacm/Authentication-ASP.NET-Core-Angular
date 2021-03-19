import { ForbiddenComponent } from './forbidden/forbidden.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AuthGuard } from './auth/auth.guard';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './user/login/login.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { UserComponent } from './user/user.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent  } from "././dashboard/dashboard.component";
const routes: Routes = [
 {path: 'registration', component:RegistrationComponent, pathMatch: 'full'},
 {path: 'user/login', component: LoginComponent},  
  {path: '', redirectTo: 'user/login', pathMatch: 'full'},
  {path: 'user', component:UserComponent, pathMatch: 'full',
    children: [
      {path: 'registration', component: RegistrationComponent}    
    ]
},
{path: 'home', component: HomeComponent, canActivate: [AuthGuard]},  
{path: 'forbidden', component: ForbiddenComponent},  
{path: 'adminpanel', component: AdminPanelComponent, canActivate: [AuthGuard], data: {permittedRoles: ['Customer']}},  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
