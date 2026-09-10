# DJI 航拍航线计算器 (纯前端版)

基于 **物理焦距 + 物理感光元件尺寸** 的专业 DJI 航拍任务规划与曝光计算器。
采用 **Claude / Anthropic 质感设计系统**（暖色纸本底色、经典陶土色调、人文主义衬线排版），纯静态单页架构，**零 Python 依赖、零构建配置、零后端服务**，支持本地双击直接运行与全终端（PC / 移动端）自适应响应。

---

## 🌟 核心特性

- **纯前端零依赖**：无须 Python、无须 Node.js、无须任何外部后端接口。所有相机光学数据库已内嵌，完全不受浏览器跨域（CORS）与 `fetch` 限制。
- **本地双击即用**：直接双击 `index.html`（`file://` 协议）即可完美运行，断网/离线环境下也能正常作业。
- **极简多端部署**：可直接部署到 GitHub Pages、Cloudflare Pages、Vercel、Netlify、静态 Nginx，甚至存入 U 盘或手机平板浏览器本地打开。
- **PC & 移动端深度自适应**：
  - **PC 端**：经典宽屏双栏并排布局，左侧精准调参，右侧指标大卡与视野投影示意图实时联动。
  - **移动端**：自适应流式单栏排版，触控目标规范达 44px+，输入框针对手机数字键盘（`inputmode="decimal"`）优化，防止 iOS Safari 自动缩放。
- **Claude 风格视觉与交互**：
  - 标志性 Parchment 暖纸质地底色与 Terracotta 陶土红点缀。
  - 3D 交互式空间投影视锥与多航带/航向重叠几何可视化（支持 360° 自由旋转、缩放与顶/侧/透视视角快速切换）。
  - 一键复制格式化规划简报，方便飞手直接发送到作业微信群或备忘录。

---

## 🚀 部署与使用方式

### 方式一：本地直接双击打开（最简单）
直接使用电脑或手机上的任意浏览器打开 `index.html` 即可使用，无需启动任何服务器。

### 方式二：静态托管平台一键上线
将项目文件夹上传至任意静态平台：
- **GitHub Pages**：直接推送仓库并在 Settings 中开启 Pages。
- **Cloudflare Pages / Vercel / Netlify**：直接导入仓库或拖拽文件夹，无需配置构建命令（Build Command 留空，Publish Directory 设为根目录）。
- **Nginx / Apache / Caddy**：将静态文件丢入 HTML 目录即可。

---

## 📐 默认参数与基准算例

页面加载时默认载入官方标定测试用例：

- **相机**：M3TD 广角（传感器 9.691 × 7.278 mm，f₀ = 6.78 mm，分辨率 8064 × 6048）
- **高度 H**：60 m
- **变焦倍率**：2×
- **航向重叠度**：30%
- **旁向重叠度**：70%
- **飞行速度**：8 m/s

**手算验证过程**：
```
有效物理焦距 f = 6.78 × 2 = 13.56 mm
航向覆盖幅宽 L = 60 × 7.278 / 13.56 ≈ 32.20 m
拍照空间间距 = 32.20 × (1 − 0.30) ≈ 22.54 m
定时拍照间隔 = 22.54 / 8 ≈ 2.82 s
```
预期解算：**拍照间隔 ≈ 2.82 秒 / 张**。

---

## 🔬 物理光学解算公式

> ⚠️ **严谨提醒**：本工具严格使用**物理焦距**与**物理感光元件尺寸**。切勿混用 35mm 等效焦距或等效传感器尺寸，否则计算得出的覆盖幅宽与 GSD 误差极大。

| 参数指标 | 计算公式 | 单位 |
|---|---|---|
| 有效物理焦距 $f$ | $f = f_0 \times \text{zoom}$ | mm |
| 航向覆盖幅宽 $L$ | $L = \frac{H \times \text{sensor\_h}}{f}$ | m |
| 旁向覆盖幅宽 $W$ | $W = \frac{H \times \text{sensor\_w}}{f}$ | m |
| 航向曝光间距 | $\text{photo\_spacing} = L \times (1 - \text{fwd\_overlap})$ | m |
| 定时拍照间隔 | $\text{interval} = \frac{\text{photo\_spacing}}{\text{speed}}$ | s |
| 航线横向间距 | $\text{line\_spacing} = W \times (1 - \text{side\_overlap})$ | m |
| 地面分辨率 GSD | $\text{GSD} = \frac{H \times \text{sensor\_w} \times 100}{f \times \text{image\_w}}$ | cm/px |
| GSD 反算飞行高度 | $H_{\text{GSD}} = \frac{\text{GSD} \times f \times \text{image\_w}}{\text{sensor\_w} \times 100}$ | m |

---

## 📁 目录清单

```text
├── index.html        # 响应式静态页面结构（自适应视口、无障碍标签与语义化排版）
├── styles.css        # Claude 风格设计系统（自适应网格、触控规范、自然色彩系统）
├── app.js            # 纯前端解算引擎（内嵌全系相机库、SVG 联动、数据校验与复制简报）
├── validate.js       # 自动化测试脚本（Node 环境下可选执行，无任何 Python 依赖）
├── cameras.json      # 独立相机光学参数库参考副本
└── README.md         # 项目文档
```

---

## 🧪 自动化测试验证 (可选)

如果你安装了 Node.js，可运行：
```bash
node validate.js
```
脚本会自动验证全系相机参数完整性、M3TD 广角标定案例（2.82s 间隔）、GSD 闭环反算及静态资源完整度。
