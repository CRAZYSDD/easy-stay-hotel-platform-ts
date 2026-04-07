# 易宿酒店预订平台

易宿酒店预订平台是一个前后端分离的全栈酒店预订与酒店管理系统，包含移动端用户预订流程和 PC 端管理后台。项目以真实业务流程为核心，覆盖酒店查询、筛选、详情浏览、房型库存、收藏、最近浏览、预订模拟、商户维护酒店、管理员审核发布等完整场景。

项目采用 TypeScript 技术栈，前端使用 React + Vite + Redux Toolkit，后端使用 Node.js + Express + Prisma + SQLite，并通过 SSE 实现管理端操作后用户端数据实时同步。

## 项目亮点

- 前后端分离：`client` 与 `server` 独立拆分，接口通过 Axios 统一调用。
- TypeScript 全栈开发：前端页面、组件、状态管理、后端接口服务均使用 TypeScript。
- 真实业务流：支持商户新增/编辑酒店、管理员审核/发布/下线/恢复、用户端按状态展示可订酒店。
- 实时同步：通过 SSE 监听酒店信息更新、状态变化、预订库存变化，用户端自动刷新。
- 移动端体验：包含首页查询、酒店列表无限滚动、酒店详情、收藏页、最近浏览、搜索历史、日历选择等。
- 管理端体验：包含登录注册、角色跳转、商户酒店管理、管理员审核发布、操作日志等。
- 库存逻辑：房型库存为 0 时显示已售罄，酒店全部售罄后列表沉底、按钮禁用、详情底部状态同步。
- 筛选能力：支持城市、关键字、星级、价格区间、标签、价格排序等组合筛选。

## 技术栈

### 前端

- React
- TypeScript
- Vite
- React Router
- Redux Toolkit
- Axios
- Ant Design Mobile
- Ant Design
- CSS Modules
- dayjs

### 后端

- Node.js
- TypeScript
- Express
- Prisma
- SQLite
- JWT
- SSE
- Zod

## 目录结构

```text
easy-stay-hotel-platform-ts/
  client/
    src/
      api/
      components/
      constants/
      hooks/
      layouts/
      pages/
        admin/
        mobile/
      router/
      store/
      styles/
      types/
      utils/
  server/
    prisma/
    scripts/
    src/
      controllers/
      db/
      middlewares/
      routes/
      services/
      sse/
      utils/
  docs/
  README.md
```

## 核心功能

### 用户端

- 首页 Banner 轮播，点击可进入对应酒店详情。
- 城市切换、关键字搜索、入住/离店日期选择。
- 自定义日历组件，支持入住/离店区间选择和间夜计算。
- 快捷标签筛选，如亲子、豪华、免费停车、近地铁等。
- 酒店列表支持分页请求和 IntersectionObserver 无限滚动。
- 列表筛选与排序支持抽屉式展开交互。
- 酒店卡片展示图片、名称、英文名、星级、地址、标签、设施、最低价、库存状态。
- 酒店详情展示图片轮播、基础信息、酒店亮点、周边推荐、优惠信息和房型价格。
- 房型按可订优先、价格升序展示，售罄房型自动沉底。
- 支持收藏、取消收藏、我的收藏页、最近浏览、搜索历史。
- 支持轻量预订模拟，预订成功后扣减库存并实时刷新。

### 管理端

- 登录 / 注册，注册时可选择商户或管理员角色。
- 登录后根据角色自动跳转对应后台。
- 商户可新增、编辑、维护自己的酒店信息。
- 酒店表单支持基础信息、标签、设施、图片、优惠、周边信息、动态房型维护。
- 管理员可查看全部酒店，按审核和发布状态筛选。
- 管理员可审核通过、审核驳回、发布、下线、恢复上线。
- 审核驳回必须填写原因。
- 下线不是删除，支持恢复上线。
- 操作日志展示关键管理行为。

## 状态规则

用户端只展示满足以下条件的酒店：

- `auditStatus = approved`
- `publishStatus = published`
- `isOffline = false`

当酒店所有房型库存均为 0：

- 酒店卡片整体置灰
- 按钮显示“已售罄”
- 酒店在列表和收藏页中沉底
- 详情页底部操作区显示“已售罄”

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npm run prisma:generate --workspace server
npm run db:push --workspace server
npm run seed --workspace server
```

### 3. 启动项目

```bash
npm run dev
```

启动后访问：

- 前端：http://localhost:5173
- 后端：http://localhost:4000
- 后台登录：http://localhost:5173/admin/login
- 后端健康检查：http://localhost:4000/api/health

## 验证命令

```bash
npm run typecheck
npm run build
```

## 默认测试账号

- 管理员：`admin / 123456`
- 商户1：`merchant1 / 123456`
- 商户2：`merchant2 / 123456`

## 主要接口

### 认证

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### 用户端

- `GET /api/banners`
- `GET /api/hotels`
- `GET /api/hotels/:id`
- `GET /api/hotels/:id/rooms`
- `POST /api/bookings`
- `GET /api/events`

### 商户端

- `GET /api/merchant/hotels`
- `GET /api/merchant/hotels/:id`
- `POST /api/merchant/hotels`
- `PUT /api/merchant/hotels/:id`
- `POST /api/merchant/hotels/:id/rooms`
- `PUT /api/merchant/rooms/:roomId`
- `DELETE /api/merchant/rooms/:roomId`

### 管理员端

- `GET /api/admin/hotels`
- `PATCH /api/admin/hotels/:id/audit`
- `PATCH /api/admin/hotels/:id/publish`
- `PATCH /api/admin/hotels/:id/offline`
- `PATCH /api/admin/hotels/:id/restore`
- `GET /api/admin/logs`


