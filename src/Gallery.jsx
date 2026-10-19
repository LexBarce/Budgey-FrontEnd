
import { useEffect, useMemo, useState } from "react";
import BottomNav from "./Bottomnav";
import "./Gallery.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const REASON_ORDER = ["Need", "Reward", "Want"];

const peso = (n) =>
  "₱" +
  Number(n).toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const formatDate = (iso) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
};

export default function Gallery({ entries, onNavigate }) {
  const [selected, setSelected] = useState(null);
  const [viewing, setViewing] = useState(false);

  // Group photos by month, newest first
  const groups = useMemo(() => {
    const map = new Map();
    [...entries]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach((e) => {
        const d = new Date(e.createdAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!map.has(key)) {
          map.set(key, {
            key,
            month: MONTHS[d.getMonth()],
            year: d.getFullYear(),
            items: [],
          });
        }
        map.get(key).items.push(e);
      });
    return [...map.values()];
  }, [entries]);

  // Spending summary: total, split by reason, and top category
  const stats = useMemo(() => {
    const byReason = { Need: 0, Reward: 0, Want: 0 };
    const byCategory = {};
    let total = 0;

    entries.forEach((e) => {
      total += e.amount;
      if (e.reason in byReason) byReason[e.reason] += e.amount;
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const top =
      Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "---";

    return { total, byReason, top };
  }, [entries]);

  // Escape closes the full photo first, then the details card
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (viewing) setViewing(false);
      else setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewing]);

  return (
    <main className="gallery">
      <header className="gallery__head">
        <h1 className="gallery__title">Spending Summary</h1>

        <p className="gallery__label">Total Spending</p>
        <div className="gallery__total">
          <strong>{peso(stats.total)}</strong>
          <div className="gallery__top">
            <b>{stats.top}</b>
            <span>Top Category</span>
          </div>
        </div>

        <div
          className="bar"
          role="img"
          aria-label="Spending split by reason: need, reward, want"
        >
          {stats.total > 0 &&
            REASON_ORDER.filter((r) => stats.byReason[r] > 0).map((r) => (
              <span
                key={r}
                className={`bar__seg bar__seg--${r.toLowerCase()}`}
                style={{ flexGrow: stats.byReason[r] }}
              />
            ))}
        </div>

        <ul className="legend">
          {REASON_ORDER.map((r) => (
            <li key={r}>
              <i className={`dot dot--${r.toLowerCase()}`} />
              {r}
            </li>
          ))}
        </ul>
      </header>

      <section className="gallery__body">
        {entries.length === 0 ? (
          <div className="empty">
            <svg width="150" height="130" viewBox="0 0 150 130" aria-hidden="true">
              <path
                fill="#8d8d8d"
                d="M16 40a8 8 0 0 1 8-8h4v70a10 10 0 0 0 10 10h66a8 8 0 0 1-8 8H38a22 22 0 0 1-22-22V40z"
                transform="translate(0 4) rotate(-6 20 70)"
              />
              <rect x="30" y="8" width="112" height="96" rx="16" fill="#8d8d8d" />
              <circle cx="58" cy="36" r="9" fill="#f9f8f4" />
              <path d="M30 104V88l30-30 22 22 18-18 42 40v2z" fill="#f9f8f4" />
              <path d="M30 104V94l30-30 22 22 18-18 42 40v-2a16 16 0 0 1-16 16H46a16 16 0 0 1-16-16z" fill="#8d8d8d" />
            </svg>
            <p>The photos you took in this app will show up here</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.key} className="month">
              <h2 className="month__head">
                {g.month}, {g.year}
              </h2>
              <div className="grid">
                {g.items.map((e) => (
                  <button
                    key={e.id}
                    className="thumb"
                    onClick={() => setSelected(e)}
                    aria-label={`${e.name}, ${peso(e.amount)}`}
                  >
                    <img src={e.photo} alt="" />
                    <span className="thumb__price">{peso(e.amount)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <BottomNav active="gallery" onNavigate={onNavigate} />

      {/* Details card */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div
            className="card"
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card__photo">
              <img src={selected.photo} alt={selected.name} />
              <button
                className="card__close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="card__body">
              <div className="card__row">
                <h3>{selected.name}</h3>
                <strong>{peso(selected.amount)}</strong>
              </div>
              <div className="card__row card__row--meta">
                <span>{formatDate(selected.createdAt)}</span>
                <span className="pill">{selected.reason}</span>
              </div>
              <button className="card__view" onClick={() => setViewing(true)}>
                View this photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full photo */}
      {selected && viewing && (
        <div className="viewer" onClick={() => setViewing(false)}>
          <img src={selected.photo} alt={selected.name} />
          <button
            className="viewer__close"
            onClick={() => setViewing(false)}
            aria-label="Close photo"
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}