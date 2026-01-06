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

export interface AddItemRequest {
  id: number;
}

export interface UpdateSelectedRequest {
  selectedIds: number[];
}

export interface StateResponse {
  selectedIds: number[];
  maxId: number;
}

export interface BatchOperation {
  type: 'get' | 'post' | 'put';
  params?: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  handler?: () => Promise<any>;
}

export interface ClientBatch {
  clientId: string;
  operations: BatchOperation[];
  timer?: NodeJS.Timeout;
}

