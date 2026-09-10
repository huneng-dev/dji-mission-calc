/**
 * DJI 航拍航线计算器
 * 全部公式基于「物理焦距 + 物理传感器尺寸」，纯前端零依赖，无需后端与 Python，支持本地直接打开与全终端自适应。
 */

(function () {
  "use strict";

  // 内置相机参数库，彻底消除对外部 fetch() 或 Python 服务器的依赖，支持 file:// 直接双击运行
  const BUILTIN_CATALOG = {
    groups: [
      {
        name: "Mavic 3 行业系列",
        cameras: [
          {
            id: "m3td-wide",
            name: "M3TD 广角",
            sensor_w_mm: 9.691,
            sensor_h_mm: 7.278,
            f0_mm: 6.78,
            image_w_px: 8064,
            image_h_px: 6048,
            zoom_min: 1,
            zoom_max: 2,
            notes: "物理焦距 × 变焦倍率"
          },
          {
            id: "m3td-tele",
            name: "M3TD 长焦",
            sensor_w_mm: 6.4,
            sensor_h_mm: 4.8,
            f0_mm: 30,
            image_w_px: 4000,
            image_h_px: 3000,
            zoom_min: 1,
            zoom_max: 1,
            notes: "定焦长焦"
          },
          {
            id: "m3td-ir",
            name: "M3TD 红外",
            sensor_w_mm: 7.68,
            sensor_h_mm: 6.144,
            f0_mm: 9.1,
            image_w_px: 640,
            image_h_px: 512,
            zoom_min: 1,
            zoom_max: 1,
            notes: "热成像"
          },
          {
            id: "m3d-wide",
            name: "M3D/M3E 广角",
            sensor_w_mm: 17.4,
            sensor_h_mm: 13.0,
            f0_mm: 12.29,
            image_w_px: 5280,
            image_h_px: 3956,
            zoom_min: 1,
            zoom_max: 1,
            notes: "4/3 英寸机械快门"
          },
          {
            id: "m3d-tele",
            name: "M3D/M3E 长焦",
            sensor_w_mm: 6.4,
            sensor_h_mm: 4.8,
            f0_mm: 30,
            image_w_px: 4000,
            image_h_px: 3000,
            zoom_min: 1,
            zoom_max: 1,
            notes: "长焦巡检"
          }
        ]
      },
      {
        name: "Matrice 4 系列",
        cameras: [
          {
            id: "m4e-wide",
            name: "Matrice 4E/4D 广角",
            sensor_w_mm: 17.4,
            sensor_h_mm: 13.0,
            f0_mm: 12.287,
            image_w_px: 5280,
            image_h_px: 3956,
            zoom_min: 1,
            zoom_max: 1,
            notes: "高精度建图"
          },
          {
            id: "m4e-midtele",
            name: "Matrice 4E/4D 中长焦",
            sensor_w_mm: 9.69,
            sensor_h_mm: 7.27,
            f0_mm: 19.35,
            image_w_px: 8064,
            image_h_px: 6048,
            zoom_min: 1,
            zoom_max: 1,
            notes: "中长焦巡查"
          },
          {
            id: "m4e-tele",
            name: "Matrice 4E/4D 长焦",
            sensor_w_mm: 8.29,
            sensor_h_mm: 6.23,
            f0_mm: 40,
            image_w_px: 8192,
            image_h_px: 6144,
            zoom_min: 1,
            zoom_max: 1,
            notes: "超长焦精细巡检"
          },
          {
            id: "m4t-wide",
            name: "Matrice 4T/4TD 广角",
            sensor_w_mm: 9.69,
            sensor_h_mm: 7.27,
            f0_mm: 6.73,
            image_w_px: 8064,
            image_h_px: 6048,
            zoom_min: 1,
            zoom_max: 2,
            notes: "广角巡检"
          },
          {
            id: "m4t-midtele",
            name: "Matrice 4T/4TD 中长焦",
            sensor_w_mm: 9.69,
            sensor_h_mm: 7.27,
            f0_mm: 19.35,
            image_w_px: 8064,
            image_h_px: 6048,
            zoom_min: 1,
            zoom_max: 1,
            notes: "中长焦巡查"
          },
          {
            id: "m4t-tele",
            name: "Matrice 4T/4TD 长焦",
            sensor_w_mm: 8.29,
            sensor_h_mm: 6.23,
            f0_mm: 40,
            image_w_px: 8192,
            image_h_px: 6144,
            zoom_min: 1,
            zoom_max: 1,
            notes: "长焦巡查"
          },
          {
            id: "m4t-ir",
            name: "Matrice 4T/4TD 红外",
            sensor_w_mm: 7.68,
            sensor_h_mm: 6.144,
            f0_mm: 12,
            image_w_px: 640,
            image_h_px: 512,
            zoom_min: 1,
            zoom_max: 1,
            notes: "红外热成像"
          }
        ]
      },
      {
        name: "Matrice 30 系列",
        cameras: [
          {
            id: "m30-wide",
            name: "M30 广角",
            sensor_w_mm: 6.4,
            sensor_h_mm: 4.8,
            f0_mm: 4.5,
            image_w_px: 4000,
            image_h_px: 3000,
            zoom_min: 1,
            zoom_max: 1,
            notes: "定焦广角"
          },
          {
            id: "m30-zoom",
            name: "M30 变焦",
            sensor_w_mm: 6.4,
            sensor_h_mm: 4.8,
            f0_mm: 21,
            image_w_px: 4000,
            image_h_px: 3000,
            zoom_min: 1,
            zoom_max: 3.57,
            notes: "物理焦距 21–75 mm（倍率 ≈1–3.57）"
          },
          {
            id: "m30-ir",
            name: "M30 红外",
            sensor_w_mm: 7.68,
            sensor_h_mm: 6.144,
            f0_mm: 9.1,
            image_w_px: 640,
            image_h_px: 512,
            zoom_min: 1,
            zoom_max: 1,
            notes: "红外热成像"
          }
        ]
      },
      {
        name: "自定义相机",
        cameras: [
          {
            id: "custom",
            name: "自定义相机...",
            sensor_w_mm: 9.691,
            sensor_h_mm: 7.278,
            f0_mm: 6.78,
            image_w_px: 8064,
            image_h_px: 6048,
            zoom_min: 1,
            zoom_max: 10,
            notes: "手动输入传感器尺寸与物理焦距",
            custom: true
          }
        ]
      }
    ],
    default_id: "m3td-wide"
  };

  /** @type {object | null} */
  let catalog = BUILTIN_CATALOG;
  /** @type {object | null} */
  let currentCam = null;
  /** @type {object | null} */
  let lastComputed = null;

  const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);

  let els = {};

  function initElements() {
    if (typeof document === "undefined") return;
    els = {
      camera: $("camera"),
      camMeta: $("cam-meta"),
      customPanel: $("custom-panel"),
      H: $("input-H"),
      zoom: $("input-zoom"),
      fwd: $("input-fwd"),
      side: $("input-side"),
      speed: $("input-speed"),
      gsdTarget: $("input-gsd-target"),
      // custom
      sw: $("custom-sw"),
      sh: $("custom-sh"),
      f0: $("custom-f0"),
      iw: $("custom-iw"),
      ih: $("custom-ih"),
      // results
      interval: $("out-interval"),
      L: $("out-L"),
      W: $("out-W"),
      photoSpacing: $("out-photo-spacing"),
      lineSpacing: $("out-line-spacing"),
      gsd: $("out-gsd"),
      hFromGsd: $("out-h-from-gsd"),
      fEff: $("out-f"),
      hFromGsdRow: $("h-from-gsd-row"),
      error: $("error-banner"),
      copyBtn: $("copy-btn"),
      toast: $("toast"),
      canvas3D: $("view-3d"),
      btnReset3D: $("btn-reset-3d"),
      btnZoomIn: $("btn-zoom-in"),
      btnZoomOut: $("btn-zoom-out"),
      hudH: $("hud-h"),
      hudDim: $("hud-dim"),
      hudOverlap: $("hud-overlap"),
      cameraSelectContainer: $("camera-select-container"),
      customSelectTrigger: $("custom-select-trigger"),
      triggerLabel: $("trigger-label"),
      customSelectDropdown: $("custom-select-dropdown"),
      customSelectBackdrop: $("custom-select-backdrop"),
      dropdownOptions: $("dropdown-options"),
      dropdownCloseBtn: $("dropdown-close-btn"),
    };
  }

  function fmt(n, digits) {
    if (!Number.isFinite(n)) return "—";
    const d = digits ?? 2;
    return n.toLocaleString("zh-CN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: d,
    });
  }

  /**
   * 核心公式计算（纯物理光学系统）
   * @param {Object} params
   * @returns {Object}
   */
  function compute(params) {
    const {
      sensor_w_mm,
      sensor_h_mm,
      f0_mm,
      image_w_px,
      H_m,
      zoom,
      fwd_overlap, // 0–1
      side_overlap, // 0–1
      speed_m_s,
      gsd_target_cm,
    } = params;

    const f = f0_mm * zoom;
    const L_m = (H_m * sensor_h_mm) / f;
    const W_m = (H_m * sensor_w_mm) / f;
    const photo_spacing = L_m * (1 - fwd_overlap);
    const interval_s = photo_spacing / speed_m_s;
    const line_spacing = W_m * (1 - side_overlap);
    const GSD_cm = (H_m * sensor_w_mm * 100) / (f * image_w_px);
    let H_from_GSD = null;
    if (gsd_target_cm != null && gsd_target_cm > 0) {
      H_from_GSD = (gsd_target_cm * f * image_w_px) / (sensor_w_mm * 100);
    }

    return {
      f,
      L_m,
      W_m,
      photo_spacing,
      interval_s,
      line_spacing,
      GSD_cm,
      H_from_GSD,
    };
  }

  // 导出供 Node/测试环境
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { compute, BUILTIN_CATALOG };
  }

  function findCamera(id) {
    if (!catalog) return null;
    for (const g of catalog.groups) {
      for (const c of g.cameras) {
        if (c.id === id) return { ...c };
      }
    }
    return null;
  }

  function populateSelect() {
    if (!els.camera) return;
    els.camera.innerHTML = "";
    for (const g of catalog.groups) {
      const og = document.createElement("optgroup");
      og.label = g.name;
      for (const c of g.cameras) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        og.appendChild(opt);
      }
      els.camera.appendChild(og);
    }
    els.camera.value = catalog.default_id || catalog.groups[0].cameras[0].id;

    renderCustomDropdown();
  }

  function renderCustomDropdown() {
    if (!els.dropdownOptions) return;
    els.dropdownOptions.innerHTML = "";
    const activeId = els.camera ? els.camera.value : (catalog.default_id || "");

    for (const g of catalog.groups) {
      const gHead = document.createElement("div");
      gHead.className = "dropdown-group-header";
      gHead.textContent = g.name;
      els.dropdownOptions.appendChild(gHead);

      for (const c of g.cameras) {
        const item = document.createElement("div");
        item.className = `dropdown-option${c.id === activeId ? " selected" : ""}`;
        item.setAttribute("role", "option");
        item.setAttribute("data-id", c.id);
        item.setAttribute("aria-selected", c.id === activeId ? "true" : "false");

        const isZoomable = c.zoom_max && c.zoom_max > c.zoom_min;
        const zoomText = isZoomable ? `×${c.zoom_min}~${c.zoom_max}` : "1×";
        const metaSub = `${c.sensor_w_mm}×${c.sensor_h_mm}mm · f₀ ${c.f0_mm}mm · ${c.image_w_px}×${c.image_h_px} · ${zoomText}`;

        item.innerHTML = `
          <div class="option-main">
            <span class="option-name">${escapeHtml(c.name)}</span>
            <span class="option-sub">${escapeHtml(metaSub)}</span>
          </div>
          <span class="option-check">✓</span>
        `;

        item.addEventListener("click", () => {
          selectCameraById(c.id);
          closeCustomDropdown();
        });

        els.dropdownOptions.appendChild(item);
      }
    }

    updateTriggerLabel();
  }

  function selectCameraById(id) {
    if (!els.camera) return;
    els.camera.value = id;
    onCameraChange();
    updateTriggerLabel();
    updateDropdownSelectedState();
  }

  function updateTriggerLabel() {
    if (!els.triggerLabel || !currentCam) return;
    els.triggerLabel.textContent = currentCam.name;
  }

  function updateDropdownSelectedState() {
    if (!els.dropdownOptions) return;
    const activeId = els.camera ? els.camera.value : "";
    const options = els.dropdownOptions.querySelectorAll(".dropdown-option");
    options.forEach((opt) => {
      const isCur = opt.getAttribute("data-id") === activeId;
      opt.classList.toggle("selected", isCur);
      opt.setAttribute("aria-selected", isCur ? "true" : "false");
    });
  }

  function openCustomDropdown() {
    if (!els.cameraSelectContainer) return;
    els.cameraSelectContainer.classList.add("open");
    if (els.customSelectTrigger) {
      els.customSelectTrigger.setAttribute("aria-expanded", "true");
    }
  }

  function closeCustomDropdown() {
    if (!els.cameraSelectContainer) return;
    els.cameraSelectContainer.classList.remove("open");
    if (els.customSelectTrigger) {
      els.customSelectTrigger.setAttribute("aria-expanded", "false");
    }
  }

  function toggleCustomDropdown() {
    if (!els.cameraSelectContainer) return;
    const isOpen = els.cameraSelectContainer.classList.contains("open");
    if (isOpen) {
      closeCustomDropdown();
    } else {
      openCustomDropdown();
    }
  }

  function renderCamMeta(cam) {
    if (!els.camMeta) return;
    const chips = [
      `传感器 ${cam.sensor_w_mm} × ${cam.sensor_h_mm} mm`,
      `基础物理焦距 f₀ = ${cam.f0_mm} mm`,
      `分辨率 ${cam.image_w_px} × ${cam.image_h_px}`,
    ];
    if (cam.zoom_max && cam.zoom_max > cam.zoom_min) {
      if (cam.id === "m30-zoom") {
        chips.push(`机械光学连续变焦 ×${cam.zoom_min} ~ ×${cam.zoom_max}`);
      } else {
        chips.push(`数码裁切变焦 ×${cam.zoom_min} ~ ×${cam.zoom_max}`);
      }
    } else {
      chips.push("定焦镜头 (1×)");
    }
    if (cam.notes) chips.push(cam.notes);
    els.camMeta.innerHTML = chips
      .map((t) => `<span class="chip">${escapeHtml(t)}</span>`)
      .join("");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function syncCustomPanel(cam) {
    if (!els.customPanel) return;
    const isCustom = !!(cam && cam.custom);
    els.customPanel.classList.toggle("visible", isCustom);
    if (isCustom) {
      els.sw.value = cam.sensor_w_mm;
      els.sh.value = cam.sensor_h_mm;
      els.f0.value = cam.f0_mm;
      els.iw.value = cam.image_w_px;
      els.ih.value = cam.image_h_px;
    }
  }

  function num(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : NaN;
  }

  function getCameraParams() {
    let cam = currentCam;
    if (!cam) return null;
    if (cam.custom) {
      cam = {
        ...cam,
        sensor_w_mm: num(els.sw.value),
        sensor_h_mm: num(els.sh.value),
        f0_mm: num(els.f0.value),
        image_w_px: num(els.iw.value),
        image_h_px: num(els.ih.value),
      };
    }
    return cam;
  }

  function readInputs() {
    const cam = getCameraParams();
    if (!cam) return null;

    const H_m = num(els.H.value);
    const zoom = num(els.zoom.value);
    const fwd = num(els.fwd.value);
    const side = num(els.side.value);
    const speed_m_s = num(els.speed.value);
    const gsdRaw = els.gsdTarget.value ? els.gsdTarget.value.trim() : "";
    const gsd_target_cm = gsdRaw === "" ? null : num(gsdRaw);

    return {
      cam,
      H_m,
      zoom,
      fwd_overlap: fwd / 100,
      side_overlap: side / 100,
      speed_m_s,
      gsd_target_cm,
      fwd,
      side,
    };
  }

  function validate(p) {
    if (!p) return "相机数据未就绪";
    const { cam, H_m, zoom, fwd, side, speed_m_s, gsd_target_cm } = p;
    if (
      !(
        cam.sensor_w_mm > 0 &&
        cam.sensor_h_mm > 0 &&
        cam.f0_mm > 0 &&
        cam.image_w_px > 0
      )
    ) {
      return "传感器尺寸、物理焦距及图像像素须为大于 0 的数值";
    }
    if (!(H_m > 0)) return "飞行高度须大于 0 米";
    if (!(zoom > 0)) return "变焦倍率须大于 0";
    if (!(fwd >= 0 && fwd < 100)) return "航向重叠度须在 0% ~ 99.9% 之间";
    if (!(side >= 0 && side < 100)) return "旁向重叠度须在 0% ~ 99.9% 之间";
    if (!(speed_m_s > 0)) return "飞行速度须大于 0 m/s";
    if (gsd_target_cm != null && !(gsd_target_cm > 0)) {
      return "目标 GSD 须为正数（或保持留空）";
    }
    return null;
  }

  const viewer3D = {
    canvas: null,
    ctx: null,
    yaw: 0.82,
    pitch: 0.48,
    zoom: 1.0,
    cssW: 480,
    cssH: 340,
    dpr: 1,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    vx: 0,
    vy: 0,
    pointers: new Map(),
    initialPinchDist: 0,
    initialPinchZoom: 1.0,
    currentMode: "orbit",
    inertiaId: null,
    animId: null,
  };

  function init3DViewer() {
    if (!els.canvas3D) return;
    viewer3D.canvas = els.canvas3D;
    viewer3D.ctx = viewer3D.canvas.getContext("2d");

    function resizeCanvas() {
      if (!viewer3D.canvas) return;
      const rect = viewer3D.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      viewer3D.cssW = Math.max(100, Math.floor(rect.width));
      viewer3D.cssH = Math.max(100, Math.floor(rect.height));
      viewer3D.dpr = dpr;
      viewer3D.canvas.width = Math.round(viewer3D.cssW * dpr);
      viewer3D.canvas.height = Math.round(viewer3D.cssH * dpr);
      if (lastComputed) {
        draw3DScene(lastComputed.r, lastComputed.p);
      }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const cvs = viewer3D.canvas;
    cvs.addEventListener("pointerdown", (e) => {
      cvs.setPointerCapture(e.pointerId);
      viewer3D.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (viewer3D.inertiaId) {
        cancelAnimationFrame(viewer3D.inertiaId);
        viewer3D.inertiaId = null;
      }
      if (viewer3D.animId) {
        cancelAnimationFrame(viewer3D.animId);
        viewer3D.animId = null;
      }
      if (viewer3D.pointers.size === 1) {
        viewer3D.isDragging = true;
        viewer3D.lastX = e.clientX;
        viewer3D.lastY = e.clientY;
        viewer3D.vx = 0;
        viewer3D.vy = 0;
      } else if (viewer3D.pointers.size === 2) {
        viewer3D.isDragging = false;
        const pts = Array.from(viewer3D.pointers.values());
        viewer3D.initialPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        viewer3D.initialPinchZoom = viewer3D.zoom;
      }
    });

    cvs.addEventListener("pointermove", (e) => {
      if (!viewer3D.pointers.has(e.pointerId)) return;
      viewer3D.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (viewer3D.pointers.size === 1 && viewer3D.isDragging) {
        const dx = e.clientX - viewer3D.lastX;
        const dy = e.clientY - viewer3D.lastY;
        viewer3D.lastX = e.clientX;
        viewer3D.lastY = e.clientY;

        const deltaYaw = dx * 0.007;
        const deltaPitch = dy * 0.007;
        viewer3D.vx = deltaYaw;
        viewer3D.vy = deltaPitch;

        viewer3D.yaw += deltaYaw;
        viewer3D.pitch = Math.max(0.06, Math.min(1.52, viewer3D.pitch - deltaPitch));
        viewer3D.currentMode = "orbit";
        updateModeButtons();
        if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);
      } else if (viewer3D.pointers.size === 2) {
        const pts = Array.from(viewer3D.pointers.values());
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (viewer3D.initialPinchDist > 0) {
          const factor = dist / viewer3D.initialPinchDist;
          viewer3D.zoom = Math.max(0.55, Math.min(2.8, viewer3D.initialPinchZoom * factor));
          if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);
        }
      }
    });

    function endPointer(e) {
      viewer3D.pointers.delete(e.pointerId);
      if (viewer3D.pointers.size < 2) {
        viewer3D.initialPinchDist = 0;
      }
      if (viewer3D.pointers.size === 1) {
        const pt = Array.from(viewer3D.pointers.values())[0];
        viewer3D.isDragging = true;
        viewer3D.lastX = pt.x;
        viewer3D.lastY = pt.y;
      } else if (viewer3D.pointers.size === 0) {
        viewer3D.isDragging = false;
        startInertia();
      }
    }

    cvs.addEventListener("pointerup", endPointer);
    cvs.addEventListener("pointercancel", endPointer);

    cvs.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      viewer3D.zoom = Math.max(0.55, Math.min(2.8, viewer3D.zoom * factor));
      if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);
    }, { passive: false });

    function startInertia() {
      if (viewer3D.inertiaId) cancelAnimationFrame(viewer3D.inertiaId);
      function step() {
        if (Math.abs(viewer3D.vx) > 0.0002 || Math.abs(viewer3D.vy) > 0.0002) {
          viewer3D.yaw += viewer3D.vx;
          viewer3D.pitch = Math.max(0.06, Math.min(1.52, viewer3D.pitch - viewer3D.vy));
          viewer3D.vx *= 0.91;
          viewer3D.vy *= 0.91;
          if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);
          viewer3D.inertiaId = requestAnimationFrame(step);
        } else {
          viewer3D.vx = 0;
          viewer3D.vy = 0;
          viewer3D.inertiaId = null;
        }
      }
      viewer3D.inertiaId = requestAnimationFrame(step);
    }

    document.querySelectorAll(".view-btn[data-view]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const view = e.currentTarget.getAttribute("data-view");
        setViewMode(view);
      });
    });

    if (els.btnReset3D) {
      els.btnReset3D.addEventListener("click", () => {
        smoothAnimateTo(0.82, 0.48, 1.0, "orbit");
      });
    }

    if (els.btnZoomIn) {
      els.btnZoomIn.addEventListener("click", () => {
        viewer3D.zoom = Math.min(2.8, viewer3D.zoom * 1.15);
        if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);
      });
    }

    if (els.btnZoomOut) {
      els.btnZoomOut.addEventListener("click", () => {
        viewer3D.zoom = Math.max(0.55, viewer3D.zoom * 0.87);
        if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);
      });
    }
  }

  function setViewMode(mode) {
    if (mode === "top") {
      smoothAnimateTo(0, 1.54, viewer3D.zoom, "top");
    } else if (mode === "side") {
      smoothAnimateTo(Math.PI * 0.5, 0.08, viewer3D.zoom, "side");
    } else {
      smoothAnimateTo(0.82, 0.48, viewer3D.zoom, "orbit");
    }
  }

  function smoothAnimateTo(targetYaw, targetPitch, targetZoom, mode) {
    if (viewer3D.inertiaId) cancelAnimationFrame(viewer3D.inertiaId);
    if (viewer3D.animId) cancelAnimationFrame(viewer3D.animId);

    viewer3D.currentMode = mode;
    updateModeButtons();

    let frames = 0;
    const totalFrames = 18;
    const startYaw = viewer3D.yaw;
    const startPitch = viewer3D.pitch;
    const startZoom = viewer3D.zoom;

    function anim() {
      frames++;
      const t = frames / totalFrames;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      viewer3D.yaw = startYaw + (targetYaw - startYaw) * ease;
      viewer3D.pitch = startPitch + (targetPitch - startPitch) * ease;
      viewer3D.zoom = startZoom + (targetZoom - startZoom) * ease;

      if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);

      if (frames < totalFrames) {
        viewer3D.animId = requestAnimationFrame(anim);
      } else {
        viewer3D.yaw = targetYaw;
        viewer3D.pitch = targetPitch;
        viewer3D.zoom = targetZoom;
        viewer3D.animId = null;
        if (lastComputed) draw3DScene(lastComputed.r, lastComputed.p);
      }
    }
    viewer3D.animId = requestAnimationFrame(anim);
  }

  function updateModeButtons() {
    document.querySelectorAll(".view-btn[data-view]").forEach((btn) => {
      const v = btn.getAttribute("data-view");
      btn.classList.toggle("active", v === viewer3D.currentMode);
    });
  }

  function draw3DScene(r, p) {
    if (!viewer3D.canvas || !viewer3D.ctx) return;
    const ctx = viewer3D.ctx;
    const dpr = viewer3D.dpr || 1;
    const cw = viewer3D.cssW || 480;
    const ch = viewer3D.cssH || 340;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);

    const H = p.H_m;
    const W = r.W_m;
    const L = r.L_m;
    const fwd = p.fwd_overlap;
    const side = p.side_overlap;
    const photoSpacing = r.photo_spacing;
    const lineSpacing = r.line_spacing;

    if (els.hudH) els.hudH.textContent = `H ${H.toFixed(1)}m`;
    if (els.hudDim) els.hudDim.textContent = `幅宽 ${W.toFixed(1)}×${L.toFixed(1)}m`;
    if (els.hudOverlap) els.hudOverlap.textContent = `重叠 ${(fwd * 100).toFixed(0)}% / ${(side * 100).toFixed(0)}%`;

    const maxDim = Math.max(H, W * 1.5, L * 2, 20);
    const sceneScale = 140 / maxDim;

    const Hs = H * sceneScale;
    const Ws = W * sceneScale;
    const Ls = L * sceneScale;
    const dZs = photoSpacing * sceneScale;
    const dXs = lineSpacing * sceneScale;

    const target = { x: dXs * 0.15, y: Hs * 0.45, z: dZs * 0.25 };
    const dist = 340 / viewer3D.zoom;

    const alpha = viewer3D.yaw;
    const beta = viewer3D.pitch;

    const camX = target.x + dist * Math.cos(beta) * Math.sin(alpha);
    const camY = target.y + dist * Math.sin(beta);
    const camZ = target.z + dist * Math.cos(beta) * Math.cos(alpha);

    let fx = target.x - camX, fy = target.y - camY, fz = target.z - camZ;
    const flen = Math.hypot(fx, fy, fz) || 1;
    fx /= flen; fy /= flen; fz /= flen;

    let rx = -fz, rz = fx;
    const rlen = Math.hypot(rx, rz) || 1;
    rx /= rlen; rz /= rlen;

    const ux = -rz * fy;
    const uy = rz * fx - rx * fz;
    const uz = rx * fy;

    function project(x, y, z) {
      const vx = x - camX, vy = y - camY, vz = z - camZ;
      const xc = vx * rx + vz * rz;
      const yc = vx * ux + vy * uy + vz * uz;
      const zc = vx * fx + vy * fy + vz * fz;
      if (zc <= 0.1) return null;
      const fov = 380;
      return {
        x: cw * 0.5 + (xc / zc) * fov,
        y: ch * 0.5 - (yc / zc) * fov,
        zc: zc,
      };
    }

    const gridExtent = Math.max(Ws * 1.8, Ls * 2.2, 70);
    const gridStep = gridExtent / 6;
    ctx.strokeStyle = "rgba(225, 218, 206, 0.75)";
    ctx.lineWidth = 1;
    for (let gx = -gridExtent; gx <= gridExtent; gx += gridStep) {
      const p1 = project(gx, 0, -gridExtent);
      const p2 = project(gx, 0, gridExtent);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    for (let gz = -gridExtent; gz <= gridExtent; gz += gridStep) {
      const p1 = project(-gridExtent, 0, gz);
      const p2 = project(gridExtent, 0, gz);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }

    const flightArr1 = project(0, 0, -gridExtent * 0.55);
    const flightArr2 = project(0, 0, gridExtent * 0.8);
    if (flightArr1 && flightArr2) {
      ctx.strokeStyle = "#999388";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(flightArr1.x, flightArr1.y);
      ctx.lineTo(flightArr2.x, flightArr2.y);
      ctx.stroke();
      ctx.setLineDash([]);
      drawBillboardText(ctx, "航线 (+Z)", flightArr2.x, flightArr2.y - 8, "#8A847B", 10.5);
    }

    const l2p1 = project(dXs - Ws * 0.5, 0, -Ls * 0.5);
    const l2p2 = project(dXs + Ws * 0.5, 0, -Ls * 0.5);
    const l2p3 = project(dXs + Ws * 0.5, 0, Ls * 0.5);
    const l2p4 = project(dXs - Ws * 0.5, 0, Ls * 0.5);
    if (l2p1 && l2p2 && l2p3 && l2p4) {
      ctx.strokeStyle = "rgba(71, 108, 94, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(l2p1.x, l2p1.y);
      ctx.lineTo(l2p2.x, l2p2.y);
      ctx.lineTo(l2p3.x, l2p3.y);
      ctx.lineTo(l2p4.x, l2p4.y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (dXs < Ws) {
      const so1 = project(dXs - Ws * 0.5, 0, -Ls * 0.5);
      const so2 = project(Ws * 0.5, 0, -Ls * 0.5);
      const so3 = project(Ws * 0.5, 0, Ls * 0.5);
      const so4 = project(dXs - Ws * 0.5, 0, Ls * 0.5);
      if (so1 && so2 && so3 && so4) {
        ctx.fillStyle = "rgba(71, 108, 94, 0.15)";
        ctx.beginPath();
        ctx.moveTo(so1.x, so1.y);
        ctx.lineTo(so2.x, so2.y);
        ctx.lineTo(so3.x, so3.y);
        ctx.lineTo(so4.x, so4.y);
        ctx.closePath();
        ctx.fill();
        const midSO = project(dXs * 0.5, 0, 0);
        if (midSO) {
          drawBadge(ctx, `旁向 ${(side * 100).toFixed(0)}% (${lineSpacing.toFixed(1)}m)`, midSO.x, midSO.y, "#234D3A", "rgba(235, 246, 240, 0.94)", 10.5);
        }
      }
    }

    const n2p1 = project(-Ws * 0.5, 0, dZs - Ls * 0.5);
    const n2p2 = project(Ws * 0.5, 0, dZs - Ls * 0.5);
    const n2p3 = project(Ws * 0.5, 0, dZs + Ls * 0.5);
    const n2p4 = project(-Ws * 0.5, 0, dZs + Ls * 0.5);
    if (n2p1 && n2p2 && n2p3 && n2p4) {
      ctx.strokeStyle = "rgba(180, 100, 70, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(n2p1.x, n2p1.y);
      ctx.lineTo(n2p2.x, n2p2.y);
      ctx.lineTo(n2p3.x, n2p3.y);
      ctx.lineTo(n2p4.x, n2p4.y);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (dZs < Ls) {
      const fo1 = project(-Ws * 0.5, 0, dZs - Ls * 0.5);
      const fo2 = project(Ws * 0.5, 0, dZs - Ls * 0.5);
      const fo3 = project(Ws * 0.5, 0, Ls * 0.5);
      const fo4 = project(-Ws * 0.5, 0, Ls * 0.5);
      if (fo1 && fo2 && fo3 && fo4) {
        ctx.fillStyle = "rgba(217, 119, 87, 0.22)";
        ctx.beginPath();
        ctx.moveTo(fo1.x, fo1.y);
        ctx.lineTo(fo2.x, fo2.y);
        ctx.lineTo(fo3.x, fo3.y);
        ctx.lineTo(fo4.x, fo4.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(217, 119, 87, 0.75)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const midFO = project(0, 0, dZs * 0.5);
        if (midFO) {
          drawBadge(ctx, `航向 ${(fwd * 100).toFixed(0)}% (${photoSpacing.toFixed(1)}m)`, midFO.x, midFO.y, "#9E3C1E", "rgba(254, 242, 237, 0.94)", 10.5);
        }
      }
    }

    const c1 = project(-Ws * 0.5, 0, -Ls * 0.5);
    const c2 = project(Ws * 0.5, 0, -Ls * 0.5);
    const c3 = project(Ws * 0.5, 0, Ls * 0.5);
    const c4 = project(-Ws * 0.5, 0, Ls * 0.5);
    const apex = project(0, Hs, 0);

    if (c1 && c2 && c3 && c4) {
      ctx.fillStyle = "rgba(217, 119, 87, 0.1)";
      ctx.beginPath();
      ctx.moveTo(c1.x, c1.y);
      ctx.lineTo(c2.x, c2.y);
      ctx.lineTo(c3.x, c3.y);
      ctx.lineTo(c4.x, c4.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#D97757";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const midFront = project(0, 0, Ls * 0.5);
      if (midFront) {
        drawBadge(ctx, `W: ${W.toFixed(1)}m`, midFront.x, midFront.y + 11, "#C46444", "rgba(255, 255, 255, 0.92)", 11);
      }
      const midSide = project(Ws * 0.5, 0, 0);
      if (midSide) {
        drawBadge(ctx, `L: ${L.toFixed(1)}m`, midSide.x + 20, midSide.y, "#C46444", "rgba(255, 255, 255, 0.92)", 11);
      }
    }

    if (apex && c1 && c2 && c3 && c4) {
      const faces = [
        { pts: [apex, c1, c2], depth: (apex.zc + c1.zc + c2.zc) / 3 },
        { pts: [apex, c2, c3], depth: (apex.zc + c2.zc + c3.zc) / 3 },
        { pts: [apex, c3, c4], depth: (apex.zc + c3.zc + c4.zc) / 3 },
        { pts: [apex, c4, c1], depth: (apex.zc + c4.zc + c1.zc) / 3 },
      ];
      faces.sort((a, b) => b.depth - a.depth);

      faces.forEach((face) => {
        ctx.fillStyle = "rgba(217, 119, 87, 0.05)";
        ctx.beginPath();
        ctx.moveTo(face.pts[0].x, face.pts[0].y);
        ctx.lineTo(face.pts[1].x, face.pts[1].y);
        ctx.lineTo(face.pts[2].x, face.pts[2].y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(217, 119, 87, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    const groundOrigin = project(0, 0, 0);
    if (apex && groundOrigin) {
      ctx.strokeStyle = "#8A847B";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(groundOrigin.x, groundOrigin.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const midH = project(0, Hs * 0.5, 0);
      if (midH) {
        drawBadge(ctx, `H: ${H.toFixed(1)}m`, midH.x - 24, midH.y, "#2B2824", "rgba(255, 255, 255, 0.92)", 11);
      }
    }

    drawDroneModel(ctx, project, Hs);
  }

  function drawDroneModel(ctx, project, Hs) {
    const center = project(0, Hs, 0);
    if (!center) return;

    const armLen = 3.6;
    const armPts = [
      project(-armLen, Hs, -armLen),
      project(armLen, Hs, -armLen),
      project(armLen, Hs, armLen),
      project(-armLen, Hs, armLen),
    ];

    ctx.strokeStyle = "#24211D";
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    armPts.forEach((pt) => {
      if (pt) {
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
    });

    armPts.forEach((pt) => {
      if (pt) {
        ctx.fillStyle = "rgba(142, 135, 126, 0.35)";
        ctx.beginPath();
        ctx.ellipse(pt.x, pt.y, 3.4, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#24211D";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = "#D97757";
    ctx.beginPath();
    ctx.arc(center.x, center.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.stroke();

    const nose = project(0, Hs, armLen * 0.85);
    if (nose) {
      ctx.fillStyle = "#2D5444";
      ctx.beginPath();
      ctx.arc(nose.x, nose.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawBillboardText(ctx, text, x, y, color, size, bold) {
    ctx.font = `${bold ? "600" : "500"} ${size || 11}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = color || "#24211D";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function drawBadge(ctx, text, x, y, textColor, bgColor, fontSize) {
    const fSize = fontSize || 11;
    ctx.font = `500 ${fSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const metrics = ctx.measureText(text);
    const padX = 6;
    const padY = 3;
    const w = metrics.width + padX * 2;
    const h = fSize + padY * 2 + 1;

    ctx.save();
    ctx.fillStyle = bgColor || "rgba(255, 255, 255, 0.92)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x - w * 0.5, y - h * 0.5, w, h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = textColor || "#24211D";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  }

  function render() {
    const p = readInputs();
    const err = validate(p);
    if (err) {
      if (els.error) {
        els.error.style.display = "block";
        els.error.textContent = err;
      }
      return;
    }
    if (els.error) {
      els.error.style.display = "none";
    }

    const r = compute({
      sensor_w_mm: p.cam.sensor_w_mm,
      sensor_h_mm: p.cam.sensor_h_mm,
      f0_mm: p.cam.f0_mm,
      image_w_px: p.cam.image_w_px,
      H_m: p.H_m,
      zoom: p.zoom,
      fwd_overlap: p.fwd_overlap,
      side_overlap: p.side_overlap,
      speed_m_s: p.speed_m_s,
      gsd_target_cm: p.gsd_target_cm,
    });

    lastComputed = { r, p };

    if (els.interval) els.interval.textContent = fmt(r.interval_s, 2);
    if (els.L) els.L.textContent = fmt(r.L_m, 2);
    if (els.W) els.W.textContent = fmt(r.W_m, 2);
    if (els.photoSpacing) els.photoSpacing.textContent = fmt(r.photo_spacing, 2);
    if (els.lineSpacing) els.lineSpacing.textContent = fmt(r.line_spacing, 2);
    if (els.gsd) els.gsd.textContent = fmt(r.GSD_cm, 3);
    if (els.fEff) els.fEff.textContent = fmt(r.f, 3);

    if (els.hFromGsdRow) {
      if (r.H_from_GSD != null) {
        if (els.hFromGsd) els.hFromGsd.textContent = fmt(r.H_from_GSD, 2);
        els.hFromGsdRow.style.display = "";
      } else {
        if (els.hFromGsd) els.hFromGsd.textContent = "—";
        els.hFromGsdRow.style.display = "none";
      }
    }

    draw3DScene(r, p);
  }

  function onCameraChange() {
    if (!els.camera) return;
    currentCam = findCamera(els.camera.value);
    if (!currentCam) return;
    renderCamMeta(currentCam);
    syncCustomPanel(currentCam);
    updateTriggerLabel();
    updateDropdownSelectedState();

    // 变焦范围适配
    if (currentCam.zoom_min != null) {
      if (
        num(els.zoom.value) < currentCam.zoom_min ||
        (currentCam.zoom_max && num(els.zoom.value) > currentCam.zoom_max * 1.05)
      ) {
        els.zoom.value =
          currentCam.zoom_min === 1 && currentCam.zoom_max === 1
            ? 1
            : Math.min(2, currentCam.zoom_max);
      }
      els.zoom.min = currentCam.zoom_min;
      if (currentCam.zoom_max) els.zoom.max = currentCam.zoom_max * 2;
    }

    render();
  }

  function showToast(msg) {
    if (!els.toast) return;
    els.toast.textContent = msg;
    els.toast.classList.add("visible");
    setTimeout(() => {
      els.toast.classList.remove("visible");
    }, 2400);
  }

  function copyMissionReport() {
    if (!lastComputed) return;
    const { r, p } = lastComputed;
    const text = [
      "【DJI 航拍任务规划简报】",
      `· 选定相机：${p.cam.name} (物理焦距 f₀=${p.cam.f0_mm}mm, 变焦×${p.zoom}, 等效物理焦距 f=${fmt(r.f, 2)}mm)`,
      `· 航行参数：飞行高度 H=${fmt(p.H_m, 1)}m | 飞行速度 v=${fmt(p.speed_m_s, 1)}m/s`,
      `· 重叠设置：航向重叠 ${p.fwd}% | 旁向重叠 ${p.side}%`,
      "———————————————",
      `· 拍照间隔：${fmt(r.interval_s, 2)} 秒/张`,
      `· 拍照间距：${fmt(r.photo_spacing, 2)} 米`,
      `· 航线间距：${fmt(r.line_spacing, 2)} 米`,
      `· 航向覆盖幅宽 (L)：${fmt(r.L_m, 2)} 米`,
      `· 旁向覆盖幅宽 (W)：${fmt(r.W_m, 2)} 米`,
      `· 地面分辨率 (GSD)：${fmt(r.GSD_cm, 3)} cm/px`,
      r.H_from_GSD != null ? `· 目标 GSD(${p.gsd_target_cm}cm) 反算高度：${fmt(r.H_from_GSD, 2)} 米` : "",
      "———————————————",
      "注：本计算严格基于真实物理传感器与焦距，切勿与 35mm 等效焦距混淆。"
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("已成功复制规划简报到剪贴板");
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      showToast("已成功复制规划简报");
    } catch (e) {
      showToast("复制失败，请手动记录");
    }
    document.body.removeChild(ta);
  }

  function bindEvents() {
    const inputs = [
      els.camera,
      els.H,
      els.zoom,
      els.fwd,
      els.side,
      els.speed,
      els.gsdTarget,
      els.sw,
      els.sh,
      els.f0,
      els.iw,
      els.ih,
    ];

    inputs.forEach((el) => {
      if (!el) return;
      el.addEventListener("input", () => {
        if (el === els.camera) onCameraChange();
        else render();
      });
      el.addEventListener("change", () => {
        if (el === els.camera) onCameraChange();
        else render();
      });
    });

    if (els.copyBtn) {
      els.copyBtn.addEventListener("click", copyMissionReport);
    }

    if (els.customSelectTrigger) {
      els.customSelectTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCustomDropdown();
      });
    }

    if (els.customSelectBackdrop) {
      els.customSelectBackdrop.addEventListener("click", () => {
        closeCustomDropdown();
      });
    }

    if (els.dropdownCloseBtn) {
      els.dropdownCloseBtn.addEventListener("click", () => {
        closeCustomDropdown();
      });
    }

    document.addEventListener("click", (e) => {
      if (!els.cameraSelectContainer) return;
      if (!els.cameraSelectContainer.contains(e.target)) {
        closeCustomDropdown();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeCustomDropdown();
      }
    });
  }

  function init() {
    initElements();
    init3DViewer();
    // 优先使用同步内嵌数据，无网络延迟、无 CORS 报错，完美支持任何静态环境与本地 file://
    catalog = BUILTIN_CATALOG;
    populateSelect();
    bindEvents();
    onCameraChange();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }
})();
