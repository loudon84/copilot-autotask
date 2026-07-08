# AutoTask Studio Mock UI 原型 PRD

## 1. 项目目标

AutoTask Studio 是一个面向客户 SRM 自动化作业的桌面工作台。第一阶段只实现 Mock UI 原型，不接真实邮箱、不接真实 RPA、不接 ERP、不接后端服务。

本阶段目标是基于 Electron + React + TypeScript + shadcn/ui 快速完成可演示的产品原型，所有业务数据通过本地 JSON 文件 mock。

## 2. 技术底座

### 2.1 主工程

基于 `LuanRoger/electron-shadcn` 作为 Electron 桌面应用底座。

### 2.2 页面组件参考

参考 `satnaing/shadcn-admin` 的页面结构和组件模式，包括：

* Sidebar
* Header
* Dashboard Cards
* Data Table
* Command Menu
* Settings Layout
* Form Layout
* Theme Toggle
* Responsive Layout

### 2.3 技术栈

```text
Electron
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
TanStack Router
TanStack Query
Zustand
React Hook Form
Zod
Lucide Icons
```

### 2.4 本阶段不做

```text
不接真实 IMAP
不接 SMTP
不接真实 Playwright Worker
不接真实 FastAPI Backend
不接 ERP
不接数据库
不做真实账号登录
不做真实凭证保存
不做真实 RPA 执行
```

## 3. 产品定位

AutoTask Studio Mock UI 用于展示自动化任务平台的产品形态，包括：

```text
工作台
自动化任务
流程模板
RPA 组件库
客户 SRM
运行监控
证据中心
系统设置
```

本阶段重点是页面结构、业务对象、任务状态、运行日志、截图证据、流程步骤、客户 SRM 配置的可视化表达。

## 4. 信息架构

```text
AutoTask Studio
├─ 工作台 Dashboard
├─ 自动化任务 Tasks
│   ├─ 全部任务
│   ├─ 新建任务
│   └─ 任务详情
├─ 流程模板 Workflows
│   ├─ 模板列表
│   ├─ 模板详情
│   └─ 模板编辑
├─ RPA 组件库 Components
├─ 客户 SRM SRM Portals
│   ├─ 客户门户列表
│   └─ 门户配置详情
├─ 运行监控 Runs
│   ├─ 运行队列
│   ├─ Worker 状态
│   └─ 运行详情
├─ 证据中心 Artifacts
└─ 系统设置 Settings
```

## 5. 页面清单

### 5.1 App Layout

路径：

```text
src/routes/__root.tsx
src/components/layout/app-shell.tsx
src/components/layout/sidebar.tsx
src/components/layout/header.tsx
```

页面结构：

```text
┌──────────────────────────────────────────────┐
│ Header                                       │
├───────────────┬──────────────────────────────┤
│ Sidebar       │ Main Content                 │
│               │                              │
└───────────────┴──────────────────────────────┘
```

Sidebar 菜单：

```text
工作台
自动化任务
流程模板
RPA组件库
客户SRM
运行监控
证据中心
系统设置
```

Header 内容：

```text
左侧：当前页面标题 / 面包屑
中间：全局搜索 Command
右侧：Worker 状态、主题切换、用户菜单
```

Worker 状态展示：

```text
Online
Busy
Offline
```

## 6. Mock 数据设计

所有 mock 数据放在：

```text
src/mock/
├─ dashboard.json
├─ tasks.json
├─ task-runs.json
├─ workflow-templates.json
├─ rpa-components.json
├─ srm-portals.json
├─ workers.json
├─ artifacts.json
├─ audit-logs.json
└─ settings.json
```

所有 mock 读取统一封装：

```text
src/services/mock-api.ts
```

要求：

```text
1. 页面不直接 import JSON
2. 页面统一调用 mockApi
3. mockApi 返回 Promise，模拟接口请求
4. 后续真实 API 替换时，只替换 services 层
```

示例：

```ts
export const mockApi = {
  getDashboard: async () => dashboard,
  getTasks: async () => tasks,
  getTaskById: async (id: string) => tasks.find(item => item.id === id),
  getWorkflowTemplates: async () => workflowTemplates,
  getRuns: async () => taskRuns,
  getArtifacts: async () => artifacts,
}
```

## 7. 核心数据模型

### 7.1 AutomationTask

```ts
export type AutomationTaskStatus =
  | 'DRAFT'
  | 'READY'
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_HUMAN'
  | 'WAITING_RETRY'
  | 'SUCCESS'
  | 'PARTIAL_SUCCESS'
  | 'FAILED'
  | 'CANCELLED'

export interface AutomationTask {
  id: string
  title: string
  taskType: string
  customerName: string
  srmPortalName: string
  workflowTemplateId: string
  workflowTemplateName: string
  status: AutomationTaskStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  owner: string
  input: Record<string, any>
  currentStep?: string
  progress: number
  createdAt: string
  updatedAt: string
}
```

### 7.2 WorkflowTemplate

```ts
export interface WorkflowTemplate {
  id: string
  name: string
  code: string
  description: string
  category: string
  version: string
  status: 'enabled' | 'disabled' | 'draft'
  target: 'web' | 'desktop' | 'file' | 'hybrid'
  inputSchema: WorkflowInputField[]
  steps: WorkflowStep[]
  createdAt: string
  updatedAt: string
}
```

### 7.3 WorkflowStep

```ts
export interface WorkflowStep {
  id: string
  name: string
  type: string
  description?: string
  input?: Record<string, any>
  timeout?: number
  retry?: number
  onError?: 'fail' | 'retry' | 'wait_human' | 'ignore'
}
```

### 7.4 TaskRun

```ts
export interface TaskRun {
  id: string
  taskId: string
  taskTitle: string
  workflowTemplateName: string
  workerId: string
  status: AutomationTaskStatus
  currentStepId?: string
  startedAt: string
  endedAt?: string
  durationSeconds?: number
  stepRuns: StepRun[]
  logs: RunLog[]
}
```

### 7.5 StepRun

```ts
export interface StepRun {
  id: string
  stepId: string
  stepName: string
  stepType: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'WAITING_HUMAN'
  startedAt?: string
  endedAt?: string
  message?: string
  artifacts?: string[]
}
```

### 7.6 SRMPortal

```ts
export interface SRMPortal {
  id: string
  customerName: string
  name: string
  url: string
  loginType: 'username_password' | 'sso' | 'manual'
  browserType: 'chromium' | 'firefox' | 'webkit'
  runMode: 'headed' | 'headless'
  status: 'enabled' | 'disabled'
  locatorProfile: Record<string, string>
  createdAt: string
  updatedAt: string
}
```

### 7.7 Artifact

```ts
export interface Artifact {
  id: string
  taskId: string
  runId: string
  name: string
  type: 'screenshot' | 'download' | 'upload' | 'trace' | 'dom_snapshot' | 'log'
  filePath: string
  sizeText: string
  createdAt: string
}
```

## 8. Mock JSON 示例

### 8.1 tasks.json

```json
[
  {
    "id": "task_001",
    "title": "获取客户A采购订单 PO-20260629-001",
    "taskType": "srm_fetch_po",
    "customerName": "客户A",
    "srmPortalName": "客户A SRM生产环境",
    "workflowTemplateId": "wf_srm_fetch_po",
    "workflowTemplateName": "SRM 获取采购订单",
    "status": "RUNNING",
    "priority": "normal",
    "owner": "张三",
    "input": {
      "po_no": "PO-20260629-001",
      "contract_no": "CT-20260629-009"
    },
    "currentStep": "搜索采购订单",
    "progress": 45,
    "createdAt": "2026-06-29 09:20:00",
    "updatedAt": "2026-06-29 09:35:00"
  },
  {
    "id": "task_002",
    "title": "上传客户B装箱单 PK-883",
    "taskType": "srm_upload_packing_list",
    "customerName": "客户B",
    "srmPortalName": "客户B 供应商平台",
    "workflowTemplateId": "wf_upload_packing_list",
    "workflowTemplateName": "SRM 上传装箱单",
    "status": "WAITING_HUMAN",
    "priority": "high",
    "owner": "李四",
    "input": {
      "delivery_no": "DN-20260629-883",
      "packing_file": "packing_list_883.xlsx"
    },
    "currentStep": "等待人工处理验证码",
    "progress": 60,
    "createdAt": "2026-06-29 10:10:00",
    "updatedAt": "2026-06-29 10:24:00"
  }
]
```

### 8.2 workflow-templates.json

```json
[
  {
    "id": "wf_srm_fetch_po",
    "name": "SRM 获取采购订单",
    "code": "srm_fetch_po",
    "description": "登录客户 SRM，按 PO 编号搜索采购订单并下载合同或订单附件。",
    "category": "采购订单",
    "version": "1.0.0",
    "status": "enabled",
    "target": "web",
    "inputSchema": [
      {
        "name": "po_no",
        "label": "PO 编号",
        "type": "string",
        "required": true
      },
      {
        "name": "contract_no",
        "label": "合同编号",
        "type": "string",
        "required": false
      }
    ],
    "steps": [
      {
        "id": "step_login",
        "name": "登录客户 SRM",
        "type": "srm.login",
        "timeout": 60,
        "retry": 1,
        "onError": "wait_human"
      },
      {
        "id": "step_search_po",
        "name": "搜索采购订单",
        "type": "srm.search_po",
        "input": {
          "po_no": "{{task.input.po_no}}"
        },
        "timeout": 30,
        "retry": 2,
        "onError": "fail"
      },
      {
        "id": "step_download_contract",
        "name": "下载采购合同",
        "type": "file.download",
        "timeout": 60,
        "retry": 2,
        "onError": "wait_human"
      },
      {
        "id": "step_save_evidence",
        "name": "保存截图证据",
        "type": "evidence.screenshot",
        "timeout": 10,
        "retry": 0,
        "onError": "ignore"
      }
    ],
    "createdAt": "2026-06-29 08:00:00",
    "updatedAt": "2026-06-29 08:00:00"
  }
]
```

## 9. 页面详细需求

### 9.1 工作台 Dashboard

路由：

```text
/dashboard
```

页面目标：

展示自动化任务平台的整体运行状态。

页面模块：

```text
1. 今日任务统计卡片
2. 当前执行队列
3. 待人工处理任务
4. 最近失败任务
5. Worker 状态
6. 任务类型分布
```

统计卡片：

```text
待执行
执行中
待人工
失败
今日完成
成功率
```

任务队列表格字段：

```text
任务标题
客户
流程模板
当前步骤
状态
负责人
更新时间
操作
```

操作按钮：

```text
查看
执行
暂停
接管
重试
```

Mock 数据来源：

```text
dashboard.json
tasks.json
workers.json
```

### 9.2 自动化任务列表

路由：

```text
/tasks
```

页面目标：

管理所有自动化任务。

页面模块：

```text
1. 顶部筛选区
2. 任务状态 Tabs
3. 任务 DataTable
4. 批量操作
5. 新建任务按钮
```

筛选条件：

```text
客户
任务类型
流程模板
状态
优先级
负责人
创建日期
关键词
```

表格字段：

```text
任务标题
客户
任务类型
流程模板
状态
优先级
当前步骤
进度
负责人
创建时间
更新时间
操作
```

操作：

```text
查看详情
执行
暂停
取消
重试
复制任务
```

状态显示规则：

```text
READY：灰色
QUEUED：蓝色
RUNNING：蓝色动态
WAITING_HUMAN：黄色
SUCCESS：绿色
FAILED：红色
CANCELLED：灰色
```

### 9.3 新建任务

路由：

```text
/tasks/new
```

页面目标：

通过表单创建一个 Mock 自动化任务。

页面模块：

```text
1. 基础信息
2. 客户 SRM 选择
3. 流程模板选择
4. 输入参数动态表单
5. 执行选项
6. 保存按钮
```

字段：

```text
任务名称
客户
SRM 门户
流程模板
优先级
负责人
输入参数
是否执行前确认
是否保存每步截图
是否开启 Trace
是否失败自动重试
```

交互：

```text
选择流程模板后，根据 workflow.inputSchema 渲染输入参数表单
点击保存后，在前端内存中追加任务
不需要真实持久化
可弹出 toast：任务已创建
```

### 9.4 任务详情

路由：

```text
/tasks/$taskId
```

页面目标：

展示单个自动化任务的业务数据、流程步骤、运行日志和证据。

布局：

```text
顶部：任务标题、状态、优先级、客户、负责人
左侧：流程步骤 Timeline
中间：运行日志和当前截图
右侧：任务输入参数、操作按钮、关联证据
底部：审计日志
```

主要组件：

```text
TaskHeader
TaskStepTimeline
RunLogPanel
EvidencePreview
TaskInputPanel
TaskActionPanel
AuditLogTable
```

操作按钮：

```text
执行
暂停
继续
取消
重试
人工接管
标记完成
```

Mock 行为：

```text
点击执行：状态从 READY 切换为 RUNNING，进度模拟增加
点击暂停：状态切换为 WAITING_HUMAN
点击重试：状态切换为 QUEUED
点击标记完成：状态切换为 SUCCESS
```

### 9.5 流程模板列表

路由：

```text
/workflows
```

页面目标：

展示所有 RPA 流程模板。

表格字段：

```text
模板名称
编码
分类
目标类型
版本
状态
步骤数
更新时间
操作
```

操作：

```text
查看
编辑
复制
禁用
测试运行
```

### 9.6 流程模板详情 / 编辑

路由：

```text
/workflows/$workflowId
```

页面目标：

展示流程模板的输入参数、步骤定义、错误处理策略。

布局：

```text
顶部：模板名称、版本、状态
左侧：配置导航
右侧：配置详情
```

配置导航：

```text
基础信息
输入参数
步骤配置
错误处理
Mock YAML
测试运行
```

步骤配置展示：

```text
Step Timeline
Step Cards
Step Type Badge
Timeout
Retry
onError
```

Mock YAML 区：

```yaml
workflow_id: wf_srm_fetch_po
name: SRM 获取采购订单
steps:
  - type: srm.login
  - type: srm.search_po
  - type: file.download
  - type: evidence.screenshot
```

### 9.7 RPA 组件库

路由：

```text
/components
```

页面目标：

展示平台支持的 RPA 原子组件。

分类：

```text
浏览器组件
页面操作组件
表单组件
文件组件
等待/断言组件
证据组件
人工介入组件
```

组件卡片字段：

```text
组件名称
组件类型
分类
描述
输入参数
输出结果
是否启用
```

组件示例：

```text
browser.goto
page.click
page.fill
page.select
page.wait_for_selector
file.download
file.upload
evidence.screenshot
human.confirm
human.takeover
```

### 9.8 客户 SRM 门户列表

路由：

```text
/srm-portals
```

页面目标：

管理客户 SRM 门户配置。

表格字段：

```text
客户名称
门户名称
URL
登录方式
浏览器类型
运行模式
状态
更新时间
操作
```

操作：

```text
查看配置
测试登录
编辑
禁用
```

### 9.9 客户 SRM 门户详情

路由：

```text
/srm-portals/$portalId
```

页面目标：

展示 SRM 登录配置、页面定位器、字段映射。

页面 Tab：

```text
基础信息
登录配置
页面定位器
字段映射
测试记录
```

字段：

```text
客户名称
门户名称
门户 URL
登录方式
浏览器类型
运行模式
账号占位符
密码占位符
MFA 策略
登录页 URL
用户名输入框 locator
密码输入框 locator
登录按钮 locator
PO 查询菜单 locator
PO 编号输入框 locator
查询按钮 locator
下载按钮 locator
```

注意：

```text
Mock 版本不保存真实密码
密码字段仅显示 ********
```

### 9.10 运行监控

路由：

```text
/runs
```

页面目标：

展示当前运行队列、历史运行记录、Worker 状态。

模块：

```text
Worker 状态卡片
运行队列表格
历史运行记录
失败重试列表
```

Worker 卡片字段：

```text
Worker 名称
状态
当前任务数
浏览器数量
CPU 占位
内存占位
最近心跳
```

运行记录字段：

```text
Run ID
任务标题
流程模板
Worker
状态
当前步骤
开始时间
耗时
操作
```

### 9.11 运行详情

路由：

```text
/runs/$runId
```

页面目标：

展示一次 WorkflowRun 的完整执行过程。

布局：

```text
左侧：StepRun Timeline
中间：实时日志
右侧：截图 / Artifact / 运行元数据
```

日志类型：

```text
INFO
WARN
ERROR
DEBUG
```

Mock 行为：

```text
日志从 task-runs.json 读取
可模拟自动滚动
可按日志级别筛选
```

### 9.12 证据中心

路由：

```text
/artifacts
```

页面目标：

集中展示 RPA 执行产生的截图、下载文件、Trace、DOM 快照和日志文件。

筛选：

```text
客户
任务
运行记录
文件类型
日期
关键词
```

表格字段：

```text
文件名
类型
客户
任务
Run ID
大小
创建时间
操作
```

操作：

```text
预览
下载
查看关联任务
查看关联运行
```

Mock 预览：

```text
截图：显示本地占位图片
PDF：显示 PDF 占位卡片
Trace：显示 Trace 文件信息
DOM：显示 HTML 文本占位
Log：显示日志文本占位
```

### 9.13 系统设置

路由：

```text
/settings
```

页面目标：

展示本地原型配置。

Tab：

```text
基础设置
浏览器设置
Worker 设置
存储设置
外观设置
Mock 数据设置
```

字段：

```text
默认浏览器类型
默认运行模式
是否保存截图
是否开启 Trace
Artifact 本地路径
日志级别
主题模式
Mock 延迟时间
```

## 10. 组件复用要求

### 10.1 业务组件

```text
src/components/business/
├─ status-badge.tsx
├─ priority-badge.tsx
├─ progress-cell.tsx
├─ task-actions.tsx
├─ step-timeline.tsx
├─ run-log-panel.tsx
├─ artifact-preview.tsx
├─ worker-status-card.tsx
├─ workflow-step-card.tsx
└─ srm-portal-card.tsx
```

### 10.2 通用页面组件

```text
src/components/common/
├─ page-header.tsx
├─ page-toolbar.tsx
├─ data-table.tsx
├─ empty-state.tsx
├─ confirm-dialog.tsx
├─ search-input.tsx
├─ filter-bar.tsx
└─ mock-loading.tsx
```

## 11. 设计风格

整体风格：

```text
企业内部工具
低饱和
信息密度适中
接近 shadcn-admin
默认支持 dark mode
任务状态颜色清晰
日志和证据面板偏工程化
```

色彩规则：

```text
SUCCESS：绿色
FAILED：红色
RUNNING：蓝色
WAITING_HUMAN：黄色
QUEUED：紫色
CANCELLED：灰色
```

## 12. 路由设计

```text
/
/dashboard
/tasks
/tasks/new
/tasks/$taskId
/workflows
/workflows/$workflowId
/components
/srm-portals
/srm-portals/$portalId
/runs
/runs/$runId
/artifacts
/settings
```

默认跳转：

```text
/ → /dashboard
```

## 13. Cursor 实施任务拆分

### 13.1 第一轮：项目改名与基础布局

```text
1. 基于 electron-shadcn 初始化项目
2. 将应用名称改为 AutoTask Studio
3. 新增 AppShell
4. 新增 Sidebar
5. 新增 Header
6. 配置路由
7. 增加空页面占位
```

### 13.2 第二轮：Mock 数据与类型

```text
1. 新增 src/mock/*.json
2. 新增 src/types/*.ts
3. 新增 src/services/mock-api.ts
4. 所有页面通过 mockApi 获取数据
5. 增加 loading 和 error 占位
```

### 13.3 第三轮：Dashboard

```text
1. 今日任务统计卡片
2. 当前执行队列
3. 待人工任务
4. 最近异常任务
5. Worker 状态
```

### 13.4 第四轮：任务模块

```text
1. 任务列表
2. 任务筛选
3. 任务新建表单
4. 任务详情
5. 任务状态切换 mock 行为
```

### 13.5 第五轮：流程模板模块

```text
1. 模板列表
2. 模板详情
3. 输入参数展示
4. 步骤 Timeline
5. Mock YAML 预览
```

### 13.6 第六轮：SRM 与 RPA 组件库

```text
1. SRM 门户列表
2. SRM 门户详情
3. RPA 组件库卡片
4. 组件分类筛选
```

### 13.7 第七轮：运行监控与证据中心

```text
1. Worker 状态卡片
2. 运行队列表格
3. Run 详情
4. 日志面板
5. Artifact 列表
6. Artifact 预览弹窗
```

### 13.8 第八轮：系统设置与整体 polish

```text
1. 设置页面
2. 主题切换
3. 全局搜索
4. 空状态
5. loading 状态
6. Toast 反馈
7. 页面细节统一
```

## 14. 验收标准

Mock UI 原型完成后，应满足：

```text
1. Electron 桌面应用可启动
2. 左侧导航完整
3. Dashboard 有真实 mock 数据展示
4. 自动化任务列表可筛选、查看详情
5. 可创建一个 mock 任务
6. 任务详情可展示流程步骤、日志、证据
7. 流程模板可展示输入参数和步骤
8. SRM 门户配置页面可展示 locator 和字段映射
9. 运行监控可展示 Worker 和 Run
10. 证据中心可展示截图、下载文件、Trace、DOM 快照
11. 所有数据来自本地 JSON
12. 页面无真实后端依赖
13. 代码结构清晰，后续可替换成真实 API
```

## 15. 第一版演示脚本

演示路径：

```text
1. 打开 AutoTask Studio
2. 进入工作台，查看今日任务统计
3. 进入自动化任务，查看 RUNNING / WAITING_HUMAN / FAILED 任务
4. 新建一个 SRM 获取采购订单任务
5. 打开任务详情，查看流程步骤和运行日志
6. 点击“人工接管”，状态变为 WAITING_HUMAN
7. 点击“标记完成”，状态变为 SUCCESS
8. 进入流程模板，查看 SRM 获取采购订单流程
9. 进入客户 SRM，查看客户门户配置
10. 进入证据中心，查看截图、Trace、下载文件
```

## 16. 后续真实化路径

Mock UI 完成后，按以下顺序真实化：

```text
阶段 1：Mock JSON → 本地 SQLite
阶段 2：任务执行状态 → 本地 FastAPI
阶段 3：RPA Worker → Playwright
阶段 4：Artifacts → 本地文件系统
阶段 5：邮箱入口 → IMAP
阶段 6：任务识别 → LLM
阶段 7：SRM Adapter → 真实客户 SRM
阶段 8：ERP Gateway → 后续业务系统接口
```
