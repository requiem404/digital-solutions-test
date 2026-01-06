import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useItems } from '../hooks/useItems';
import { useSelectedBatch } from '../hooks/useSelectedBatch';
import { apiService } from '../services/api';
import { Item } from '../types';
import { AddItemForm } from '../components/AddItemForm/AddItemForm';
import { ItemsList } from '../components/ItemsList/ItemsList';
import { SelectedItemsList } from '../components/SelectedItemsList/SelectedItemsList';

import './App.css';

function App() {
  const queryClient = useQueryClient();
  const [leftSearchId, setLeftSearchId] = useState('');
  const [rightSearchId, setRightSearchId] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const {
    items: leftItems,
    loading: leftLoading,
    hasMore: leftHasMore,
    loadMore: leftLoadMore,
    refresh: leftRefresh,
  } = useItems({ searchId: leftSearchId, isSelected: false });

  const {
    items: rightItems,
    loading: rightLoading,
    hasMore: rightHasMore,
    loadMore: rightLoadMore,
    refresh: rightRefresh,
  } = useItems({ searchId: rightSearchId, isSelected: true });

  const { data: stateData } = useQuery({
    queryKey: ['state'],
    queryFn: async () => {
      const state = await apiService.getState();
      if (state.success !== false) {
        return state;
      }
      throw new Error('Failed to load state');
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (stateData?.selectedIds) {
      const ids = stateData.selectedIds || [];
      setSelectedIds(ids);
      localStorage.setItem('selectedIds', JSON.stringify(ids));
    } else {
      // Пытаемся восстановить из localStorage
      const saved = localStorage.getItem('selectedIds');
      if (saved) {
        try {
          const ids = JSON.parse(saved);
          setSelectedIds(ids);
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
    }
  }, [stateData]);

  // Батчинг отправки выбранных элементов каждые 5 секунд
  useSelectedBatch({
    selectedIds,
    onError: (error) => {
      // В случае ошибки можно показать уведомление или обработать иначе
    },
  });

  // Optimistic update при клике на элемент
  const handleItemClick = (item: Item) => {
    if (!selectedIds.includes(item.id)) {
      const newSelectedIds = [...selectedIds, item.id];

      // Optimistic update - обновляем кэш сразу без индикатора загрузки
      queryClient.setQueryData(['items', 'selected', rightSearchId], (old: any) => {
        if (!old) return old;

        const newItem: Item = { id: item.id };
        const firstPage = old.pages[0];
        const updatedFirstPage = {
          ...firstPage,
          items: [newItem, ...firstPage.items],
          total: firstPage.total + 1,
        };

        return {
          ...old,
          pages: [updatedFirstPage, ...old.pages.slice(1)],
        };
      });

      // Обновляем кэш для всех элементов (убираем выбранный из списка)
      queryClient.setQueryData(['items', 'all', leftSearchId], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.filter((i: Item) => i.id !== item.id),
            total: Math.max(0, page.total - 1),
          })),
        };
      });

      // Обновляем состояние
      setSelectedIds(newSelectedIds);
      localStorage.setItem('selectedIds', JSON.stringify(newSelectedIds));

      // Инвалидируем запросы в фоне без показа индикатора загрузки
      queryClient.invalidateQueries({
        queryKey: ['items', 'all'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['items', 'selected'],
        refetchType: 'none',
      });
    }
  };

  // Optimistic update при перетаскивании
  const handleItemsReorder = (newItems: Item[]) => {
    const newSelectedIds = newItems.map((item) => item.id);

    // Optimistic update - обновляем кэш сразу без индикатора загрузки
    queryClient.setQueryData(['items', 'selected', rightSearchId], (old: any) => {
      if (!old) return old;

      // Пересоздаем страницы с новым порядком
      const itemsPerPage = 20;
      const newPages = [];

      for (let i = 0; i < newItems.length; i += itemsPerPage) {
        const pageItems = newItems.slice(i, i + itemsPerPage);
        newPages.push({
          items: pageItems,
          total: newItems.length,
          hasMore: i + itemsPerPage < newItems.length,
          page: Math.floor(i / itemsPerPage) + 1,
        });
      }

      return {
        ...old,
        pages: newPages.length > 0 ? newPages : old.pages,
      };
    });

    // Обновляем состояние
    setSelectedIds(newSelectedIds);
    localStorage.setItem('selectedIds', JSON.stringify(newSelectedIds));

    // Инвалидируем запросы в фоне без показа индикатора загрузки
    queryClient.invalidateQueries({
      queryKey: ['items', 'selected'],
      refetchType: 'none',
    });
  };

  const handleItemAdded = () => {
    queryClient.invalidateQueries({
      queryKey: ['items', 'all'],
      refetchType: 'active',
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Управление списком элементов</h1>
        <AddItemForm onItemAdded={handleItemAdded} />
      </header>
      <div className="app-content">
        <div className="items-panel">
          <ItemsList
            items={leftItems}
            loading={leftLoading}
            hasMore={leftHasMore}
            onLoadMore={leftLoadMore}
            searchId={leftSearchId}
            onSearchChange={setLeftSearchId}
            onItemClick={handleItemClick}
            title="Все элементы"
          />
        </div>
        <div className="items-panel">
          <SelectedItemsList
            items={rightItems}
            loading={rightLoading}
            hasMore={rightHasMore}
            onLoadMore={rightLoadMore}
            searchId={rightSearchId}
            onSearchChange={setRightSearchId}
            onItemsReorder={handleItemsReorder}
            title="Выбранные элементы"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
