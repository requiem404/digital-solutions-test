import { Request, Response } from 'express';
import { itemsService } from '../services/itemsService';
import { requestQueue } from '../queue/requestQueue';
import { GetItemsParams, AddItemRequest, UpdateSelectedRequest } from '../types';

export class ItemsController {
  async getItems(req: Request, res: Response): Promise<any> {
    try {
      const params: GetItemsParams = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        searchId: req.query.searchId as string | undefined,
      };

      const result = await requestQueue.getOrCreate(
        req.method,
        req.path,
        params,
        async () => {
          return itemsService.getItems(params);
        }
      );

      return res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Ошибка при получении элементов',
      });
    }
  }

  async getSelectedItems(req: Request, res: Response): Promise<any> {
    try {
      const params: GetItemsParams = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        searchId: req.query.searchId as string | undefined,
      };


      const result = await requestQueue.getOrCreate(
        req.method,
        req.path,
        params,
        async () => {
          return itemsService.getSelectedItems(params);
        }
      );

      return res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Ошибка при получении выбранных элементов',
      });
    }
  }

  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const request: AddItemRequest = req.body;

      if (!request.id || typeof request.id !== 'number') {
        res.status(400).json({
          success: false,
          error: 'ID обязателен и должен быть числом',
        });
        return;
      }


      const result = await itemsService.addItem(request)


      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Ошибка при добавлении элемента',
      });
    }
  }

  async updateSelected(req: Request, res: Response): Promise<void> {
    try {
      const request: UpdateSelectedRequest = req.body;

      if (!Array.isArray(request.selectedIds)) {
        res.status(400).json({
          success: false,
          error: 'selectedIds должен быть массивом',
        });
        return;
      }

      const result = await itemsService.updateSelected(request);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error:
          error.message || 'Ошибка при обновлении выбранных элементов',
      });
    }
  }

  async getState(req: Request, res: Response): Promise<void> {
    try {
      const result = await itemsService.getState();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Ошибка при получении состояния',
      });
    }
  }
}

export const itemsController = new ItemsController();

