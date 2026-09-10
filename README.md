# AI·SubHub —— ChatGPT / Claude 会员代充高审美平台

> 基于 **React 18 + Vite + Tailwind CSS + Lucide Icons** 构建的高审美会员代充预约与服务落地页。
> 支持一键零配置部署至 **GitHub Pages (`https://<username>.github.io`)**，亦可无缝部署于任意静态托管平台（Cloudflare Pages、Vercel 等）。

---

## 🌟 核心特性与审美规范

1. **高审美设计语言 (拒绝千篇一律的廉价暗黑发光模板)**：
   - 融合 **Wise 国际化金融级暖调背景** (`#F8F8F5`) 与纯白纸感卡片，搭配极细边框与柔和阴影，赋予用户极高的信任感。
   - **官方双品牌差异化质感**：
     - **ChatGPT 专区**：炭墨黑 (`#0B0F19`) + 官方翡翠绿 (`#10A37F`) 高光，极简科技力量感。
     - **Claude 专区**：象牙暖沙 (`#FAF8F5`) + 官方标志赤陶橙 (`#D96B43`)，典雅人文与长文深度质感。
2. **完整收录 6 大核心套餐**：
   - ChatGPT: `GPT Plus (￥130)`、`GPT Pro 5x (￥669)`、`GPT Pro 20x (￥1099)`
   - Claude: `Claude Pro (￥160)`、`Claude Max 5x (￥710)`、`Claude Max 20x (￥1500)`
3. **三段式现代化预约收银台**：
   - **Step 1 信息填报**：套餐确认、联系方式必填校验（微信/手机号/邮箱）、远程软件（向日葵/ToDesk）、系统（Win/Mac）。
   - **Step 2 支付结算**：微信支付与支付宝双 Tab 切换展示收款码。
   - **Step 3 出具凭证**：自动触发礼花动效，生成标准唯一单号 `ORD-YYYYMMDD-XXXX`，支持「一键复制订单发送给微信客服」。
4. **本地订单持久化与模糊检索**：
   - 基于浏览器 `localStorage`，隐私 100% 掌握在用户本地，无需任何中心化数据库。
   - 独立查单抽屉，支持按单号、手机号、微信号即时模糊检索历史订单凭证。
5. **科学网络指引篇与问答篇**：
   - 完整收录 **Clash Verge Rev** 客户端官方来源、5 大使用步骤（系统代理、导入订阅、节点选择、Tun 虚拟网卡模式、默认端口 127.0.0.1:7897）。
   - 推荐魔法站点（狗狗加速、NanoCloud）及手续费提示。
   - 5 大常见问题手风琴折叠。
6. **营业时间动态呼吸灯**：
   - 依据当前时间动态判定客服状态（工作日 19:00~24:00 显示极速秒回，其余时间提示预约次日优先安排）。

---

## 🚀 部署至 GitHub Pages (`user.github.io`) 指南

本项目已配置相对路径 `base: './'` 及自动化 GitHub Actions 工作流文件，无论是部署在个人主页根域名（`https://username.github.io/`）还是仓库子路径（`https://username.github.io/repo/`），均不会发生静态资源 404 错误。

### 方法 A：通过 GitHub Actions 自动构建部署 (推荐)

1. 在 GitHub 上新建一个仓库（例如：`ai-recharge-hub`，或者个人根域名仓库 `username.github.io`）。
2. 将本项目代码推送至 GitHub 仓库：
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for ai-recharge-web"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<你的仓库名>.git
   git push -u origin main
   ```
3. 进入 GitHub 仓库页面：
   - 点击 **Settings** -> 左侧导航栏点击 **Pages**。
   - 在 **Build and deployment** 下方的 **Source** 下拉框中，选择 **GitHub Actions**。
4. 推送后，在仓库的 **Actions** 选项卡中会看到自动触发的 `Deploy to GitHub Pages` 工作流，通常 1 分钟左右即可完成部署。
5. 完成后即可通过你的专属地址访问：
   `https://<你的用户名>.github.io/<你的仓库名>/` 或 `https://<你的用户名>.github.io/`

---

### 方法 B：直接部署打包后的 `dist/` 静态文件夹

如果不想使用 GitHub Actions，也可以直接将项目本地构建好的 `dist` 目录推送到 gh-pages 分支或直接丢进支持静态托管的任何平台（如 Vercel、Cloudflare Pages、Netlify 等）：
```bash
npm run build
```
打包输出目录为 `dist/`，里面包含已压缩优化的 `index.html`、CSS 与 JS 资源，开箱即用。

---

## 🛠️ 如何自定义你的客服信息与收款码

所有业务配置均集中在 `src/config/` 目录中，只需修改以下文件即可：

- **客服微信号与营业时间**：编辑 [src/config/siteConfig.ts](src/config/siteConfig.ts)
  ```ts
  service: {
    wechat: '你的实际微信号',
    hours: '工作日 19:00 ~ 24:00',
    // ...
  }
  ```
- **套餐价格与文案调整**：编辑 [src/config/plans.ts](src/config/plans.ts)
- **问答 FAQ 更新**：编辑 [src/config/faq.ts](src/config/faq.ts)

---

## 💻 本地开发调试

```bash
# 安装依赖
npm install

# 启动本地开发服务 (热重载)
npm run dev

# 编译打包并进行严格类型检查
npm run build

# 预览打包后的产物
npm run preview
```
