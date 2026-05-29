export interface LoginUser {
  id: number;
  username: string;
  nickname: string;
}

export interface LoginResponse {
  token: string;
  user: LoginUser;
}

export interface LoginRequest {
  username: string;
  password: string;
}
