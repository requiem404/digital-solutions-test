import { useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/api';

interface UseSelectedBatchOptions {
  selectedIds: number[];
  onError?: (error: Error) => void;
}

export const useSelectedBatch = ({
  selectedIds,
  onError,
}: UseSelectedBatchOptions) => {
  const pendingIdsRef = useRef<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);

  const sendBatch = useCallback(async () => {
    if (pendingIdsRef.current.length === 0) {
      return;
    }

    const idsToSend = [...pendingIdsRef.current];
    pendingIdsRef.current = [];

    try {
      await apiService.updateSelected(idsToSend);
    } catch (error: any) {
      if (onError) {
        onError(error);
      }
      pendingIdsRef.current = [...idsToSend, ...pendingIdsRef.current];
    }
  }, [onError]);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      pendingIdsRef.current = [...selectedIds];
      return;
    }

    pendingIdsRef.current = [...selectedIds];

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      sendBatch();
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [selectedIds, sendBatch]);

  useEffect(() => {
    return () => {
      if (pendingIdsRef.current.length > 0) {
        sendBatch();
      }
    };
  }, [sendBatch]);
};

