import { memo } from 'react';
import classNames from 'classnames';
import { HeartFill, HeartOutline, LocationFill, StarFill } from 'antd-mobile-icons';
import styles from './HotelCard.module.css';

const starLabelMap = {
  5: '奢华型',
  4: '高档型',
  3: '舒适型',
  2: '经济型',
  1: '精选型',
};

function HotelCard({ hotel, favorite, onToggleFavorite, onClick }) {
  const lowStockRoom = hotel.roomTypes?.find((room) => room.stock <= 2 && room.stock > 0);
  const soldOut = hotel.roomTypes?.length > 0 && hotel.roomTypes.every((room) => room.stock <= 0);

  return (
    <div className={classNames(styles.card, { [styles.cardDisabled]: soldOut })}>
      <div className={styles.imageWrap}>
        <img src={hotel.coverImage} alt={hotel.nameZh} loading="lazy" />
        <div className={styles.overlayTop}>
          <span className={styles.badge}>{soldOut ? '已售罄' : '优选酒店'}</span>
          <button
            type="button"
            className={classNames(styles.favorite, { [styles.favoriteActive]: favorite })}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(hotel.id);
            }}
            aria-label={favorite ? '取消收藏' : '收藏酒店'}
          >
            {favorite ? <HeartFill /> : <HeartOutline />}
          </button>
        </div>
        <div className={styles.overlayBottom}>
          <span className={styles.discount}>{hotel.discountInfo}</span>
          <span className={styles.recommend}>{hotel.recommendedReason}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div className={styles.titleBox}>
            <h3>{hotel.nameZh}</h3>
            <p>{hotel.nameEn}</p>
          </div>
          <div className={styles.starBadge}>
            <span className={styles.starScore}>
              <StarFill />
              <strong>{hotel.star}.0</strong>
            </span>
            <span className={styles.starLabel}>{starLabelMap[hotel.star]}</span>
          </div>
        </div>

        <div className={styles.tags}>
          {hotel.tags?.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.address}>
          <LocationFill />
          <span>{hotel.address}</span>
        </div>

        <div className={styles.sellingPoints}>
          {hotel.facilities?.slice(0, 3).map((item) => (
            <em key={item}>{item}</em>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.priceBox}>
            <small>最低价</small>
            <strong>¥{hotel.minPrice}</strong>
            <span>起 / 晚</span>
          </div>
          <div className={styles.actionArea}>
            <div className={classNames(styles.actionTip, { [styles.actionSoldOut]: soldOut })}>
              {soldOut ? '已售罄' : lowStockRoom ? `库存紧张，仅剩 ${lowStockRoom.stock} 间` : '房型充足'}
            </div>
            <button
              type="button"
              className={classNames(styles.bookButton, { [styles.bookButtonDisabled]: soldOut })}
              disabled={soldOut}
              onClick={() => !soldOut && onClick()}
            >
              {soldOut ? '已售罄' : '立即预订'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(HotelCard);
