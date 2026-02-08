import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthGuard } from './auth.guard';
import { ManageusersComponent } from './admin/manageusers/manageusers.component';
import { MenuListComponent } from './admin/menu-items/menu-item-list/menu-item-list.component';
import { OrderComponent } from './components/order/order.component';
import { TableListComponent } from './admin/tables/table-list/table-list.component';
import { StaffDashboardComponent } from './admin/dashboardoverview/dashboardoverview.component';

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
          { path: 'dashboard', component: StaffDashboardComponent},
          { path: 'manage-users', component: ManageusersComponent },
          {path: 'menu-list', component: MenuListComponent},
          {path: 'table-list', component: TableListComponent},
          { path: '', redirectTo: '/restaurants', pathMatch: 'full' },
          { path: '**', redirectTo: '/restaurants' },
        ]
      },

];
