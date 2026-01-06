import { useInfiniteQuery } from '@tanstack/react-query';
import { Item, ApiResponse } from '../types';
import { apiService } from '../services/api';

interface UseItemsOptions {
  searchId?: string;
  isSelected?: boolean;
}

export const useItems = ({ searchId, isSelected = false }: UseItemsOptions = {}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ['items', isSelected ? 'selected' : 'all', searchId],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        limit: 20,
        searchId,
      };

      const response: ApiResponse<Item> = isSelected
        ? await apiService.getSelectedItems(params)
        : await apiService.getItems(params);

      if (response.success === false) {
        throw new Error(response.error || 'Ошибка загрузки элементов');
      }

      return {
        items: response.items || [],
        total: response.total || 0,
        hasMore: response.hasMore || false,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const items = data?.pages.flatMap((page) => page.items) || [];
  const total = data?.pages[0]?.total || 0;
  const loading = isFetching && !isFetchingNextPage && items.length === 0 && !data;

  return {
    items,
    loading,
    hasMore: hasNextPage || false,
    total,
    error: error ? (error as Error).message : null,
    loadMore: fetchNextPage,
    refresh: refetch,
  };
};
