# 山隐茶事

一个无需后端即可运行的东方茶文化生活方式网站。页面采用原生 HTML、CSS 和 JavaScript 构建，包含完整的响应式布局与本地交互闭环。

## 运行

直接打开 `index.html` 即可预览。也可以在项目目录执行：

```powershell
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。

## 页面

- `#/home` 首页
- `#/culture` 茶文化与六道工艺
- `#/regions` 山河茶图
- `#/audit` 数据图谱
- `#/ai` AI 茶事顾问
- `#/community` 茶友社区
- `#/collection` 茶集与风味卡
- `#/experience` 茶席体验与预约
- `#/articles` 茶事文章
- `#/profile` 个人茶库
- `#/about` 品牌与内容准则

## 交互

- 登录、注册与游客模式
- 全站搜索（`Ctrl/Cmd + K`）
- 本地 AI 茶事冲泡建议
- 茶类筛选、茶区切换与数据可视化
- 活动筛选、收藏与加入茶席
- 茶样收藏、文章阅读与茶席预约
- 使用 `localStorage` 保存当前浏览器的演示状态

AI 茶事顾问为本地规则引擎，不需要 API Key。页面中的登录、预约、购买与收藏均为前端演示，不会产生真实账户、支付或席位。

## 图片

图片授权与来源记录位于 `.design-work/credits.json`。用户提供的茶山照片用于主要视觉；其余演示照片来自 Pixabay 的内容许可与 Rawpixel 公共领域素材。
