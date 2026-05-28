import request from '@/utils/request';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export const login = async (params: LoginRequest) => {
  return (await request.post('/auth/login', params)) as unknown as LoginResponse;
};

export const logout = async () => {
  await request.post('/auth/logout');
};
