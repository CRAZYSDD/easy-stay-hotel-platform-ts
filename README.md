# 易宿酒店预订平台 TypeScript 版

这是从原 JS 项目 `C:\Users\70787\Desktop\XCDazuoye` 独立复制出来的 TypeScript 版本，目录为：

```text
C:\Users\70787\Desktop\XCDazuoye-ts
```

原来的 JS 项目没有被覆盖，可以继续照常运行。

## TypeScript 迁移说明

- 前端 `client/src` 已迁移为 `.ts / .tsx`
- 后端 `server/src` 已迁移为 `.ts`
- 已新增前端和后端 `tsconfig.json`
- 已新增根命令 `npm run typecheck`，用于同时检查前端和后端 TypeScript 类型
- 原有功能、页面、接口、数据库和测试账号保持不变

## 运行命令

```bash
cd C:\Users\70787\Desktop\XCDazuoye-ts
npm install
npm run prisma:generate --workspace server
npm run db:push --workspace server
npm run seed --workspace server
npm run dev
```

## 验证命令

```bash
npm run typecheck
npm run build
```

## 访问地址

- 前端：http://localhost:5173
- 后端：http://localhost:4000
- 后台登录：http://localhost:5173/admin/login

## 默认账号

- 管理员：`admin / 123456`
- 商户1：`merchant1 / 123456`
- 商户2：`merchant2 / 123456`
