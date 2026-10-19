import { useEffect, useState } from "react";
import Camera from "./Camera";
import PhotoTag from "./PhotoTag";
import Gallery from "./Gallery";

const STORAGE_KEY = "budgey:entries";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Shrink photos so many of them fit in browser storage
function shrinkPhoto(dataUrl, maxSide = 900) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function App() {
  const [screen, setScreen] = useState("camera");
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [entries, setEntries] = useState(loadEntries);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.warn("Could not save entries:", err);
    }
  }, [entries]);

  const saveEntry = async (entry) => {
    const photo = await shrinkPhoto(entry.photo);
    setEntries((prev) => [
      {
        ...entry,
        photo,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setPendingPhoto(null);
    setScreen("gallery");
  };

  if (pendingPhoto) {
    return (
      <PhotoTag
        photo={pendingPhoto}
        onClose={() => setPendingPhoto(null)}
        onSave={saveEntry}
      />
    );
  }

  if (screen === "gallery") {
    return <Gallery entries={entries} onNavigate={setScreen} />;
  }

  return (
    <Camera
      onCapture={setPendingPhoto}
      onOpenGallery={() => setScreen("gallery")}
      latestPhoto={entries[0]?.photo}
    />
  );
}