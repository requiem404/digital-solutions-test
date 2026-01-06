import axios, { AxiosInstance } from 'axios';
import { Item, ApiResponse, GetItemsParams, StateResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getItems(params: GetItemsParams = {}): Promise<ApiResponse<Item>> {
    const response = await this.axiosInstance.get<ApiResponse<Item>>('/items', {
      params,
    });
    return response.data;
  }

  async getSelectedItems(
    params: GetItemsParams = {}
  ): Promise<ApiResponse<Item>> {
    const response = await this.axiosInstance.get<ApiResponse<Item>>(
      '/items/selected',
      { params }
    );
    return response.data;
  }

  async addItem(id: number): Promise<ApiResponse<Item>> {
    const response = await this.axiosInstance.post<ApiResponse<Item>>('/items', {
      id,
    });
    return response.data;
  }

  async updateSelected(selectedIds: number[]): Promise<ApiResponse<void>> {
    const response = await this.axiosInstance.put<ApiResponse<void>>(
      '/items/selected',
      { selectedIds }
    );
    return response.data;
  }

  async getState(): Promise<StateResponse> {
    const response = await this.axiosInstance.get<StateResponse>('/state');
    return response.data;
  }
}

export const apiService = new ApiService();
