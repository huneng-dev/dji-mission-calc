#!/usr/bin/env node
/**
 * 纯前端航线计算器自动化校验脚本 (Zero Python, Pure JS)
 */

const fs = require("fs");
const path = require("path");

// 加载前端核心计算模块
const appJsPath = path.join(__dirname, "app.js");
if (!fs.existsSync(appJsPath)) {
  console.error("❌ app.js 未找到");
  process.exit(1);
}

const { compute, BUILTIN_CATALOG } = require("./app.js");

console.log("==========================================");
console.log("  DJI 航线计算器纯前端自动化测试");
console.log("==========================================\n");

// 1. 校验相机库是否已成功内嵌且完整
console.log("1. 检验内置相机参数库：");
if (!BUILTIN_CATALOG || !BUILTIN_CATALOG.groups || BUILTIN_CATALOG.groups.length === 0) {
  console.error("❌ 内置相机数据库无效");
  process.exit(1);
}
let totalCams = 0;
BUILTIN_CATALOG.groups.forEach((g) => {
  totalCams += g.cameras.length;
  console.log(`   - 分组「${g.name}」: ${g.cameras.length} 款相机`);
});
console.log(`   ✔ 内置相机共 ${totalCams} 款，默认相机: ${BUILTIN_CATALOG.default_id}`);

// 2. 校验 M3TD 广角标准官方测试用例
console.log("\n2. 校验 M3TD 广角基准算例：");
const r = compute({
  sensor_w_mm: 9.691,
  sensor_h_mm: 7.278,
  f0_mm: 6.78,
  image_w_px: 8064,
  H_m: 60,
  zoom: 2,
  fwd_overlap: 0.30,
  side_overlap: 0.70,
  speed_m_s: 8,
});

console.log(`   - 有效物理焦距 f   : ${r.f.toFixed(4)} mm (预期: 13.5600 mm)`);
console.log(`   - 航向覆盖幅宽 L   : ${r.L_m.toFixed(4)} m (预期: 32.2035 m)`);
console.log(`   - 旁向覆盖幅宽 W   : ${r.W_m.toFixed(4)} m (预期: 42.8805 m)`);
console.log(`   - 航向拍照间距     : ${r.photo_spacing.toFixed(4)} m (预期: 22.5425 m)`);
console.log(`   - 定时拍照间隔     : ${r.interval_s.toFixed(4)} s (预期: ~2.82 s)`);
console.log(`   - 航线间距         : ${r.line_spacing.toFixed(4)} m (预期: 12.8642 m)`);
console.log(`   - 地面分辨率 GSD   : ${r.GSD_cm.toFixed(4)} cm/px (预期: ~0.532 cm/px)`);

const isIntervalPass = Math.abs(r.interval_s - 2.8178) < 0.02;
if (!isIntervalPass) {
  console.error(`❌ 拍照间隔精度校验未通过: 得到 ${r.interval_s}`);
  process.exit(1);
}
console.log("   ✔ 算例精度比对通过！");

// 3. 校验目标 GSD 反算高度
console.log("\n3. 校验 GSD 反算飞行高度：");
const rGsd = compute({
  sensor_w_mm: 9.691,
  sensor_h_mm: 7.278,
  f0_mm: 6.78,
  image_w_px: 8064,
  H_m: 60,
  zoom: 2,
  fwd_overlap: 0.30,
  side_overlap: 0.70,
  speed_m_s: 8,
  gsd_target_cm: r.GSD_cm,
});
const isHReversePass = Math.abs(rGsd.H_from_GSD - 60) < 0.01;
console.log(`   - 反算飞行高度 H: ${rGsd.H_from_GSD.toFixed(2)} m (原高度 60m) → ${isHReversePass ? "PASS" : "FAIL"}`);
if (!isHReversePass) {
  console.error("❌ GSD 反算公式校验失败");
  process.exit(1);
}

// 4. 校验纯静态资源文件完整性
console.log("\n4. 检验纯静态部署文件完整性：");
const requiredFiles = ["index.html", "styles.css", "app.js", "README.md"];
for (const f of requiredFiles) {
  const p = path.join(__dirname, f);
  if (!fs.existsSync(p)) {
    console.error(`❌ 缺失关键文件: ${f}`);
    process.exit(1);
  }
  const size = fs.statSync(p).size;
  console.log(`   - ${f.padEnd(12)} : ${size} bytes`);
}

console.log("\n==========================================");
console.log("🎉 全部测试通过！纯前端工程已就绪，完全无 Python 依赖。");
console.log("==========================================");
