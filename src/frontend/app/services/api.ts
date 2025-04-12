import axios from "axios";
import { ResourceModel } from "@/app/models/resourceModel";
import { TemplateModel } from "@/app/models/templateModel";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

export default api;

export const resourceApi = {
  getAll: () => api.get<ResourceModel[]>("/resource"), 
  getById: (id: string) => api.get<ResourceModel>(`/resource/${id}`),
  create: (data: ResourceModel) => api.post<ResourceModel>("/resource", data),
  update: (id: string, data: ResourceModel) => api.put<ResourceModel>(`/resource/${id}`, data),
  delete: (id: string) => api.delete<void>(`/resource/${id}`),
};

export const templateApi = {
  getAll: () => api.get<TemplateModel[]>("/template"),
  getById: (id: string) => api.get(`/template/${id}`),
  create: (data: TemplateModel) => api.post("/template", data),
  update: (id: string, data: TemplateModel) => api.put(`/template/${id}`, data),
  delete: (id: string) => api.delete(`/template/${id}`),
};