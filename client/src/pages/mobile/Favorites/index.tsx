import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, NavBar, Toast } from 'antd-mobile';
import { HeartFill } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../../../components/mobile/HotelCard';
import EmptyState from '../../../components/common/EmptyState';
import LoadingBlock from '../../../components/common/LoadingBlock';
import { hotelApi } from '../../../api/hotel';
import { toggleFavorite } from '../../../store/slices/uiSlice';
import { useSseRefresh } from '../../../hooks/useSseRefresh';
import styles from './index.module.css';

const sortFavorites = (list) => {
  const available = [];
  const soldOut = [];
  list.forEach((item) => {
    if (item.soldOut) {
      soldOut.push(item);
      return;
    }
    available.push(item);
  });
  return [...available, ...soldOut];
};

export default function FavoritesPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const favorites = useSelector((state: any) => state.ui.favorites);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFavorites = useCallback(async () => {
    const uniqueFavorites = [...new Set(favorites)];

    if (!uniqueFavorites.length) {
      setHotels([]);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await Promise.all(
        uniqueFavorites.map(async (id) => {
          try {
            const res = await hotelApi.getHotelDetail(id);
            const detail = res.data;
            const roomTypes = detail.roomTypes || [];
            const soldOut = roomTypes.length > 0 && roomTypes.every((room) => room.stock <= 0);
            return { ...detail, soldOut };
          } catch (error) {
            return null;
          }
        })
      );

      setHotels(sortFavorites(results.filter(Boolean)));
    } catch (error) {
      setError(error.message || '收藏酒店加载失败');
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useSseRefresh(loadFavorites);

  const totalCount = hotels.length;
  const soldOutCount = useMemo(() => hotels.filter((item) => item.soldOut).length, [hotels]);
  const availableCount = Math.max(totalCount - soldOutCount, 0);

  const handleRemoveFavorite = (hotelId) => {
    dispatch(toggleFavorite(hotelId));
    Toast.show({ content: '已取消收藏' });
  };

  return (
    <div className={styles.page}>
      <NavBar onBack={() => navigate(-1)}>我的收藏</NavBar>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <HeartFill />
          <span>收藏夹</span>
        </div>
        <h1>我的收藏酒店</h1>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <strong>{totalCount}</strong>
            <span>收藏总数</span>
          </div>
          <div className={styles.statCard}>
            <strong>{availableCount}</strong>
            <span>当前可订</span>
          </div>
          <div className={styles.statCard}>
            <strong>{soldOutCount}</strong>
            <span>暂时售罄</span>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        {loading && <LoadingBlock text="正在整理你的收藏酒店..." />}
        {!loading && error && <EmptyState title="加载失败" description={error} />}
        {!loading && !error && hotels.length === 0 && (
          <div className={styles.emptyWrap}>
            <EmptyState title="还没有收藏酒店" description="去列表页或详情页点一下心形按钮，喜欢的酒店就会出现在这里。" />
            <Button color="primary" className={styles.emptyButton} onClick={() => navigate('/hotels')}>
              去逛逛酒店
            </Button>
          </div>
        )}

        {!loading && !error && hotels.length > 0 && (
          <div className={styles.list}>
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                favorite
                onToggleFavorite={handleRemoveFavorite}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
