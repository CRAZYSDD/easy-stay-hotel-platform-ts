import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavBar, SearchBar, Toast } from 'antd-mobile';
import { FilterOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../../../components/mobile/HotelCard';
import EmptyState from '../../../components/common/EmptyState';
import LoadingBlock from '../../../components/common/LoadingBlock';
import { HOTEL_TAG_OPTIONS } from '../../../constants/hotelOptions';
import { fetchHotels } from '../../../store/slices/hotelSlice';
import { setSearchState, toggleFavorite } from '../../../store/slices/uiSlice';
import { calcNights, formatMonthDay } from '../../../utils/date';
import { useSseRefresh } from '../../../hooks/useSseRefresh';
import styles from './index.module.css';

const tagOptions = HOTEL_TAG_OPTIONS;

export default function HotelListPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const loaderRef = useRef(null);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const { list, hasMore, loading, error, total } = useSelector((state: any) => state.hotel);
  const { searchState, favorites } = useSelector((state: any) => state.ui);

  const loadHotels = useCallback(
    (page = 1) => {
      dispatch(
        fetchHotels({
          page,
          pageSize: 6,
          city: searchState.city,
          keyword: searchState.keyword,
          star: searchState.star,
          minPrice: searchState.priceRange[0],
          maxPrice: searchState.priceRange[1],
          tags: searchState.tags.join(','),
          sort: searchState.sort,
        })
      );
    },
    [dispatch, searchState]
  );

  useEffect(() => {
    loadHotels(1);
  }, [loadHotels]);

  useSseRefresh(() => loadHotels(1));

  useEffect(() => {
    const target = loaderRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading && list.length > 0) {
        loadHotels(Math.floor(list.length / 6) + 1);
      }
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, list.length, loading, loadHotels]);

  const handleToggleFavorite = (hotelId) => {
    const isFavorite = favorites.includes(hotelId);
    dispatch(toggleFavorite(hotelId));
    Toast.show({ content: isFavorite ? '已取消收藏' : '收藏成功' });
  };

  const handleToggleFilters = () => {
    const nextExpanded = !filterExpanded;
    setFilterExpanded(nextExpanded);
    if (nextExpanded) {
      loadHotels(1);
    }
  };

  return (
    <div className={styles.page}>
      <NavBar onBack={() => navigate(-1)}>酒店列表</NavBar>

      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <h1>{searchState.city}酒店精选</h1>
            <p>
              {formatMonthDay(searchState.checkInDate)} 入住 · {formatMonthDay(searchState.checkOutDate)} 离店 ·{' '}
              {calcNights(searchState.checkInDate, searchState.checkOutDate)} 晚
            </p>
          </div>
          <div className={styles.resultBadge}>
            <strong>{total}</strong>
            <span>家可订</span>
          </div>
        </div>

        <div className={styles.searchWrap}>
          <SearchBar
            value={searchState.keyword}
            placeholder="搜索酒店名、商圈、地址"
            onChange={(value) => dispatch(setSearchState({ keyword: value }))}
            onSearch={() => loadHotels(1)}
            showCancelButton={false}
          />
        </div>
      </section>

      <section className={styles.filterPanel}>
        <div className={styles.panelTitle}>
          <button type="button" className={styles.panelLabelButton} onClick={handleToggleFilters}>
            <div className={styles.panelLabel}>
              <FilterOutline />
              <span>筛选与排序</span>
            </div>
            <span className={`${styles.expandIcon} ${filterExpanded ? styles.expandIconOpen : ''}`}>
              <span className={styles.expandChevron} />
            </span>
          </button>
        </div>

        <div className={`${styles.filterDrawer} ${filterExpanded ? styles.filterDrawerOpen : ''}`}>
          <div className={styles.filterDrawerInner}>
            <div className={styles.summaryRow}>
              <span>{searchState.city}</span>
              {searchState.keyword ? <span>关键词：{searchState.keyword}</span> : <span>关键词不限</span>}
            </div>

            <div className={styles.filters}>
              <div className={styles.selectBox}>
                <label>星级</label>
                <select value={searchState.star} onChange={(event) => dispatch(setSearchState({ star: event.target.value }))}>
                  <option value="">全部星级</option>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <option key={star} value={star}>
                      {star} 星
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.selectBox}>
                <label>排序</label>
                <select value={searchState.sort} onChange={(event) => dispatch(setSearchState({ sort: event.target.value }))}>
                  <option value="">默认排序</option>
                  <option value="priceAsc">价格升序</option>
                  <option value="priceDesc">价格降序</option>
                </select>
              </div>

              <div className={styles.selectBox}>
                <label>价格</label>
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

            <div className={styles.tags}>
              {tagOptions.map((tag) => {
                const active = searchState.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={active ? styles.tagActive : styles.tag}
                    onClick={() =>
                      dispatch(
                        setSearchState({
                          tags: active ? searchState.tags.filter((item) => item !== tag) : [...searchState.tags, tag],
                        })
                      )
                    }
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.listHeader}>
        <strong>为你找到 {total} 家符合条件的酒店</strong>
      </div>

      <div className={styles.list}>
        {list.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            favorite={favorites.includes(hotel.id)}
            onToggleFavorite={handleToggleFavorite}
            onClick={() => navigate(`/hotels/${hotel.id}`)}
          />
        ))}
      </div>

      {loading && <LoadingBlock text="正在加载更多酒店..." />}
      {!loading && error && <EmptyState title="接口异常" description={error} />}
      {!loading && !error && list.length === 0 && <EmptyState title="暂无结果" description="换个城市、关键词或筛选条件试试" />}

      <div ref={loaderRef} style={{ height: 24 }} />
      {!hasMore && list.length > 0 && <LoadingBlock text="已经到底啦，换个筛选看看更多酒店" />}
    </div>
  );
}
