import { itemsStorage } from '../storage/itemsStorage';
import {
  Item,
  GetItemsParams,
  AddItemRequest,
  UpdateSelectedRequest,
  ApiResponse,
} from '../types';

class ItemsService {
  async getItems(params: GetItemsParams): Promise<ApiResponse<Item>> {
    try {
      const result = itemsStorage.getItems({
        page: params.page,
        limit: params.limit,
        searchId: params.searchId,
      });

      return {
        items: result.items,
        total: result.total,
        hasMore: result.hasMore,
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ошибка при получении элементов',
      };
    }
  }

  async getSelectedItems(params: GetItemsParams): Promise<ApiResponse<Item>> {
    try {
      const result = itemsStorage.getSelectedItems({
        page: params.page,
        limit: params.limit,
        searchId: params.searchId,
      });

      return {
        items: result.items,
        total: result.total,
        hasMore: result.hasMore,
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ошибка при получении выбранных элементов',
      };
    }
  }

  async addItem(request: AddItemRequest): Promise<ApiResponse<Item>> {
    try {
      const result = itemsStorage.addItem(request.id);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Ошибка при добавлении элемента',
        };
      }

      return {
        data: result.item,
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ошибка при добавлении элемента',
      };
    }
  }

  async updateSelected(
    request: UpdateSelectedRequest
  ): Promise<ApiResponse<void>> {
    try {
      const result = itemsStorage.updateSelected(request.selectedIds);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Ошибка при обновлении выбранных элементов',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.message || 'Ошибка при обновлении выбранных элементов',
      };
    }
  }

  async getState() {
    try {
      const state = itemsStorage.getState();
      return {
        ...state,
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Ошибка при получении состояния',
      };
    }
  }
}

export const itemsService = new ItemsService();

