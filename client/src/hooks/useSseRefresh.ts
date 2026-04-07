import { useEffect } from 'react';
import { hotelApi } from '../api/hotel';

export const useSseRefresh = (onRefresh) => {
  useEffect(() => {
    const eventSource = hotelApi.subscribeEvents();
    const refresh = () => onRefresh?.();
    eventSource.addEventListener('hotel-updated', refresh);
    eventSource.addEventListener('hotel-status-changed', refresh);
    eventSource.addEventListener('booking-created', refresh);

    return () => {
      eventSource.removeEventListener('hotel-updated', refresh);
      eventSource.removeEventListener('hotel-status-changed', refresh);
      eventSource.removeEventListener('booking-created', refresh);
      eventSource.close();
    };
  }, [onRefresh]);
};
