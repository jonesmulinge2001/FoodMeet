import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RegisterRequest, RegisterResponse, VerifyEmailRequest, GenericResponse, LoginRequest, LoginResponse, ResetPasswordRequest } from '../models/auth.models';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBase}/auth`;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  // ---------------- API calls ----------------
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  verifyEmail(data: VerifyEmailRequest): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.baseUrl}/verify-email`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data);
  }

  requestVerificationCode(email: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      `${this.baseUrl}/request-verification-code`,
      { email }
    );
  }

  forgotPassword(email: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(
      `${this.baseUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(data: ResetPasswordRequest): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.baseUrl}/reset-password`, data);
  }

  resendResetCode(email: string): Observable<GenericResponse> {
    return this.http.post<GenericResponse>(`${this.baseUrl}/resend-reset-code`, {
      email,
    });
  }

  // ---------------- Handler Methods ----------------
  handleRegister(data: RegisterRequest): void {
    this.loadingSubject.next(true);
    this.register(data).subscribe({
      next: () => {
        this.toastr.success('Registration successful');
        localStorage.setItem('verifyEmail', data.email);
        this.router.navigate(['/verify-email']);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.toastr.error('Registration failed');
        this.loadingSubject.next(false);
      },
    });
  }

  handleLogin(data: LoginRequest): void {
    this.loadingSubject.next(true);
    this.login(data).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          this.toastr.error('Invalid credentials');
          this.loadingSubject.next(false);
          return;
        }

        const { token, user } = response.data;

        // Store token & user details
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        localStorage.setItem('userId', user.id);

        this.toastr.success('Login successful', 'Welcome back');

        // role: 'OWNER' | 'STAFF' | 'CUSTOMER';

        // Redirect based on role
        if (user.role === 'OWNER') {
          this.router.navigate(['/admin/dashboard']);
        } else if (user.role === 'STAFF') {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/home']);
        }

        this.loadingSubject.next(false);
      },
      error: () => {
        this.toastr.error('Login failed');
        this.loadingSubject.next(false);
      },
    });
  }

  handleVerifyEmail(data: VerifyEmailRequest): void {
    this.loadingSubject.next(true);
    this.verifyEmail(data).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Email verified');
        this.router.navigate(['/login']);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Email verification failed');
        this.loadingSubject.next(false);
      },
    });
  }

  handleRequestVerificationCode(email: string): void {
    this.loadingSubject.next(true);
    this.requestVerificationCode(email).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Verification code sent');
        this.loadingSubject.next(false);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to send verification code');
        this.loadingSubject.next(false);
      },
    });
  }

  handleForgotPassword(email: string): void {
    this.loadingSubject.next(true);
    this.forgotPassword(email).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Password reset code sent');
        this.loadingSubject.next(false);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to send password reset code');
        this.loadingSubject.next(false);
      },
    });
  }

  handleResetPassword(data: ResetPasswordRequest): void {
    this.loadingSubject.next(true);
    this.resetPassword(data).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Password reset successfully');
        this.router.navigate(['/login']);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to reset password');
        this.loadingSubject.next(false);
      },
    });
  }

  handleResendResetCode(email: string): void {
    this.loadingSubject.next(true);
    this.resendResetCode(email).subscribe({
      next: (response) => {
        this.toastr.success('Verification code resent to your email', 'Success');
        this.loadingSubject.next(false);
      },
      error: () => {
        this.toastr.error('Failed to resend verification code');
        this.loadingSubject.next(false);
      },
    });
  }

  // ---------------- Helpers ----------------
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }
}
