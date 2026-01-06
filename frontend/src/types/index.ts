export interface Item {
  id: number;
}

export interface ApiResponse<T> {
  data?: T;
  items?: T[];
  total?: number;
  hasMore?: boolean;
  success?: boolean;
  error?: string;
}

export interface GetItemsParams {
  page?: number;
  limit?: number;
  searchId?: string;
}

export interface StateResponse {
  selectedIds: number[];
  maxId: number;
  success?: boolean;
}

