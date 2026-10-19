export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="nav" aria-label="Main">
      <button
        className={active === "camera" ? "is-active" : ""}
        onClick={() => onNavigate("camera")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M9 4 7.7 6H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-2.7L15 4H9z"
          />
          <circle cx="12" cy="13" r="3.6" fill="none" stroke="#f9f8f4" strokeWidth="1.8" />
        </svg>
        <span>Camera</span>
      </button>

      <button
        className={active === "gallery" ? "is-active" : ""}
        onClick={() => onNavigate("gallery")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
          <circle cx="9" cy="9" r="1.9" fill="#f9f8f4" />
          <path d="M3 21v-3l5.5-6 3.5 4 3-3.5L21 17v4z" fill="#f9f8f4" />
        </svg>
        <span>Gallery</span>
      </button>
    </nav>
  );
}
