import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthGuard } from './auth.guard';
import { DashboardoverviewComponent } from './admin/dashboardoverview/dashboardoverview.component';
import { ManageusersComponent } from './admin/manageusers/manageusers.component';
import { RestaurantListComponent } from './admin/restaurant/restaurant-list/restaurant-list.component';
import { RestaurantFormComponent } from './admin/restaurant/restaurant-form/restaurant-form.component';
import { RestaurantDetailsComponent } from './admin/restaurant/restaurant-details/restaurant-details.component';
import { MenuListComponent } from './admin/menu-items/menu-item-list/menu-item-list.component';
import { OrderComponent } from './components/order/order.component';

export const routes: Routes = [
  {path: '', pathMatch:'full', component: OrderComponent},
  { path: 'order', component: OrderComponent },
      // ==== Public routes (no layout) ====
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
 


    // ==== Admin routes ====
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'dashboard', component: DashboardoverviewComponent},
          { path: 'manage-users', component: ManageusersComponent },
          {path: 'restaurant-list', component: RestaurantListComponent},
          {path: 'restaurants-create', component: RestaurantFormComponent},
          {path: 'menu', component: MenuListComponent},
          { path: 'restaurants/edit/:id', component: RestaurantFormComponent },
          { path: 'restaurants/:id', component: RestaurantDetailsComponent },
          { path: '', redirectTo: '/restaurants', pathMatch: 'full' },
          { path: '**', redirectTo: '/restaurants' },
        ]
      },

];
