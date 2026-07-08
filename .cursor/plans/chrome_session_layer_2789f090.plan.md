---
name: Chrome Session Layer
overview: 根据 PRD v0.3，在现有 AutoTask Studio Electron + React + TypeScript 原型上实现"独立 Chrome Profile + Playwright/CDP 接管"的浏览器会话层。按 PRD 建议先执行 Iteration 1-3（类型、Mock 数据、UI 交互），再实现 Iteration 4（Electron IPC）。
todos:
  - id: iter1-types
    content: Iteration 1：新增 src/types/browser.ts，扩展 automation-task.ts、srm-portal.ts、settings.ts 类型
    status: completed
  - id: iter1-mock
    content: Iteration 1：新增 browser-sessions.json、browser-config.json、human-checkpoints.json Mock 数据
    status: completed
  - id: iter1-api
    content: Iteration 1：扩展 mock-api.ts 和新增 browser-store.ts
    status: completed
  - id: iter2-srm-list
    content: Iteration 2：SRM 列表页增加快速打开按钮、登录态 Badge、Profile 状态列
    status: completed
  - id: iter2-srm-detail
    content: Iteration 2：SRM 门户详情页增加浏览器 Profile Tab
    status: completed
  - id: iter3-status
    content: Iteration 3：扩展 StatusBadge 和 TaskActions，支持 HUMAN_OPERATING/SUCCESS_MANUAL
    status: completed
  - id: iter3-task-detail
    content: Iteration 3：任务详情页增加 HumanCheckpointPanel 和 BrowserSessionPanel
    status: completed
  - id: iter3-confirm
    content: Iteration 3：实现确认已完成弹窗和状态流转逻辑
    status: completed
  - id: iter4-runs
    content: Iteration 4：运行监控页增加浏览器会话 Tab
    status: completed
  - id: iter4-settings
    content: Iteration 4：系统设置浏览器 Tab 增加 Chrome/Edge 检测和配置项
    status: completed
  - id: iter5-ipc
    content: Iteration 5：新增 Electron Browser IPC 模块（oRPC 模式）
    status: completed
isProject: false
---

# Chrome 会话层功能实现计划

## 现有架构概述

项目使用 Electron Forge + Vite + React + TanStack Router/Query + shadcn/ui + zustand 构建。IPC 层使用 `@orpc/server` + MessagePort 通道（非传统 ipcMain.handle 模式）。关键文件：

- 类型定义：`src/types/` (srm-portal.ts, automation-task.ts, settings.ts 等)
- Mock 数据：`src/mock/` (tasks.json, srm-portals.json 等)
- Mock API：`src/services/mock-api.ts`
- 状态管理：`src/stores/task-store.ts`
- IPC 路由：`src/ipc/router.ts` (使用 @orpc/server 模式)
- 页面组件：`src/features/` (srm-portals, tasks, runs, settings)
- 组件：`src/components/business/` (status-badge, task-actions 等)

## Iteration 1：类型与 Mock 数据

### 1.1 新增类型文件

创建 [`src/types/browser.ts`](autotask-studio/src/types/browser.ts)，定义：
- `BrowserSession` - 浏览器会话
- `BrowserConfig` - 浏览器配置
- `HumanCheckpoint` - 人工处理检查点
- `BrowserSessionStatus` - 会话状态
- `LoginCheckConfig` - 登录态检测配置

### 1.2 扩展现有类型

- [`src/types/automation-task.ts`](autotask-studio/src/types/automation-task.ts)：增加 `HUMAN_OPERATING` 和 `SUCCESS_MANUAL` 状态
- [`src/types/srm-portal.ts`](autotask-studio/src/types/srm-portal.ts)：增加 `profileId`, `profilePath`, `quickOpenUrl`, `loginState`, `lastOpenedAt`, `lastLoginCheckedAt` 字段；`browserType` 改为 `'chrome' | 'edge' | 'chromium'`
- [`src/types/settings.ts`](autotask-studio/src/types/settings.ts)：增加 `BrowserConfig` 相关字段

### 1.3 新增 Mock 数据

- `src/mock/browser-sessions.json` - 浏览器会话示例
- `src/mock/browser-config.json` - 浏览器配置
- `src/mock/human-checkpoints.json` - 人工检查点

### 1.4 扩展 Mock API

在 [`src/services/mock-api.ts`](autotask-studio/src/services/mock-api.ts) 中新增：
- `getBrowserConfig` / `updateBrowserConfig`
- `getBrowserSessions` / `getBrowserSessionById`
- `openPortalMock` - 模拟打开 SRM
- `openHumanTaskMock` - 模拟打开待人工任务
- `closeSessionMock` - 模拟关闭会话
- `resetPortalProfileMock` - 模拟重置 Profile
- `getHumanCheckpoints` / `getHumanCheckpointByTaskId`
- `confirmHumanTaskMock` - 模拟确认人工完成

### 1.5 新增 Browser Session Store

创建 `src/stores/browser-store.ts`，管理会话状态的前端内存缓存。

---

## Iteration 2：客户 SRM 快速打开 UI

### 2.1 SRM 列表页增强

修改 [`src/features/srm-portals/srm-portals-list.tsx`](autotask-studio/src/features/srm-portals/srm-portals-list.tsx)：
- 新增列：登录态 Badge、Profile 状态、最近打开时间
- 新增操作按钮：快速打开、测试登录、打开 Profile 目录、重置登录态
- 按钮规则：enabled 状态显示快速打开/测试登录，disabled 禁用
- 有活跃会话时显示"查看会话"

### 2.2 SRM 门户详情页增强

修改 [`src/features/srm-portals/srm-portal-detail.tsx`](autotask-studio/src/features/srm-portals/srm-portal-detail.tsx)：
- 新增 Tab：浏览器 Profile
- 显示 Profile ID、Path、浏览器类型、最近打开时间、登录态、当前会话状态、CDP Endpoint
- 增加操作：快速打开、测试登录、关闭会话、打开 Profile 目录、重置 Profile

### 2.3 更新 Mock SRM 数据

修改 [`src/mock/srm-portals.json`](autotask-studio/src/mock/srm-portals.json)，为每个 portal 增加 profileId/profilePath/loginState/lastOpenedAt 字段。

---

## Iteration 3：WAITING_HUMAN 任务 UI

### 3.1 状态 Badge 扩展

修改 [`src/components/business/status-badge.tsx`](autotask-studio/src/components/business/status-badge.tsx)：
- 增加 `HUMAN_OPERATING` (人工处理中) 和 `SUCCESS_MANUAL` (人工完成) 状态配置

### 3.2 任务操作组件增强

修改 [`src/components/business/task-actions.tsx`](autotask-studio/src/components/business/task-actions.tsx)：
- `WAITING_HUMAN`：显示【快速打开】【确认已完成】
- `HUMAN_OPERATING`：显示【重新打开】【确认已完成】
- `SUCCESS_MANUAL`：显示【查看记录】

### 3.3 任务详情页增强

修改 [`src/features/tasks/task-detail.tsx`](autotask-studio/src/features/tasks/task-detail.tsx)：
- 新增 `HumanCheckpointPanel` 组件：显示原因、操作说明、目标页面、快速打开/确认按钮
- 新增 `BrowserSessionPanel` 组件：显示当前浏览器会话信息
- 根据 WAITING_HUMAN / HUMAN_OPERATING / SUCCESS_MANUAL 状态渲染不同面板

### 3.4 任务列表 Tab 扩展

修改 [`src/features/tasks/tasks-list.tsx`](autotask-studio/src/features/tasks/tasks-list.tsx)：
- 增加 "人工处理中" Tab

### 3.5 确认已完成弹窗

新建确认对话框组件，支持填写备注后确认。

---

## Iteration 4：运行监控浏览器会话 Tab + 系统设置浏览器配置

### 4.1 运行监控页增强

修改 [`src/features/runs/runs-list.tsx`](autotask-studio/src/features/runs/runs-list.tsx)：
- 新增"浏览器会话" Tab
- 会话表格：Session ID、客户、SRM 门户、任务、Profile ID、浏览器、PID、CDP Port、状态、启动时间、最近活跃、操作（查看/关闭/复制 CDP/打开 Profile）

### 4.2 系统设置浏览器 Tab 增强

修改 [`src/features/settings/index.tsx`](autotask-studio/src/features/settings/index.tsx)：
- 浏览器设置 Tab 增加：Chrome/Edge 路径自动检测、Profile 根目录、下载目录、CDP 端口范围、重置 Profile 开关
- 将 browserType 选项改为 chrome/edge/chromium

---

## Iteration 5：Electron Browser IPC（oRPC 模式）

项目使用 `@orpc/server` + MessagePort 通道，不是传统 ipcMain.handle。

### 5.1 新增 IPC 模块

创建 `src/ipc/browser/` 目录：
- `schemas.ts` - Zod 输入验证
- `handlers.ts` - 处理函数（调用 Electron shell.openPath, child_process 等）
- `index.ts` - 导出 browser router

### 5.2 注册到路由

修改 [`src/ipc/router.ts`](autotask-studio/src/ipc/router.ts) 添加 `browser` 路由。

### 5.3 Renderer 端 Action

新增 `src/actions/browser.ts`，封装 `ipc.client.browser.*` 调用。

---

## 技术决策

- **IPC 模式**：沿用项目现有 oRPC MessagePort 模式，不引入传统 ipcMain.handle
- **状态管理**：新增 `browser-store.ts`(zustand) 管理会话缓存
- **Mock 策略**：先纯前端 Mock，操作结果写入 zustand store
- **不涉及后端**：本阶段不创建 local-agent Python 后端（PRD Iteration 5-8），仅在 Electron 主进程实现 IPC handler

## 文件变更总结

新增文件（约 8 个）：
- `src/types/browser.ts`
- `src/mock/browser-sessions.json`
- `src/mock/browser-config.json`
- `src/mock/human-checkpoints.json`
- `src/stores/browser-store.ts`
- `src/ipc/browser/schemas.ts`
- `src/ipc/browser/handlers.ts`
- `src/ipc/browser/index.ts`
- `src/actions/browser.ts`

修改文件（约 10 个）：
- `src/types/automation-task.ts`
- `src/types/srm-portal.ts`
- `src/types/settings.ts`
- `src/mock/srm-portals.json`
- `src/services/mock-api.ts`
- `src/stores/task-store.ts`
- `src/features/srm-portals/srm-portals-list.tsx`
- `src/features/srm-portals/srm-portal-detail.tsx`
- `src/features/tasks/task-detail.tsx`
- `src/features/tasks/tasks-list.tsx`
- `src/components/business/status-badge.tsx`
- `src/components/business/task-actions.tsx`
- `src/features/runs/runs-list.tsx`
- `src/features/settings/index.tsx`
- `src/ipc/router.ts`
