import { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { entryTotal, fmtDate } from "../data/store";
import styles from "./StatsTab.module.css";

const COLORS = [
  "#1a56db","#e35d3a","#16a34a","#b45309","#7c3aed",
  "#0891b2","#be185d","#65a30d","#0369a1","#9333ea",
];

const TABS = [
  { id: "overview", label: "Огляд" },
  { id: "places",   label: "Місця" },
  { id: "top",      label: "Топ витрат" },
];

// Повертає дату N днів тому у форматі YYYY-MM-DD
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function StatsTab({ data }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [panelKey, setPanelKey]           = useState(0);

  // ── Глобальний діапазон дат ──────────────────────────────────────────
  const allDates = [...new Set(data.map((e) => e.date))].sort();
  const minDate  = allDates[0]  ?? "";
  const maxDate  = allDates[allDates.length - 1] ?? "";

  const [range, setRange]       = useState([0, 1]); // [0..1] для скролера
  const [activePreset, setActivePreset] = useState("all");
  const sliderRef = useRef(null);
  const dragRef   = useRef(null);

  // Перетворення range → дати
  const fromDate = allDates[Math.floor(range[0] * (allDates.length - 1))] ?? minDate;
  const toDate   = allDates[Math.floor(range[1] * (allDates.length - 1))] ?? maxDate;

  // Застосувати пресет
  function applyPreset(preset) {
    setActivePreset(preset);
    if (preset === "all" || allDates.length === 0) { setRange([0, 1]); return; }
    const cutoff = {
      "7d":  daysAgo(7),
      "1m":  daysAgo(30),
      "3m":  daysAgo(90),
      "1y":  daysAgo(365),
    }[preset];
    const firstIdx = allDates.findIndex((d) => d >= cutoff);
    const left = firstIdx < 0 ? 0 : firstIdx / (allDates.length - 1);
    setRange([Math.min(left, 1), 1]);
  }

  // Якщо range змінено вручну — знімаємо пресет
  function handleRangeDrag(newRange) {
    setRange(newRange);
    setActivePreset(null);
  }

  // ── Дані ────────────────────────────────────────────────────────────
  const filteredData = data.filter((e) => e.date >= fromDate && e.date <= toDate);

  const total = filteredData.reduce((s, e) => s + entryTotal(e), 0);
  const avg   = filteredData.length ? total / filteredData.length : 0;
  const max   = filteredData.length ? Math.max(...filteredData.map((e) => entryTotal(e))) : 0;
  const days  = [...new Set(filteredData.map((e) => e.date))].length;

  // placeTotals/placeCount відносно filteredData (реагують на діапазон)
  const placeTotals = {};
  const placeCount  = {};
  filteredData.forEach((e) =>
    e.places.forEach((p) => {
      placeTotals[p.name] = (placeTotals[p.name] || 0) + Number(p.amount || 0);
      placeCount[p.name]  = (placeCount[p.name]  || 0) + 1;
    })
  );
  const allPlaceNames = Object.keys(placeTotals).sort((a, b) => placeTotals[b] - placeTotals[a]);

  const [selectedPlace, setSelectedPlace] = useState(null);

  const placeTransactions = selectedPlace
    ? filteredData
        .flatMap((entry) =>
          entry.places
            .filter((p) => p.name === selectedPlace)
            .map((p) => ({ ...p, date: entry.date, entryId: entry.id }))
        )
        .sort((a, b) => (a.date < b.date ? 1 : -1))
    : [];
  const placeTotal = placeTransactions.reduce((s, p) => s + Number(p.amount || 0), 0);
  const placeAvg   = placeTransactions.length ? placeTotal / placeTransactions.length : 0;

  const sp = Object.entries(placeTotals).sort((a, b) => b[1] - a[1]);
  const mv = sp[0]?.[1] || 1;
  const sf = Object.entries(placeCount).sort((a, b) => b[1] - a[1]);
  const mf = sf[0]?.[1] || 1;

  // ── Canvas refs ──────────────────────────────────────────────────────
  const timelineRef = useRef(null);
  const donutRef    = useRef(null);
  const pointsRef   = useRef([]);
  const [tooltip, setTooltip] = useState(null);

  function switchSection(id) {
    if (id === activeSection) return;
    setActiveSection(id);
    setPanelKey((k) => k + 1);
  }

  // ── Slider mouse events ─────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      handleRangeDrag(
        dragRef.current === "left"
          ? [Math.min(x, range[1] - 0.01), range[1]]
          : [range[0], Math.max(x, range[0] + 0.01)]
      );
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [range]);

  // ── Donut ────────────────────────────────────────────────────────────
  useEffect(() => {
    const dc = donutRef.current;
    if (!dc || !sp.length) return;
    const dctx = dc.getContext("2d");
    const cx = 60, cy = 60, r = 52, inn = 28;
    dctx.clearRect(0, 0, 120, 120);
    const tot2 = sp.reduce((s, [, v]) => s + v, 0);
    let ang = -Math.PI / 2;
    sp.forEach(([, v], i) => {
      const slice = (v / tot2) * Math.PI * 2;
      dctx.beginPath(); dctx.moveTo(cx, cy);
      dctx.arc(cx, cy, r, ang, ang + slice);
      dctx.closePath();
      dctx.fillStyle = COLORS[i % COLORS.length]; dctx.fill();
      ang += slice;
    });
    dctx.beginPath(); dctx.arc(cx, cy, inn, 0, Math.PI * 2);
    dctx.fillStyle = "#fff"; dctx.fill();
  }, [filteredData, activeSection]);

  // ── Timeline canvas ──────────────────────────────────────────────────
  const drawTimeline = useCallback(() => {
    const canvas = timelineRef.current;
    if (!canvas) return;
    const W = canvas.parentElement.offsetWidth - 2;
    const H = 160;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const byDate = {};
    filteredData.forEach((entry) => {
      byDate[entry.date] = {
        total: (byDate[entry.date]?.total || 0) + entryTotal(entry),
        entries: [...(byDate[entry.date]?.entries || []), entry],
      };
    });
    const dates = Object.keys(byDate).sort();
    const vals  = dates.map((d) => byDate[d].total);
    const maxV  = Math.max(...vals) || 1;
    const pad   = { l: 46, r: 10, t: 10, b: 28 };
    const W2 = W - pad.l - pad.r, H2 = H - pad.t - pad.b;
    ctx.clearRect(0, 0, W, H);
    ctx.font = "10px DM Mono, monospace";
    [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
      const y = pad.t + H2 * (1 - t);
      ctx.strokeStyle = "#e4e6ea"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      ctx.fillStyle = "#9ca3af"; ctx.textAlign = "right";
      ctx.fillText(Math.round(maxV * t) + "zł", pad.l - 4, y + 4);
    });
    if (!dates.length) { pointsRef.current = []; return; }
    const pts = dates.map((date, i) => ({
      date, total: byDate[date].total, entries: byDate[date].entries,
      x: pad.l + (dates.length > 1 ? i / (dates.length - 1) : 0.5) * W2,
      y: pad.t + H2 * (1 - vals[i] / maxV),
    }));
    pointsRef.current = pts;
    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
    grad.addColorStop(0, "rgba(26,86,219,0.13)"); grad.addColorStop(1, "rgba(26,86,219,0)");
    ctx.beginPath(); ctx.moveTo(pts[0].x, H - pad.b);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, H - pad.b); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.strokeStyle = "#1a56db"; ctx.lineWidth = 1.5;
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
    pts.forEach((p) => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.strokeStyle = "#1a56db"; ctx.lineWidth = 1.5; ctx.stroke();
    });
    const step = Math.ceil(dates.length / 9);
    ctx.fillStyle = "#9ca3af"; ctx.font = "9px DM Mono, monospace"; ctx.textAlign = "center";
    pts.forEach((p, i) => { if (i % step === 0 || i === dates.length - 1) ctx.fillText(fmtDate(dates[i]), p.x, H - 6); });
  }, [filteredData]);

  useEffect(() => {
    drawTimeline();
    const ro = new ResizeObserver(drawTimeline);
    const canvas = timelineRef.current;
    if (canvas?.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [drawTimeline]);

  // ── Tooltip: знаходимо точку і показуємо під нею на canvas ──────────
  function handleTimelineMove(e) {
    const canvas = timelineRef.current;
    if (!canvas) return;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top)  * scaleY;
    const nearest = pointsRef.current
      .map((p) => ({ ...p, distance: Math.hypot(p.x - mouseX, p.y - mouseY) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (!nearest || nearest.distance > 36) { setTooltip(null); return; }

    // Позиція у viewport: беремо координати точки на canvas і переводимо у viewport
    const ptX = rect.left + (nearest.x / scaleX);
    const ptY = rect.top  + (nearest.y / scaleY);
    setTooltip({ ptX, ptY, date: nearest.date, total: nearest.total, entries: nearest.entries });
  }
  function handleTimelineLeave() { setTooltip(null); }

  const topEntries = [...filteredData].sort((a, b) => entryTotal(b) - entryTotal(a)).slice(0, 10);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>

      {/* Stat cards */}
      <div className={styles.statsBar}>
        <SCard label="Загальні витрати" value={`${total.toFixed(0)} zł`} sub={`${filteredData.length} записів`} />
        <SCard label="Середня витрата"  value={`${avg.toFixed(1)} zł`}   sub="на запис" />
        <SCard label="Активних днів"    value={String(days)}              sub={`макс. ${max.toFixed(0)} zł`} />
      </div>

      {/* ── Глобальний фільтр дат ── */}
      <div className={styles.dateFilterCard}>
        <div className={styles.dateFilterTop}>
          <div className={styles.dateFilterLabel}>
            <span className={styles.dateFilterRange}>
              {fromDate ? fmtDate(fromDate) : "—"} — {toDate ? fmtDate(toDate) : "—"}
            </span>
            <span className={styles.dateFilterCount}>{filteredData.length} з {data.length} записів</span>
          </div>
          <div className={styles.presets}>
            {[["7d","7 днів"],["1m","Місяць"],["3m","3 місяці"],["1y","Рік"],["all","Все"]].map(([id, label]) => (
              <button
                key={id}
                className={[styles.preset, activePreset === id ? styles.presetActive : ""].join(" ")}
                onClick={() => applyPreset(id)}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Slider */}
        <div className={styles.rangeSlider} ref={sliderRef}
          onMouseDown={(e) => {
            const rect = sliderRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            dragRef.current = Math.abs(x - range[0]) < Math.abs(x - range[1]) ? "left" : "right";
          }}>
          <div className={styles.sliderTrack} />
          <div className={styles.rangeDim} style={{ left: 0, width: `${range[0] * 100}%` }} />
          <div className={styles.rangeDim} style={{ left: `${range[1] * 100}%`, right: 0 }} />
          <div className={styles.rangeActive} style={{ left: `${range[0] * 100}%`, width: `${(range[1] - range[0]) * 100}%` }} />
          <div className={styles.rangeHandle} style={{ left: `${range[0] * 100}%` }} />
          <div className={styles.rangeHandle} style={{ left: `${range[1] * 100}%` }} />
          {/* Мітки всіх дат-місяців під слайдером */}
          <div className={styles.sliderTicks}>
            {buildMonthTicks(allDates).map(({ label, pct }) => (
              <span key={label} className={styles.sliderTick} style={{ left: `${pct * 100}%` }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className={styles.tabsRow}>
        <div className={styles.tabsPill}>
          {TABS.map((tab) => (
            <button key={tab.id}
              className={[styles.tab, activeSection === tab.id ? styles.tabActive : ""].join(" ")}
              onClick={() => switchSection(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section panels */}
      <div className={styles.panel} key={panelKey}>

        {/* ── OVERVIEW ── */}
        {activeSection === "overview" && (
          <div className={styles.grid}>
            <div className={[styles.card, styles.full].join(" ")}>
              <div className={styles.chartTitle}>Витрати по днях</div>
              <div className={styles.timelineWrap}>
                <canvas ref={timelineRef} height={160} onMouseMove={handleTimelineMove} onMouseLeave={handleTimelineLeave} />
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.chartTitle}>Топ місць — загальна сума</div>
              <div className={styles.barChart}>
                {sp.slice(0, 8).map(([name, val], i) => (
                  <div className={styles.barRow} key={name}>
                    <div className={styles.barLabel} title={name}>{name}</div>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${(val / mv) * 100}%`, background: COLORS[i % COLORS.length] }} /></div>
                    <div className={styles.barVal}>{val.toFixed(0)} zł</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.chartTitle}>Розподіл витрат по місцях</div>
              <div className={styles.donutWrap}>
                <canvas ref={donutRef} width={120} height={120} style={{ flexShrink: 0 }} />
                <div className={styles.donutLegend}>
                  {sp.slice(0, 8).map(([name, val], i) => (
                    <div className={styles.legendRow} key={name}>
                      <div className={styles.legendDot} style={{ background: COLORS[i % COLORS.length] }} />
                      <span className={styles.legendName}>{name}</span>
                      <span className={styles.legendVal}>{val.toFixed(0)} zł</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PLACES ── */}
        {activeSection === "places" && (
          <div className={styles.card}>
            <div className={styles.chartTitle}>Витрати за місцем</div>
            {allPlaceNames.length === 0 && (
              <div className={styles.placeEmpty}>Немає записів у вибраному діапазоні</div>
            )}
            <div className={styles.placeSelector}>
              {allPlaceNames.map((name, i) => (
                <button key={name}
                  className={[styles.placeChip, selectedPlace === name ? styles.placeChipActive : ""].join(" ")}
                  style={selectedPlace === name ? { borderColor: COLORS[i % COLORS.length], background: COLORS[i % COLORS.length] + "18", color: COLORS[i % COLORS.length] } : {}}
                  onClick={() => setSelectedPlace((prev) => (prev === name ? null : name))}>
                  <span className={styles.placeChipDot} style={{ background: COLORS[i % COLORS.length] }} />
                  {name}
                  <span className={styles.placeChipAmt}>{placeTotals[name].toFixed(0)} zł</span>
                </button>
              ))}
            </div>
            {selectedPlace && (
              <div className={styles.placeDetail}>
                <div className={styles.placeSummary}>
                  <div className={styles.placeSummaryItem}>
                    <span className={styles.placeSummaryLabel}>Разом</span>
                    <span className={styles.placeSummaryVal}>{placeTotal.toFixed(2)} zł</span>
                  </div>
                  <div className={styles.placeSummaryItem}>
                    <span className={styles.placeSummaryLabel}>Записів</span>
                    <span className={styles.placeSummaryVal}>{placeTransactions.length}</span>
                  </div>
                  <div className={styles.placeSummaryItem}>
                    <span className={styles.placeSummaryLabel}>Середнє</span>
                    <span className={styles.placeSummaryVal}>{placeAvg.toFixed(2)} zł</span>
                  </div>
                </div>
                <div className={styles.placeTable}>
                  <div className={styles.placeTableHead}>
                    <span>Дата</span><span>Деталі</span><span>Нотатки</span><span className={styles.placeTableAmtCol}>Сума</span>
                  </div>
                  {placeTransactions.map((p) => (
                    <div className={styles.placeTableRow} key={`${p.date}-${p.id || p.amount}`}>
                      <span className={styles.placeTableDate}>{fmtDate(p.date)}</span>
                      <span className={styles.placeTableDetails}>{p.details || "—"}</span>
                      <span className={styles.placeTableNotes}>{p.notes || ""}</span>
                      <span className={styles.placeTableAmtCol}>−{Number(p.amount).toFixed(2)} zł</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!selectedPlace && allPlaceNames.length > 0 && (
              <div className={styles.placeEmpty}>Оберіть місце вище, щоб побачити всі витрати по ньому</div>
            )}
          </div>
        )}

        {/* ── TOP ── */}
        {activeSection === "top" && (
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.chartTitle}>Топ-10 найбільших витрат</div>
              <div className={styles.topList}>
                {topEntries.map((e, i) => (
                  <div className={styles.topItem} key={e.id}>
                    <div className={styles.topRank}>#{i + 1}</div>
                    <div className={styles.topInfo}>
                      <div className={styles.topDate}>{fmtDate(e.date)}</div>
                      <div className={styles.topTags}>{e.places.map((p) => p.name).join(", ")}</div>
                    </div>
                    <div className={styles.topAmount}>−{entryTotal(e).toFixed(0)} zł</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.card}>
              <div className={styles.chartTitle}>Частота відвідувань місць</div>
              <div className={styles.barChart}>
                {sf.map(([name, count], i) => (
                  <div className={styles.barRow} key={name}>
                    <div className={styles.barLabel} title={name}>{name}</div>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${(count / mf) * 100}%`, background: COLORS[i % COLORS.length] }} /></div>
                    <div className={styles.barVal}>{count}×</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Tooltip — позиціонується над точкою на графіку ── */}
      {tooltip && (
        <TooltipPortal tooltip={tooltip} />
      )}
    </div>
  );
}

// Тултіп рендериться через портал у document.body — обходить будь-які transform батьків
function TooltipPortal({ tooltip }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999, visible: false });

  useEffect(() => {
    setPos(p => ({ ...p, visible: false }));

    const frame = requestAnimationFrame(() => {
      if (!ref.current) return;
      const w = ref.current.offsetWidth  || 220;
      const h = ref.current.offsetHeight || 100;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let left = tooltip.ptX - w / 2;
      let top  = tooltip.ptY - h - 12;

      if (left < 8) left = 8;
      if (left + w > vw - 8) left = vw - w - 8;
      if (top < 8) top = tooltip.ptY + 16;
      if (top + h > vh - 8) top = tooltip.ptY - h - 12;

      setPos({ left, top, visible: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [tooltip]);

  return ReactDOM.createPortal(
    <div
      ref={ref}
      className={styles.tooltip}
      style={{ left: pos.left, top: pos.top, opacity: pos.visible ? 1 : 0 }}
    >
      <div className={styles.tooltipDate}>{fmtDate(tooltip.date)}</div>
      <div className={styles.tooltipTotal}>{tooltip.total.toFixed(2)} zł</div>
      <div className={styles.tooltipList}>
        {tooltip.entries.flatMap((entry) =>
          entry.places.map((place) => (
            <div key={place.id} className={styles.tooltipPlace}>
              <span>{place.name}</span>
              <strong>{Number(place.amount).toFixed(2)} zł</strong>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  );
}

// Генерує мітки місяців для слайдера (не густіше ніж 1 на ~8%)
function buildMonthTicks(allDates) {
  if (allDates.length < 2) return [];
  const seen = new Set();
  const ticks = [];
  allDates.forEach((d, i) => {
    const ym = d.slice(0, 7); // "YYYY-MM"
    if (seen.has(ym)) return;
    seen.add(ym);
    const pct = i / (allDates.length - 1);
    // Пропускаємо мітки що надто близько до попередньої
    if (ticks.length > 0 && pct - ticks[ticks.length - 1].pct < 0.07) return;
    const [year, month] = ym.split("-");
    const months = ["Січ","Лют","Бер","Кві","Тра","Чер","Лип","Сер","Вер","Жов","Лис","Гру"];
    ticks.push({ label: `${months[+month - 1]} ${year}`, pct });
  });
  return ticks;
}

function SCard({ label, value, sub }) {
  return (
    <div className={styles.sCard}>
      <div className={styles.sLabel}>{label}</div>
      <div className={styles.sValue}>{value}</div>
      {sub && <div className={styles.sSub}>{sub}</div>}
    </div>
  );
}
