# 正念花园 Mindful Garden

一个完全在本地运行的正念觉察网页应用。每次记录都会生成一朵由 seed 决定、可稳定复现的程序化 3D 花朵。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

### Windows 一键启动

依赖安装完成后，直接双击项目根目录中的 `START_GARDEN.bat`。启动器会运行本地服务器并自动打开浏览器。使用过程中请保留启动器窗口；关闭它即可停止本地服务。

> 不要直接双击 `index.html`。React 和 Three.js 使用浏览器模块，必须通过本地服务器加载；直接以 `file://` 打开会被浏览器的安全策略拦截。

### 终端启动

```bash
npm install
npm run dev
```

浏览器打开终端显示的本地地址。生产构建：

```bash
npm run build
npm run preview
```

## 数据与隐私

- 所有记录仅保存在当前浏览器的 `localStorage` 中。
- 不需要账户、服务端或联网。
- 清除浏览器站点数据会同时清除花园记录。
- 应用用于自我觉察与放松，不替代心理咨询、心理治疗或医疗诊断。

## 花朵系统

- 使用 React Three Fiber / Three.js 实时生成网格，不依赖图片、emoji 或固定 SVG。
- 记录 ID、文字、情绪与强度共同生成 seed；同一记录的视觉可以稳定复现。
- 花瓣层数、数量、长度、宽度、弧度、材质、颜色、粒子、叶片与茎曲线均由 seed 决定。
- 花园使用低复杂度模型；详情与生长仪式使用高质量模型。
- 支持 `prefers-reduced-motion`，并限制 DPR 与同时展示数量以照顾移动端性能。

## 部署到 GitHub Pages

项目已经包含 `.github/workflows/deploy-pages.yml`，推送到 `main` 分支后可以自动构建和部署。

1. 在 GitHub 新建一个空仓库，例如 `mindful-garden`。
2. 在本项目目录运行：

```bash
git init
git add .
git commit -m "Create Mindful Garden"
git branch -M main
git remote add origin https://github.com/你的用户名/mindful-garden.git
git push -u origin main
```

3. 打开 GitHub 仓库的 **Settings → Pages**。
4. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
5. 打开仓库的 **Actions** 页面，等待 `Deploy Mindful Garden to GitHub Pages` 变为绿色。
6. 部署地址通常是 `https://你的用户名.github.io/mindful-garden/`。

以后每次推送到 `main`，网站都会自动更新。GitHub Pages 上的记录仍保存在每位访问者自己的浏览器中，不会上传到仓库。
