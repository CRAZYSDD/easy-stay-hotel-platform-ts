import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cities = ['上海', '北京', '杭州', '深圳', '成都', '南京'];
const cityEnMap = {
  上海: 'Shanghai',
  北京: 'Beijing',
  杭州: 'Hangzhou',
  深圳: 'Shenzhen',
  成都: 'Chengdu',
  南京: 'Nanjing',
};
const namePool = [
  '外滩悦享酒店',
  '国贸云栖酒店',
  '西溪晨曦酒店',
  '南山雅筑酒店',
  '春熙锦程酒店',
  '秦淮泊心酒店',
  '陆家嘴泊岸酒店',
  '望京星屿酒店',
  '滨江映月酒店',
  '福田澜庭酒店',
  '宽窄云顶酒店',
  '玄武栖隐酒店',
  '静安臻选酒店',
  '三里屯和悦酒店',
  '西湖汀兰酒店',
  '前海观澜酒店',
];
const nameEnPool = [
  'Bund Joyview Hotel',
  'Guomao Cloud Retreat Hotel',
  'Xixi Aurora Hotel',
  'Nanshan Elegant House Hotel',
  'Chunxi Grand Voyage Hotel',
  'Qinhuai Poemheart Hotel',
  'Lujiazui Riverside Hotel',
  'Wangjing Star Isle Hotel',
  'Binjiang Moonlight Hotel',
  'Futian Lanting Hotel',
  'Kuanzhai Summit Hotel',
  'Xuanwu Hidden Realm Hotel',
  'Jingan Prestige Hotel',
  'Sanlitun Harmony Hotel',
  'West Lake Orchid Hotel',
  'Qianhai Grand Bay Hotel',
];
const tagsPool = ['亲子', '豪华', '免费停车', '商务', '近地铁', '江景', '高空酒廊', '温泉'];
const facilityPool = ['WiFi', '早餐', '健身房', '游泳池', '停车场', '会议室', '洗衣服务'];
const statuses = [
  { auditStatus: 'approved', publishStatus: 'published', isOffline: false, auditReason: null },
  { auditStatus: 'pending', publishStatus: 'draft', isOffline: false, auditReason: null },
  { auditStatus: 'rejected', publishStatus: 'draft', isOffline: false, auditReason: '酒店图片不完整，描述信息待补充' },
  { auditStatus: 'approved', publishStatus: 'offline', isOffline: true, auditReason: null },
];

const image = (seed, width = 1200, height = 800) => `https://picsum.photos/seed/${seed}/${width}/${height}`;

const roomTemplates = [
  { roomName: '高级大床房', bedType: '1.8m 大床', breakfastIncluded: true, cancelPolicy: '入住前 1 天可免费取消', price: 368, originalPrice: 488, stock: 5, roomArea: 28, maxGuests: 2 },
  { roomName: '豪华双床房', bedType: '1.35m 双床', breakfastIncluded: true, cancelPolicy: '不可取消', price: 428, originalPrice: 568, stock: 3, roomArea: 32, maxGuests: 2 },
  { roomName: '行政套房', bedType: '大床 + 客厅', breakfastIncluded: true, cancelPolicy: '入住前 2 天可免费取消', price: 688, originalPrice: 888, stock: 2, roomArea: 48, maxGuests: 3 },
  { roomName: '亲子主题房', bedType: '大床 + 儿童床', breakfastIncluded: true, cancelPolicy: '入住前 1 天可免费取消', price: 588, originalPrice: 728, stock: 1, roomArea: 40, maxGuests: 3 },
];

const baseHotels = Array.from({ length: 16 }).map((_, index) => {
  const city = cities[index % cities.length];
  const status = statuses[index % statuses.length];
  const merchantRef = index % 2 === 0 ? 1 : 2;

  return {
    merchantRef,
    nameZh: `${city}${namePool[index]}`,
    nameEn: `${cityEnMap[city]} ${nameEnPool[index]}`,
    city,
    address: `${city}市核心商圈${index + 8}号`,
    star: (index % 5) + 1,
    description: `位于${city}热门区域，融合舒适住宿与城市探索体验，适合商务、亲子和周末度假人群。`,
    openYear: 2012 + (index % 10),
    coverImage: image(`easy-stay-cover-${index}`),
    galleryImages: JSON.stringify([
      image(`easy-stay-gallery-${index}-1`),
      image(`easy-stay-gallery-${index}-2`),
      image(`easy-stay-gallery-${index}-3`),
    ]),
    tags: JSON.stringify([
      tagsPool[index % tagsPool.length],
      tagsPool[(index + 2) % tagsPool.length],
      tagsPool[(index + 4) % tagsPool.length],
    ]),
    facilities: JSON.stringify([
      facilityPool[index % facilityPool.length],
      facilityPool[(index + 2) % facilityPool.length],
      facilityPool[(index + 4) % facilityPool.length],
    ]),
    nearbyInfo: JSON.stringify([
      `距离地铁站 ${(index % 4) + 3}00 米`,
      `靠近热门商场 ${(index % 5) + 1} 公里`,
      '周边景点丰富，适合城市漫游',
    ]),
    discountInfo: index % 3 === 0 ? '限时连住 2 晚立减 80 元' : '提前预订享早餐双人份',
    latitude: 31.2 + index * 0.01,
    longitude: 121.4 + index * 0.01,
    ...status,
  };
});

async function main() {
  await prisma.booking.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.operationLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.create({ data: { username: 'admin', passwordHash, role: 'admin' } });
  const merchant1 = await prisma.user.create({ data: { username: 'merchant1', passwordHash, role: 'merchant' } });
  const merchant2 = await prisma.user.create({ data: { username: 'merchant2', passwordHash, role: 'merchant' } });
  const merchants = { 1: merchant1.id, 2: merchant2.id };

  for (const [index, hotelData] of baseHotels.entries()) {
    const { merchantRef, ...restHotelData } = hotelData;
    const hotel = await prisma.hotel.create({
      data: { ...restHotelData, merchantId: merchants[merchantRef] },
    });

    const rooms = roomTemplates.slice(0, 2 + (index % 3)).map((room, roomIndex) => ({
      ...room,
      price: room.price + index * 12 + roomIndex * 20,
      originalPrice: room.originalPrice + index * 16 + roomIndex * 24,
      stock: Math.max(1, room.stock - (index % 2)),
      roomImage: image(`easy-stay-room-${index}-${roomIndex}`, 600, 420),
      hotelId: hotel.id,
    }));

    await prisma.roomType.createMany({ data: rooms });
  }

  const approvedHotels = await prisma.hotel.findMany({
    where: { auditStatus: 'approved', publishStatus: 'published', isOffline: false },
    take: 5,
  });

  for (const [index, hotel] of approvedHotels.entries()) {
    await prisma.banner.create({
      data: {
        title: `${hotel.city}热门精选 ${index + 1}`,
        image: hotel.coverImage,
        targetHotelId: hotel.id,
        sortOrder: index + 1,
        isActive: true,
      },
    });
  }

  await prisma.operationLog.createMany({
    data: [
      { userId: admin.id, action: 'SEED_INIT', detail: '初始化系统演示数据' },
      { userId: merchant1.id, action: 'CREATE_HOTEL', detail: '创建了多家待审核酒店' },
      { userId: merchant2.id, action: 'CREATE_HOTEL', detail: '创建了多家已发布酒店' },
    ],
  });

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
