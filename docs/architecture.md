# 易宿酒店预订平台架构说明

## 整体架构

- `client/`：React + Vite 单页应用
- `server/`：Express + Prisma + SQLite API 服务
- `SSE`：用于管理端保存、审核、发布、下线后，用户端和后台自动刷新

## 前端拆分

- 移动端路由：
  - `/` 首页查询
  - `/hotels` 酒店列表
  - `/hotels/:id` 酒店详情
- 管理端路由：
  - `/admin/login`
  - `/admin/register`
  - `/admin/merchant/hotels`
  - `/admin/merchant/hotels/new`
  - `/admin/merchant/hotels/:id/edit`
  - `/admin/audit`
  - `/admin/logs`

## 后端分层

- `routes`：路由分发
- `controllers`：请求解析与响应
- `services`：业务逻辑
- `middlewares`：JWT、角色权限、错误处理
- `prisma`：数据模型与 seed

## 核心业务规则

- 用户端只展示：`auditStatus=approved` + `publishStatus=published` + `isOffline=false`
- 商户保存酒店后状态自动回到 `pending`
- 酒店详情房型列表按价格升序返回
- 管理员驳回必须填写 `auditReason`
- 下线为可恢复状态，不做物理删除
