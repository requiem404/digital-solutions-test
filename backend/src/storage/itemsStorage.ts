import { Item } from '../types';

class ItemsStorage {
  private items: Map<number, Item>;
  private selectedIds: number[];
  private maxId: number;
  private readonly INITIAL_COUNT = 1_000_000;

  constructor() {
    this.items = new Map();
    this.selectedIds = [];
    this.maxId = this.INITIAL_COUNT;
    this.initializeItems();
  }

  private initializeItems(): void {
    for (let i = 1; i <= this.INITIAL_COUNT; i++) {
      this.items.set(i, { id: i });
    }
  }

  getItems(params: { page?: number; limit?: number; searchId?: string }): {
    items: Item[];
    total: number;
    hasMore: boolean;
  } {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const searchId = params.searchId;

    let filteredItems: Item[] = Array.from(this.items.values()).filter(
      (item) => !this.selectedIds.includes(item.id)
    );

    if (searchId) {
      const searchIdNum = parseInt(searchId, 10);
      if (!isNaN(searchIdNum)) {
        filteredItems = filteredItems.filter((item) =>
          item.id.toString().includes(searchId)
        );
      }
    }

    filteredItems.sort((a, b) => a.id - b.id);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredItems.length;

    return {
      items: paginatedItems,
      total: filteredItems.length,
      hasMore,
    };
  }

  getSelectedItems(params: { page?: number; limit?: number; searchId?: string }): {
    items: Item[];
    total: number;
    hasMore: boolean;
  } {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const searchId = params.searchId;

    let selectedItems: Item[] = this.selectedIds
      .map((id) => this.items.get(id))
      .filter((item): item is Item => item !== undefined);

    if (searchId) {
      selectedItems = selectedItems.filter((item) =>
        item.id.toString().includes(searchId)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = selectedItems.slice(startIndex, endIndex);
    const hasMore = endIndex < selectedItems.length;

    return {
      items: paginatedItems,
      total: selectedItems.length,
      hasMore,
    };
  }

  addItem(id: number): { item: Item; success: boolean; error?: string } {
    const startTime = performance.now();
    if (this.items.has(id)) {

      const endTime = performance.now();
      console.log('Time', endTime - startTime);

      return {
        item: { id },
        success: false,
        error: `Элемент с ID ${id} уже существует`,
      };
    }

    if (id <= 0 || !Number.isInteger(id)) {
      return {
        item: { id },
        success: false,
        error: 'ID должен быть положительным целым числом',
      };
    }

    const newItem: Item = { id };
    this.items.set(id, newItem);

    if (id > this.maxId) {
      this.maxId = id;
    }

    const endTime = performance.now();
    console.log('Time', endTime - startTime);

    return {
      item: newItem,
      success: true,
    };
  }

  updateSelected(selectedIds: number[]): { success: boolean; error?: string } {
    for (const id of selectedIds) {
      if (!this.items.has(id)) {
        return {
          success: false,
          error: `Элемент с ID ${id} не существует`,
        };
      }
    }

    const uniqueIds: number[] = [];
    const seen = new Set<number>();
    for (const id of selectedIds) {
      if (!seen.has(id)) {
        seen.add(id);
        uniqueIds.push(id);
      }
    }

    this.selectedIds = uniqueIds;
    return { success: true };
  }

  getState(): { selectedIds: number[]; maxId: number } {
    return {
      selectedIds: [...this.selectedIds],
      maxId: this.maxId,
    };
  }

  hasItem(id: number): boolean {
    return this.items.has(id);
  }

  getItem(id: number): Item | undefined {
    return this.items.get(id);
  }
}

export const itemsStorage = new ItemsStorage();