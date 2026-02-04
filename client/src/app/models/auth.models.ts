export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'OWNER' | 'STAFF' | 'CUSTOMER';
  }
  
  export interface RegisterResponse {
    message: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    };
  }
  
  export interface VerifyEmailRequest {
    email: string;
    code: string;
  }
  
  export interface GenericResponse {
    message: string;
  }
  
  export interface ResetPasswordRequest {
    email: string;
    code: string;
    password: string;
  }