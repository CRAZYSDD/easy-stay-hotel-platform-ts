import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Popup } from 'antd-mobile';
import { calcNights } from '../../utils/date';
import styles from './CalendarPicker.module.css';

const buildDays = () =>
  Array.from({ length: 42 }).map((_, index) => {
    const date = dayjs().startOf('month').startOf('week').add(index, 'day');
    return {
      label: date.date(),
      value: date.format('YYYY-MM-DD'),
      month: date.month(),
      date,
    };
  });

export default function CalendarPicker({ value, onChange, visible, onClose }) {
  const [draft, setDraft] = useState(value);
  const days = useMemo(() => buildDays(), []);

  const pickDate = (selected) => {
    if (!draft.checkInDate || (draft.checkInDate && draft.checkOutDate)) {
      setDraft({ checkInDate: selected, checkOutDate: '' });
      return;
    }
    if (dayjs(selected).isBefore(dayjs(draft.checkInDate), 'day')) {
      setDraft({ checkInDate: selected, checkOutDate: '' });
      return;
    }
    const next = { ...draft, checkOutDate: selected };
    setDraft(next);
    onChange(next);
    onClose();
  };

  const inRange = (current) => {
    if (!draft.checkInDate || !draft.checkOutDate) return false;
    return dayjs(current).isAfter(dayjs(draft.checkInDate), 'day') && dayjs(current).isBefore(dayjs(draft.checkOutDate), 'day');
  };

  return (
    <Popup visible={visible} onMaskClick={onClose} bodyStyle={{ borderRadius: '20px 20px 0 0', minHeight: '70vh' }}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h3>选择入住日期</h3>
          <p>{draft.checkInDate && draft.checkOutDate ? `共 ${calcNights(draft.checkInDate, draft.checkOutDate)} 晚` : '请选择入住和离店日期'}</p>
        </div>
        <div className={styles.grid}>
          {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
          {days.map((day) => {
            const isCurrentMonth = day.month === dayjs().month();
            const active = day.value === draft.checkInDate || day.value === draft.checkOutDate;
            return (
              <button
                key={day.value}
                type="button"
                className={classNames(styles.day, {
                  [styles.disabled]: !isCurrentMonth,
                  [styles.active]: active,
                  [styles.inRange]: inRange(day.value),
                })}
                onClick={() => isCurrentMonth && pickDate(day.value)}
              >
                <span>{day.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Popup>
  );
}
