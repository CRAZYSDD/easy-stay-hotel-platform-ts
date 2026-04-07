const SUPPORTED_CITY_NAMES = ['上海', '北京', '杭州', '深圳', '成都', '南京'];

const normalizeCityName = (value = '') =>
  String(value)
    .replace(/市$/, '')
    .replace(/特别行政区$/, '')
    .trim();

const resolveSupportedCity = (city, province, district) => {
  const candidates = [city, province, district]
    .flat()
    .filter(Boolean)
    .map((item) => normalizeCityName(item));

  return (
    candidates.find((item) => SUPPORTED_CITY_NAMES.includes(item)) ||
    SUPPORTED_CITY_NAMES.find((item) => candidates.some((candidate) => candidate.includes(item) || item.includes(candidate))) ||
    null
  );
};

export const reverseGeocodeLocation = async (latitude, longitude) => {
  const amapKey = process.env.AMAP_WEB_SERVICE_KEY;
  if (!amapKey) {
    throw new Error('未配置高德地图 Web 服务 Key');
  }

  const url = new URL('https://restapi.amap.com/v3/geocode/regeo');
  url.searchParams.set('key', amapKey);
  url.searchParams.set('location', `${longitude},${latitude}`);
  url.searchParams.set('extensions', 'base');
  url.searchParams.set('radius', '1000');
  url.searchParams.set('output', 'json');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('地图定位服务请求失败');
  }

  const data = await response.json();
  if (data.status !== '1' || !data.regeocode) {
    throw new Error(data.info || '地图逆地理编码失败');
  }

  const addressComponent = data.regeocode.addressComponent || {};
  const matchedCity = resolveSupportedCity(addressComponent.city, addressComponent.province, addressComponent.district);

  return {
    city: matchedCity,
    formattedAddress: data.regeocode.formatted_address || '',
    rawCity: normalizeCityName(addressComponent.city || addressComponent.province || ''),
    province: normalizeCityName(addressComponent.province || ''),
    district: normalizeCityName(addressComponent.district || ''),
  };
};
