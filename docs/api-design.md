# API 设计

统一响应格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

错误示例：

```json
{
  "code": 40001,
  "message": "参数校验失败",
  "details": {}
}
```

## 认证

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## 用户端

- `GET /api/banners`
- `GET /api/hotels`
- `GET /api/hotels/:id`
- `GET /api/hotels/:id/rooms`
- `POST /api/bookings`
- `GET /api/bookings`
- `GET /api/events`

## 商户端

- `GET /api/merchant/hotels`
- `GET /api/merchant/hotels/:id`
- `POST /api/merchant/hotels`
- `PUT /api/merchant/hotels/:id`
- `POST /api/merchant/hotels/:id/rooms`
- `PUT /api/merchant/rooms/:roomId`
- `DELETE /api/merchant/rooms/:roomId`

## 管理端

- `GET /api/admin/hotels`
- `GET /api/admin/logs`
- `PATCH /api/admin/hotels/:id/audit`
- `PATCH /api/admin/hotels/:id/publish`
- `PATCH /api/admin/hotels/:id/offline`
- `PATCH /api/admin/hotels/:id/restore`
