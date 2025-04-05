import axios from "axios";
import { ResourceData } from "@/app/types/resourceTypes";
import { TemplateModel } from "@/app/types/templateTypes";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

export default api;

export const resourceApi = {
  getAll: () => api.get<ResourceData[]>("/resource"), 
  getByName: (name: string) => api.get<ResourceData>(`/resource/${name}`),
  create: (data: ResourceData) => api.post<ResourceData>("/resource", data),
  update: (id: string, data: ResourceData) => api.put<ResourceData>(`/resource/${id}`, data),
  delete: (id: string) => api.delete<void>(`/resource/${id}`),
};

export const templateApi = {
  getAll: () => api.get<TemplateModel[]>("/template"),
  getById: (id: string) => api.get(`/template/${id}`),
  create: (data: TemplateModel) => api.post("/template", data),
  update: (id: string, data: TemplateModel) => api.put(`/template/${id}`, data),
  delete: (id: string) => api.delete(`/template/${id}`),
};