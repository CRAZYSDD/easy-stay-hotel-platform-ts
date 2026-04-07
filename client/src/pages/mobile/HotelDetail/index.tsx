import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, NavBar, Swiper, Toast } from 'antd-mobile';
import { HeartFill, HeartOutline, LocationFill, StarFill } from 'antd-mobile-icons';
import { useNavigate, useParams } from 'react-router-dom';
import CalendarPicker from '../../../components/mobile/CalendarPicker';
import LoadingBlock from '../../../components/common/LoadingBlock';
import { addRecentView, fetchHotelDetail } from '../../../store/slices/hotelSlice';
import { setSearchState, toggleFavorite } from '../../../store/slices/uiSlice';
import { hotelApi } from '../../../api/hotel';
import { calcNights, formatMonthDay } from '../../../utils/date';
import { useSseRefresh } from '../../../hooks/useSseRefresh';
import styles from './index.module.css';

const starLabelMap = {
  5: '奢华型酒店',
  4: '高档型酒店',
  3: '舒适型酒店',
  2: '经济型酒店',
  1: '精选型酒店',
};

export default function HotelDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { detail, rooms, loading } = useSelector((state: any) => state.hotel);
  const { searchState, favorites } = useSelector((state: any) => state.ui);
  const [calendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchHotelDetail(id));
  }, [dispatch, id]);

  useSseRefresh(() => dispatch(fetchHotelDetail(id)));

  useEffect(() => {
    if (detail) {
      const soldOut = (rooms?.length || detail.roomTypes?.length)
        ? (rooms?.length ? rooms : detail.roomTypes).every((room) => room.stock <= 0)
        : false;
      dispatch(
        addRecentView({
          id: detail.id,
          nameZh: detail.nameZh,
          coverImage: detail.coverImage,
          minPrice: detail.minPrice,
          soldOut,
        })
      );
    }
  }, [detail, rooms, dispatch]);

  if (loading || !detail) return <LoadingBlock text="加载酒店详情中..." />;

  const nights = calcNights(searchState.checkInDate, searchState.checkOutDate);
  const isFavorite = favorites.includes(detail.id);
  const allSoldOut = rooms.length > 0 && rooms.every((room) => room.stock <= 0);
  const availableRooms = rooms.filter((room) => room.stock > 0);
  const lowestAvailablePrice = availableRooms.length > 0 ? availableRooms[0].price : detail.minPrice;

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(detail.id));
    Toast.show({ content: isFavorite ? '已取消收藏' : '收藏成功' });
  };

  const bookingRoom = async (room) => {
    try {
      await hotelApi.createBooking({
        hotelId: detail.id,
        roomTypeId: room.id,
        checkInDate: searchState.checkInDate,
        checkOutDate: searchState.checkOutDate,
        nights,
        guestCount: 2,
        totalPrice: room.price * nights,
        contactName: '演示用户',
        contactPhone: '13800000000',
      });
      Toast.show({ content: '预订成功，库存已更新' });
      dispatch(fetchHotelDetail(id));
    } catch (error) {
      Toast.show({ content: error.message });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.heroWrap}>
        <NavBar className={styles.nav} onBack={() => navigate(-1)}>
          酒店详情
        </NavBar>

        <Swiper autoplay loop indicator={(total, current) => <div className={styles.indicator}>{current + 1}/{total}</div>}>
          {[detail.coverImage, ...(detail.galleryImages || [])].map((img) => (
            <Swiper.Item key={img}>
              <div className={styles.banner}>
                <img src={img} alt={detail.nameZh} />
              </div>
            </Swiper.Item>
          ))}
        </Swiper>

        <div className={styles.heroMask}>
          <div className={styles.heroTop}>
            <span className={styles.recommendBadge}>精选推荐</span>
            <button
              type="button"
              className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ''}`}
              onClick={handleToggleFavorite}
            >
              {isFavorite ? <HeartFill /> : <HeartOutline />}
              <span>{isFavorite ? '已收藏' : '收藏'}</span>
            </button>
          </div>
          <div className={styles.heroBottom}>
            <h1>{detail.nameZh}</h1>
            <p>{detail.nameEn}</p>
            <div className={styles.metaRow}>
              <span className={styles.starText}>
                <StarFill /> {detail.star}.0 · {starLabelMap[detail.star]}
              </span>
              <span className={styles.priceHint}>¥{detail.minPrice} 起</span>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.infoCard}>
        <div className={styles.addressRow}>
          <div>
            <strong>酒店地址</strong>
            <p>
              <LocationFill /> {detail.address}
            </p>
          </div>
          <div className={styles.tagBubble}>{detail.city}</div>
        </div>

        <div className={styles.featureTags}>
          {detail.tags.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className={styles.facilityGrid}>
          {detail.facilities.map((item) => (
            <div key={item} className={styles.facilityItem}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <strong>入住安排</strong>
            <span>可切换日期后查看房型价格</span>
          </div>
        </div>
        <div className={styles.dateBox} onClick={() => setCalendarVisible(true)}>
          <div>
            <label>入住</label>
            <strong>{formatMonthDay(searchState.checkInDate)}</strong>
          </div>
          <div className={styles.night}>{nights} 晚</div>
          <div>
            <label>离店</label>
            <strong>{formatMonthDay(searchState.checkOutDate)}</strong>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <strong>酒店亮点</strong>
            <span>更接近真实 C 端详情展示</span>
          </div>
        </div>
        <div className={styles.highlightList}>
          <div className={styles.highlightCard}>
            <h3>推荐理由</h3>
            <p>{detail.description}</p>
          </div>
          <div className={styles.highlightCard}>
            <h3>周边推荐</h3>
            <p>{detail.nearbyInfo.join(' / ')}</p>
          </div>
          <div className={styles.highlightCard}>
            <h3>当前优惠</h3>
            <p>{detail.discountInfo}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <strong>房型价格</strong>
            <span>已按价格从低到高排序</span>
          </div>
        </div>

        <div className={styles.roomList}>
          {rooms.map((room) => (
            <div key={room.id} className={styles.roomCard}>
              <img src={room.roomImage} alt={room.roomName} />
              <div className={styles.roomInfo}>
                <div className={styles.roomTitle}>
                  <h3>{room.roomName}</h3>
                </div>
                <div className={styles.roomStatus}>
                  {room.stock <= 0 ? (
                    <span className={styles.stockSoldOut}>已售罄</span>
                  ) : room.stock <= 2 ? (
                    <span className={styles.stockWarn}>库存紧张</span>
                  ) : (
                    <span className={styles.stockOk}>可订</span>
                  )}
                </div>
                <p>{room.bedType} · {room.roomArea}㎡ · 最多 {room.maxGuests} 人</p>
                <p>{room.breakfastIncluded ? '含早餐' : '不含早餐'} · {room.cancelPolicy}</p>
                <div className={styles.stockText}>剩余库存 {room.stock} 间</div>
              </div>
              <div className={styles.roomAction}>
                <small>{nights} 晚总价参考</small>
                <strong>¥{room.price}</strong>
                <del>¥{room.originalPrice}</del>
                <Button color="primary" size="small" disabled={room.stock <= 0} onClick={() => bookingRoom(room)}>
                  {room.stock <= 0 ? '已售罄' : '立即预订'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.bottomBar}>
        <div className={styles.bottomPrice}>
          <small>{allSoldOut ? '' : '最低价'}</small>
          <strong className={allSoldOut ? styles.bottomPriceSoldOut : ''}>
            {allSoldOut ? '已售罄' : `¥${lowestAvailablePrice}`}
          </strong>
          <span>{allSoldOut ? '当前酒店暂无可订房型' : '起 / 晚'}</span>
        </div>
        <div className={styles.bottomActions}>
          <Button fill="outline" onClick={() => document.querySelector(`.${styles.roomList}`)?.scrollIntoView({ behavior: 'smooth' })}>
            查看房型
          </Button>
          <Button
            color="primary"
            disabled={allSoldOut}
            onClick={() => document.querySelector(`.${styles.roomCard}`)?.scrollIntoView({ behavior: 'smooth' })}
          >
            {allSoldOut ? '已售罄' : '立即预订'}
          </Button>
        </div>
      </div>

      <CalendarPicker
        visible={calendarVisible}
        value={searchState}
        onChange={(value) => dispatch(setSearchState(value))}
        onClose={() => setCalendarVisible(false)}
      />
    </div>
  );
}
