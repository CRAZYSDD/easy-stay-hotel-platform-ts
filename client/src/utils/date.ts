import dayjs from 'dayjs';

export const calcNights = (start, end) => dayjs(end).diff(dayjs(start), 'day');
export const formatMonthDay = (date) => dayjs(date).format('MM月DD日');
