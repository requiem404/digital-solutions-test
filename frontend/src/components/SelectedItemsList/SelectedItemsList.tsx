import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Virtuoso } from 'react-virtuoso';
import { Item } from '../../types';
import { apiService } from '../../services/api';
import './SelectedItemsList.css';

interface SelectedItemsListProps {
  items: Item[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchId?: string;
  onSearchChange: (searchId: string) => void;
  onItemsReorder: (newItems: Item[]) => void;
  title: string;
}

interface SortableItemProps {
  item: Item;
  index: number;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-item"
    >
      <span className="item-id">ID: {item.id}</span>
      <span
        className="drag-handle"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </span>
    </div>
  );
};

export const SelectedItemsList: React.FC<SelectedItemsListProps> = ({
  items,
  loading,
  hasMore,
  onLoadMore,
  searchId = '',
  onSearchChange,
  onItemsReorder,
  title,
}) => {
  const [localSearchId, setLocalSearchId] = useState(searchId);
  const [localItems, setLocalItems] = useState<Item[]>(items);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (items.length !== localItems.length ||
      items.some((item, index) => item.id !== localItems[index]?.id)) {
      setLocalItems(items);
    }
  }, [items]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchId(value);
    onSearchChange(value);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localItems.findIndex((item) => item.id === active.id);
      const newIndex = localItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(localItems, oldIndex, newIndex);
      setLocalItems(newItems);

      const selectedIds = newItems.map((item) => item.id);
      try {
        const response = await apiService.updateSelected(selectedIds);
        if (response.success) {
          onItemsReorder(newItems);
        } else {
          throw new Error(response.error || 'Ошибка при обновлении порядка');
        }
      } catch (error) {
        console.error('Ошибка при обновлении порядка:', error);
        setLocalItems([...localItems]);
      }
    }
  };

  const filteredItems = localSearchId
    ? localItems.filter((item) =>
      item.id.toString().includes(localSearchId)
    )
    : localItems;

  return (
    <div className="selected-items-container">
      <div className="selected-items-header">
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
      <div className="selected-items-content">
        {filteredItems.length === 0 && !loading ? (
          <div className="empty-state">Нет выбранных элементов</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={filteredItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <Virtuoso
                data={filteredItems}
                totalCount={filteredItems.length}
                endReached={hasMore ? onLoadMore : undefined}
                itemContent={(index, item) => (
                  <SortableItem item={item} index={index} />
                )}
                components={{
                  Footer: () =>
                    loading ? (
                      <div className="loading-footer">Загрузка...</div>
                    ) : null,
                }}
                style={{ height: '100%' }}
              />
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

