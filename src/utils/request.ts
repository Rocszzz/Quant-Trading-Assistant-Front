import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';
import { ElMessage } from 'element-plus';

import { useUserStore } from '@/stores/user';

interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
});

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const userStore = useUserStore();

  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`;
  }

  return config;
});

const handleResponse = (response: AxiosResponse<ApiResponse>) => {
  const responseData = response.data;

  if (responseData && typeof responseData.code === 'number' && responseData.code !== 0) {
    ElMessage.warning(responseData.message || '请求处理失败');
    return Promise.reject(responseData);
  }

  return responseData?.data ?? response.data;
};

request.interceptors.response.use(
  handleResponse as unknown as (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
  (error: AxiosError<ApiResponse>) => {
    const message = error.response?.data?.message || error.message || '网络请求异常';
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default request;
