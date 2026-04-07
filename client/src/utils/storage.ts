export const getFavorites = () => JSON.parse(localStorage.getItem('easyStayFavorites') || '[]');
export const getRecentViews = () => {
  const list = JSON.parse(localStorage.getItem('easyStayRecent') || '[]');
  const seen = new Set();
  const unique = list.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  return unique.sort((a, b) => {
    const aSoldOut = !!a?.soldOut;
    const bSoldOut = !!b?.soldOut;
    if (aSoldOut === bSoldOut) return 0;
    return aSoldOut ? 1 : -1;
  });
};
export const setRecentViews = (list) => localStorage.setItem('easyStayRecent', JSON.stringify(list));
export const getSearchHistory = () => JSON.parse(localStorage.getItem('easyStaySearchHistory') || '[]');
