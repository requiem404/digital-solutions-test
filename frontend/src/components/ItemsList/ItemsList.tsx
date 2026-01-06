import React, { useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Item } from '../../types';
import './ItemsList.css';

interface ItemsListProps {
  items: Item[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchId?: string;
  onSearchChange: (searchId: string) => void;
  onItemClick?: (item: Item) => void;
  title: string;
  renderItem?: (item: Item, index: number) => React.ReactNode;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  loading,
  hasMore,
  onLoadMore,
  searchId = '',
  onSearchChange,
  onItemClick,
  title,
  renderItem,
}) => {
  const [localSearchId, setLocalSearchId] = useState(searchId);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchId(value);
    onSearchChange(value);
  };

  const defaultRenderItem = (item: Item, index: number) => (
    <div
      key={item.id}
      className="item-row"
      onClick={() => onItemClick?.(item)}
      style={{ cursor: onItemClick ? 'pointer' : 'default' }}
    >
      <span className="item-id">ID: {item.id}</span>
    </div>
  );

  return (
    <div className="items-list-container">
      <div className="items-list-header">
        <h2>{title}</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Поиск по ID..."
            value={localSearchId}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>
      <div className="items-list-content">
        {items.length === 0 && !loading ? (
          <div className="empty-state">Нет элементов</div>
        ) : (
          <Virtuoso
            data={items}
            totalCount={items.length}
            endReached={hasMore ? onLoadMore : undefined}
            itemContent={(index, item) =>
              renderItem ? renderItem(item, index) : defaultRenderItem(item, index)
            }
            components={{
              Footer: () =>
                loading ? (
                  <div className="loading-footer">Загрузка...</div>
                ) : null,
            }}
            style={{ height: '100%' }}
          />
        )}
      </div>
    </div>
  );
};

