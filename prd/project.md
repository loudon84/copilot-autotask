我先完成了仓库级别的初步扫描：

* 仓库：`loudon84/copilot-autotask`
* 当前定位：Electron + React 桌面端 AutoTask Studio
* 基础来自 `electron-shadcn`，README 显示项目采用 Electron、Vite、React、TypeScript、TanStack Router、React Query、Shadcn UI 等技术栈。
* 当前 package 已经明确产品定位为 `AutoTask Studio - SRM Automation Desktop Workbench`，并配置了 Electron Forge、Playwright、Vitest、TanStack 生态。
* 结合之前 AutoTask 规划文档，项目后续会扩展任务、流程模板、RPA Worker、Artifact、SRM Portal 等模块。

当前问题判断：

**Cursor Agent 每次全扫描的根因不是代码量，而是缺少“架构索引层”。**

建议增加：

```
docs/
 ├── CODEBASE.md              # 总体代码地图
 ├── ARCHITECTURE.md          # 架构说明
 ├── MODULES.md               # 模块职责
 ├── DATA_FLOW.md             # 数据流
 ├── IPC_CONTRACT.md          # Electron IPC约束
 └── CURSOR_CONTEXT.md        # 给 Agent 的入口说明

.cursor/
 ├── rules/
 │    ├── architecture.mdc
 │    ├── electron.mdc
 │    ├── react-feature.mdc
 │    ├── api-data.mdc
 │    └── testing.mdc
 │
 └── skills/
      ├── add-feature/
      ├── add-page/
      ├── add-ipc/
      └── refactor-module/
```

Cursor 每次任务先读取：

```
CURSOR_CONTEXT.md
        ↓
对应 module 文档
        ↓
rules 约束
        ↓
只扫描目标目录
```

避免：

```
旧方式：

Cursor
 ↓
扫描 src
 ↓
扫描所有组件
 ↓
扫描所有 route
 ↓
重新理解架构


新方式：

Cursor
 ↓
读取 CODEBASE.md
 ↓
定位 feature
 ↓
读取 module README
 ↓
修改目标文件
```

---

## 第一阶段：代码结构说明文档

建议新增：

# AutoTask Studio Codebase Guide

## 1. 项目定位

AutoTask Studio 是基于 Electron 的 SRM 自动化桌面工作台。

核心职责：

* 用户工作台
* 自动化任务管理
* 流程模板管理
* SRM Portal 配置
* RPA 执行状态展示
* Artifact / 日志展示

当前版本：

Desktop Client Only

后续扩展：

Desktop
+
nodeskclaw-backend
+
nodeskclaw-task
+
Playwright RPA Worker

---

# 2. 技术架构

## Desktop Runtime

Electron

职责：

* 创建窗口
* 管理生命周期
* 提供 Native 能力
* IPC 通信

## Renderer

React + TypeScript

职责：

* 页面渲染
* 用户交互
* 数据展示

## UI

shadcn/ui

职责：

* 基础组件
* Layout
* Form
* Table
* Dialog

## State

TanStack Query

职责：

* 服务端状态
* API 数据缓存

Zustand:

职责：

* 本地 UI 状态

---

# 3. 目录原则

推荐结构：

src/

├── main/
│   Electron Main Process
│
├── preload/
│   IPC Bridge
│
├── renderer/
│
│   ├── routes/
│   页面路由
│
│   ├── features/
│   业务模块
│
│   ├── components/
│   公共组件
│
│   ├── services/
│   API访问
│
│   ├── stores/
│   Zustand状态
│
│   ├── types/
│   类型定义
│
│   └── mock/
│   Mock数据

---

# 4. Feature 模块规范

每个业务模块必须独立：

features/

例如：

features/tasks/

包含：

```
tasks/
├── index.tsx
├── components/
├── hooks/
├── services/
├── types.ts
└── data.ts
```

禁止：

* 页面直接访问 JSON
* 页面直接调用 Electron IPC
* 跨 feature 直接 import 内部文件

---

# 5. AutoTask 核心模块

## Dashboard

职责：

展示：

* 今日任务
* Worker状态
* 最近运行
* 异常任务

## Tasks

职责：

自动化任务管理。

包含：

* Task List
* Task Detail
* Task Create

## Workflows

职责：

流程模板管理。

## SRM Portal

职责：

客户 Portal 配置。

## Runs

职责：

RPA运行记录。

## Artifacts

职责：

截图、Trace、文件。

---

# 6. Electron 规则

Electron 三层：

Main

负责：

* BrowserWindow
* 文件系统
* 系统能力

Preload

负责：

* contextBridge
* IPC API

Renderer

禁止：

* fs
* path
* electron

Renderer 必须通过：

window.xxx

调用 Native 能力。

---

# 7. 修改原则

新增页面：

修改：

routes

新增：

features/<module>

新增组件：

优先：

components/business

新增 Native 能力：

必须：

main IPC

*

preload bridge

*

renderer type

---

# 8. Cursor 工作入口

修改任何代码前：

1. 阅读 CURSOR_CONTEXT.md
2. 阅读目标 module README
3. 检查 rules
4. 最小范围修改

禁止：

* 全局重构
* 修改无关模块
* 删除架构约束
* 引入新的状态管理方案

---

## 第二阶段：Cursor Rules

建议 `.cursor/rules`

# AutoTask Studio Cursor Rules

## Architecture Rule

你正在维护 AutoTask Studio。

必须遵守：

1. 保持 Electron Main / Preload / Renderer 分离。
2. Renderer 不允许直接访问 Node API。
3. Native 能力必须通过 IPC。
4. 新功能优先增加 feature，而不是修改公共组件。

---

## React Feature Rule

新增业务功能：

必须：

```
features/
  module/
    index.tsx
    components/
    hooks/
    services/
    types.ts
```

禁止：

* 页面文件超过业务范围
* 一个组件承担多个领域职责
* 跨模块引用内部实现

---

## Data Rule

数据访问：

必须经过：

```
services/
```

禁止：

```
component
   |
   directly import json/api
```

正确：

```
component

 ↓

hook

 ↓

service

 ↓

api/mock
```

---

## Electron IPC Rule

新增 IPC：

必须创建：

```
ipc/
 module/

   module-channel.ts

   module-listener.ts

   module-context.ts
```

同时更新：

```
types.d.ts
```

禁止：

renderer:

```
window.require()
ipcRenderer
fs
```

---

## UI Rule

优先使用：

shadcn/ui

禁止：

重复创建基础组件。

业务组件放：

```
components/business
```

---

## Testing Rule

修改：

* workflow
* task
* ipc
* service

必须增加：

至少一个测试。

---

## Refactor Rule

重构必须：

1. 保持接口兼容。
2. 不跨模块移动大量代码。
3. 先增加文档，再修改代码。

---

## 第三阶段：Cursor Skills

建议把常用开发任务固化成 Skill。

# AutoTask Studio Cursor Skills

## Skill: add-feature

用途：

新增业务模块。

流程：

1. 阅读 CODEBASE.md
2. 创建：

features/<name>

3. 创建：

* index.tsx
* components
* hooks
* services
* types

4. 注册 route
5. 注册 sidebar
6. 添加 mock/API
7. 添加测试

输出：

新增文件列表。

---

## Skill: add-page

用途：

新增页面。

步骤：

1. 创建 page component
2. 添加 route
3. 添加 navigation
4. 添加 loading state
5. 添加 empty state

检查：

* 是否使用公共 Layout
* 是否复用 Table/Form/Dialog

---

## Skill: add-ipc

用途：

新增 Electron Native 能力。

步骤：

创建：

```
ipc/<feature>

feature-channel.ts

feature-listener.ts

feature-context.ts
```

更新：

```
listener-register

context-exposer

types.d.ts
```

验证：

Renderer 可以：

window.feature.xxx()

---

## Skill: replace-mock-api

用途：

Mock 替换真实 API。

步骤：

保持：

component

不变。

只替换：

services layer。

检查：

* Query Key
* Loading
* Error
* Empty State

---

## Skill: refactor-module

用途：

模块重构。

规则：

先生成：

```
MODULE_MAP.md
```

说明：

* 当前文件
* 依赖关系
* 修改范围

然后执行修改。

禁止：

一次重构整个 src。

---

## 推荐进一步增加一个 Agent 索引文件

这个文件价值最高：

```
.cursor/CURSOR_CONTEXT.md
```

每次 Cursor 新任务只需要先读它。

内容：

```
# AutoTask Context

## 当前阶段

Phase 1:
Electron Mock UI


## 架构入口

Desktop:
src/


## 业务模块

Tasks:
src/features/tasks

Workflow:
src/features/workflows

SRM:
src/features/srm


## 不要修改

components/ui
electron ipc core
router bootstrap


## 当前开发方向

Mock JSON
→
Local API
→
nodeskclaw-task
→
RPA Worker
```

---

下一步建议继续做：

1. **自动扫描 copilot-autotask 生成真实 CODEBASE.md**
2. **生成 `.cursor/rules/*.mdc` 文件**
3. **生成 `.cursor/skills` 目录结构**
4. **直接提交到仓库**

这样 Cursor Agent 后续开发 AutoTask Studio 新模块时，token 消耗会明显下降。
