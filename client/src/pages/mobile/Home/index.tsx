import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, SearchBar, Swiper, Toast } from 'antd-mobile';
import { EnvironmentOutline, HeartOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { hotelApi } from '../../../api/hotel';
import { fetchBanners } from '../../../store/slices/hotelSlice';
import { removeSearchHistory, resetSearchFiltersKeepTrip, saveSearchHistory, setSearchState } from '../../../store/slices/uiSlice';
import CalendarPicker from '../../../components/mobile/CalendarPicker';
import { useSseRefresh } from '../../../hooks/useSseRefresh';
import { HOTEL_CITY_OPTIONS, HOTEL_TAG_OPTIONS } from '../../../constants/hotelOptions';
import { calcNights, formatMonthDay } from '../../../utils/date';
import { getRecentViews, setRecentViews } from '../../../utils/storage';
import styles from './index.module.css';

const quickTags = HOTEL_TAG_OPTIONS;
const recommendPresets = [
  { title: '亲子优选', desc: '带娃更省心', tags: ['亲子', '免费停车'] },
  { title: '商务差旅优选', desc: '通勤更高效', tags: ['商务', '近地铁'] },
  { title: '周末放松', desc: '舒适感拉满', tags: ['温泉', '豪华'] },
];
const cityOptions = HOTEL_CITY_OPTIONS;

export default function HomePage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const banners = useSelector((state: any) => state.hotel.banners);
  const { searchState, favorites, searchHistory: history } = useSelector((state: any) => state.ui);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [locationText, setLocationText] = useState('定位中...');
  const [recent, setRecent] = useState(getRecentViews());
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    dispatch(resetSearchFiltersKeepTrip());
  }, [dispatch]);

  const locateCurrentCity = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationText(`手动城市：${searchState.city}`);
      return;
    }

    setLocationText('定位中...');
    navigator.geolocation.getCurrentPosition(
      () => setLocationText(`当前位置：${searchState.city}`),
      () => setLocationText(`手动城市：${searchState.city}`),
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  }, [searchState.city]);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    locateCurrentCity();
  }, [locateCurrentCity]);

  const syncRecentViews = useCallback(async () => {
    const current = getRecentViews();
    if (!current.length) {
      setRecent([]);
      return;
    }

    const synced = await Promise.all(
      current.map(async (item) => {
        try {
          const detailRes = await hotelApi.getHotelDetail(item.id);
          const detail = detailRes.data;
          const soldOut = detail.roomTypes?.length > 0 && detail.roomTypes.every((room) => room.stock <= 0);
          return {
            ...item,
            id: detail.id,
            nameZh: detail.nameZh,
            coverImage: detail.coverImage,
            minPrice: detail.minPrice,
            soldOut,
          };
        } catch (error) {
          return item;
        }
      })
    );

    setRecentViews(synced);
    setRecent(getRecentViews());
  }, []);

  const syncFavoriteCount = useCallback(async () => {
    const uniqueFavorites = [...new Set(favorites)];
    if (!uniqueFavorites.length) {
      setFavoriteCount(0);
      return;
    }

    const results = await Promise.all(
      uniqueFavorites.map(async (hotelId) => {
        try {
          await hotelApi.getHotelDetail(hotelId);
          return hotelId;
        } catch (error) {
          return null;
        }
      })
    );

    setFavoriteCount(results.filter(Boolean).length);
  }, [favorites]);

  useEffect(() => {
    syncRecentViews();
    syncFavoriteCount();
  }, [syncRecentViews, syncFavoriteCount]);

  useSseRefresh(() => {
    syncRecentViews();
    syncFavoriteCount();
  });

  const handleSearch = () => {
    dispatch(saveSearchHistory(searchState.city));
    navigate(`/hotels?city=${searchState.city}`);
  };

  const handleHistorySearch = (city) => {
    dispatch(
      setSearchState({
        city,
        keyword: '',
        tags: [],
      })
    );
    dispatch(saveSearchHistory(city));
    navigate(`/hotels?city=${city}`);
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />

        <div className={styles.heroBar}>
          <button type="button" className={styles.locationRow} onClick={locateCurrentCity}>
            <EnvironmentOutline />
            <span>{locationText}</span>
          </button>

          <div className={styles.cityBox}>
            <span>切换城市</span>
            <select
              className={styles.citySelect}
              value={searchState.city}
              onChange={(event) => dispatch(setSearchState({ city: event.target.value }))}
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.heroTop}>
          <h1>易宿酒店预订平台</h1>
          <p className={styles.heroDesc}>从周末小住到商务差旅，帮你更快找到合适酒店。</p>
        </div>

        <div className={styles.bannerWrap}>
          <Swiper autoplay loop indicator={(total, current) => <div className={styles.indicator}>{current + 1}/{total}</div>}>
            {banners.map((banner) => (
              <Swiper.Item key={banner.id}>
                <div className={styles.bannerCard} onClick={() => navigate(`/hotels/${banner.targetHotelId}`)}>
                  <img src={banner.image} alt={banner.title} />
                  <div className={styles.bannerMask}>
                    <span className={styles.bannerBadge}>精选推荐</span>
                    <h3>{banner.title}</h3>
                    <p>点击进入酒店详情，查看房型和优惠</p>
                  </div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
        </div>
      </section>

      <section className={styles.searchPanel}>
        <div className={styles.panelHeader}>
          <div>
            <strong>开始查找酒店</strong>
            <span>支持城市、关键字、标签联合筛选</span>
          </div>
          <div className={styles.cityChip}>{searchState.city}</div>
        </div>

        <SearchBar
          placeholder="搜索酒店名、商圈、地址"
          value={searchState.keyword}
          onChange={(value) => dispatch(setSearchState({ keyword: value }))}
          onSearch={handleSearch}
          showCancelButton={false}
        />

        <div className={styles.dateCard} onClick={() => setCalendarVisible(true)}>
          <div>
            <label>入住</label>
            <strong>{formatMonthDay(searchState.checkInDate)}</strong>
          </div>
          <div className={styles.nights}>{calcNights(searchState.checkInDate, searchState.checkOutDate)} 晚</div>
          <div>
            <label>离店</label>
            <strong>{formatMonthDay(searchState.checkOutDate)}</strong>
          </div>
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterBox}>
            <label>星级</label>
            <select value={searchState.star} onChange={(event) => dispatch(setSearchState({ star: event.target.value }))}>
              <option value="">不限</option>
              {[5, 4, 3, 2, 1].map((star) => (
                <option key={star} value={star}>
                  {star} 星
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterBox}>
            <label>价格区间</label>
            <select
              value={searchState.priceRange.join('-')}
              onChange={(event) => {
                const [min, max] = event.target.value.split('-').map(Number);
                dispatch(setSearchState({ priceRange: [min, max] }));
              }}
            >
              <option value="0-1200">不限</option>
              <option value="0-400">400 以下</option>
              <option value="400-700">400 - 700</option>
              <option value="700-1200">700 - 1200</option>
            </select>
          </div>
        </div>

        <div className={styles.tagTitle}>热门偏好</div>
        <div className={styles.tagGroup}>
          {quickTags.map((tag) => {
            const active = searchState.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={active ? styles.tagActive : styles.tag}
                onClick={() => {
                  const next = active ? searchState.tags.filter((item) => item !== tag) : [...searchState.tags, tag];
                  dispatch(setSearchState({ tags: next }));
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>

        <Button color="primary" block size="large" className={styles.searchButton} onClick={handleSearch}>
          查询酒店
        </Button>
      </section>

      <section className={styles.section}>
        <div className={styles.favoriteEntry} onClick={() => navigate('/favorites')}>
          <div className={styles.favoriteEntryIcon}>
            <HeartOutline />
          </div>
          <div className={styles.favoriteEntryInfo}>
            <strong>我的收藏</strong>
            <span>已收藏 {favoriteCount} 家酒店</span>
          </div>
          <em>去看看</em>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>智能推荐组合</div>
          <span>快速套用筛选条件</span>
        </div>
        <div className={styles.presetList}>
          {recommendPresets.map((item) => (
            <div
              key={item.title}
              className={styles.preset}
              onClick={() => {
                dispatch(setSearchState({ tags: item.tags }));
                Toast.show({ content: `已应用 ${item.title}` });
              }}
            >
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              <div className={styles.presetTags}>{item.tags.join(' · ')}</div>
            </div>
          ))}
        </div>
      </section>

      {history.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>搜索历史</div>
            <span>点击快速回填</span>
          </div>
          <div className={styles.chips}>
            {history.map((item) => (
              <div key={item} className={styles.historyChip}>
                <button type="button" className={styles.historyChipText} onClick={() => handleHistorySearch(item)}>
                  {item}
                </button>
                <button
                  type="button"
                  className={styles.historyChipRemove}
                  aria-label={`删除${item}搜索历史`}
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(removeSearchHistory(item));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>最近浏览</div>
            <span>继续查看刚刚感兴趣的酒店</span>
          </div>
          <div className={styles.recentList}>
            {recent.map((item) => (
              <div
                key={item.id}
                className={`${styles.recentCard} ${item.soldOut ? styles.recentCardDisabled : ''}`}
                onClick={() => !item.soldOut && navigate(`/hotels/${item.id}`)}
              >
                <img
                  src={item.coverImage}
                  alt={item.nameZh}
                  onError={(event) => {
                    event.currentTarget.src = 'https://picsum.photos/seed/recent-fallback/92/72';
                  }}
                />
                <div className={styles.recentInfo}>
                  <strong>{item.nameZh}</strong>
                  <span>推荐价 ¥{item.minPrice} 起</span>
                </div>
                <em>{item.soldOut ? '已售罄' : '去看看'}</em>
              </div>
            ))}
          </div>
        </section>
      )}

      <CalendarPicker
        visible={calendarVisible}
        value={searchState}
        onChange={(value) => dispatch(setSearchState(value))}
        onClose={() => setCalendarVisible(false)}
      />
    </div>
  );
}
