import axios from 'axios';
import { ResourceModel } from '@/app/models/resourceModel';
import { TemplateModel } from '@/app/models/templateModel';
import { PageModel } from '@/app/models/pageModel';
import { UserModel } from '@/app/models/userModel';
import { localIp } from '@/helpModule/localIp';


const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export default api;

export const resourceApi = {
  getAll: () => api.get<ResourceModel[]>('/resource'),
  getById: (id: string) => api.get<ResourceModel>(`/resource/${id}`),
  create: (data: ResourceModel) => api.post<ResourceModel>('/resource', data),
  update: (id: string, data: ResourceModel) =>
    api.put<ResourceModel>(`/resource/${id}`, data),
  delete: (id: string) => api.delete<void>(`/resource/${id}`),
};

export const templateApi = {
  getAll: () => api.get<TemplateModel[]>('/template'),
  getById: (id: string) => api.get(`/template/${id}`),
  create: (data: TemplateModel) => api.post('/template', data),
  update: (id: string, data: TemplateModel) => api.put(`/template/${id}`, data),
  delete: (id: string) => api.delete(`/template/${id}`),
};

export const pageApi = {
  getAll: () => api.get<PageModel[]>('/page'),
  getById: (id: string) => api.get(`/page/${id}`),
  create: (data: PageModel) => api.post('/page', data),
  update: (id: string, data: PageModel) => api.put(`/page/${id}`, data),
  delete: (id: string) => api.delete(`/page/${id}`),
};

export const userApi = {
  getAll: () => api.get<UserModel[]>('/user'),
  getById: (id: string) => api.get<UserModel>(`/user/${id}`),
  create: (data: { email: string; password: string }) =>
    api.post('/auth/register', data),
  update: (id: string, data: Partial<UserModel>) =>
    api.put<UserModel>(`/user/${id}`, data),
  delete: (id: string) => api.delete(`/user/${id}`),
  login: (data: { email: string; password: string; role: string }) =>
    api.post<{ access_token: string; user: UserModel }>('/auth/login', data),
  google: () => `http://${localIp}:3001/auth/google`,
  telegram: (data: any) => api.get('/auth/telegram', data),
};
