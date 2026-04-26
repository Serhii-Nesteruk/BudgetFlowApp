import { useEffect, useRef } from "react";
import { entryTotal, fmtDate } from "../data/store";
import styles from "./StatsTab.module.css";

const COLORS = ["#1a56db","#e35d3a","#16a34a","#b45309","#7c3aed","#0891b2","#be185d","#65a30d","#0369a1","#9333ea"];

export default function StatsTab({ data }) {
  const timelineRef = useRef(null);
  const donutRef = useRef(null);

  const total = data.reduce((s, e) => s + entryTotal(e), 0);
  const avg = data.length ? total / data.length : 0;
  const max = data.length ? Math.max(...data.map((e) => entryTotal(e))) : 0;
  const days = [...new Set(data.map((e) => e.date))].length;

  // Per-place totals (using new model)
  const placeTotals = {};
  const placeCount = {};
  data.forEach((e) =>
    e.places.forEach((p) => {
      placeTotals[p.name] = (placeTotals[p.name] || 0) + (p.amount || 0);
      placeCount[p.name] = (placeCount[p.name] || 0) + 1;
    })
  );

  const sp = Object.entries(placeTotals).sort((a, b) => b[1] - a[1]);
  const mv = sp[0]?.[1] || 1;
  const sf = Object.entries(placeCount).sort((a, b) => b[1] - a[1]);
  const mf = sf[0]?.[1] || 1;

  // Donut canvas
  useEffect(() => {
    const dc = donutRef.current;
    if (!dc || !sp.length) return;
    const dctx = dc.getContext("2d");
    const cx = 60, cy = 60, r = 52, inn = 26;
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
  }, [data]);

  // Timeline canvas
  useEffect(() => {
    const canvas = timelineRef.current;
    if (!canvas) return;
    const draw = () => {
      const W = canvas.parentElement.offsetWidth - 2;
      const H = 160;
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      const byDate = {};
      data.forEach((e) => { byDate[e.date] = (byDate[e.date] || 0) + entryTotal(e); });
      const dates = Object.keys(byDate).sort();
      const vals = dates.map((d) => byDate[d]);
      const maxV = Math.max(...vals) || 1;
      const pad = { l: 46, r: 10, t: 10, b: 28 };
      const W2 = W - pad.l - pad.r, H2 = H - pad.t - pad.b;
      ctx.clearRect(0, 0, W, H);
      ctx.font = "10px IBM Plex Mono";
      [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
        const y = pad.t + H2 * (1 - t);
        ctx.strokeStyle = "#e4e6ea"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
        ctx.fillStyle = "#9ca3af"; ctx.textAlign = "right";
        ctx.fillText(Math.round(maxV * t) + "zł", pad.l - 4, y + 4);
      });
      if (!dates.length) return;
      const pts = dates.map((d, i) => ({
        x: pad.l + (dates.length > 1 ? i / (dates.length - 1) : 0.5) * W2,
        y: pad.t + H2 * (1 - vals[i] / maxV),
      }));
      const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
      grad.addColorStop(0, "rgba(26,86,219,0.15)"); grad.addColorStop(1, "rgba(26,86,219,0)");
      ctx.beginPath(); ctx.moveTo(pts[0].x, H - pad.b);
      pts.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, H - pad.b);
      ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle = "#1a56db"; ctx.lineWidth = 1.5;
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      pts.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
        ctx.strokeStyle = "#1a56db"; ctx.lineWidth = 1.5; ctx.stroke();
      });
      const step = Math.ceil(dates.length / 9);
      ctx.fillStyle = "#9ca3af"; ctx.font = "9px IBM Plex Mono"; ctx.textAlign = "center";
      pts.forEach((p, i) => { if (i % step === 0 || i === dates.length - 1) ctx.fillText(fmtDate(dates[i]), p.x, H - 6); });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [data]);

  const topEntries = [...data].sort((a, b) => entryTotal(b) - entryTotal(a)).slice(0, 10);

  return (
    <div>
      <div className={styles.statsBar}>
        <SCard label="Загальні витрати" value={`${total.toFixed(0)} zł`} sub={`${data.length} записів`} />
        <SCard label="Середня витрата" value={`${avg.toFixed(1)} zł`} sub="на запис" />
        <SCard label="Активних днів" value={String(days)} sub={`макс. ${max.toFixed(0)} zł`} />
      </div>

      <div className={styles.grid}>
        <div className={[styles.card, styles.full].join(" ")}>
          <div className={styles.chartTitle}>Витрати по днях</div>
          <canvas ref={timelineRef} height={160} />
        </div>

        <div className={styles.card}>
          <div className={styles.chartTitle}>Топ місць — загальна сума</div>
          <div className={styles.barChart}>
            {sp.map(([name, val], i) => (
              <div className={styles.barRow} key={name}>
                <div className={styles.barLabel} title={name}>{name}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(val / mv) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
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
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ width: `${(count / mf) * 100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <div className={styles.barVal}>{count}×</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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
