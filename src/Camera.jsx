import { useEffect, useRef, useState } from "react";
import "./Camera.css";

export default function Camera({ onCapture, onOpenGallery, latestPhoto }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  const [facing, setFacing] = useState("environment");
  const [cameraError, setCameraError] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture?.(reader.result);
    reader.readAsDataURL(file);
    e.target.value = ""; // lets you pick the same file again later
  };

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError(false);
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(true);
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const flipCamera = () =>
    setFacing((f) => (f === "environment" ? "user" : "environment"));

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || cameraError || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCapture?.(dataUrl);
  };

  return (
    <main className="camera">
      <header className="camera__header">
        <h1 className="camera__logo">budgey</h1>

        <button
          className="camera__upload"
          onClick={() => fileRef.current?.click()}
          aria-label="Upload a photo"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V3" />
            <path d="M7.5 7.5 12 3l4.5 4.5" />
            <path d="M5 11H4.5A1.5 1.5 0 0 0 3 12.5v7A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H19" />
          </svg>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleUpload}
        />
      </header>

      <section className="viewfinder" aria-label="Camera preview">
        {cameraError ? (
          <p className="viewfinder__error">
            Camera unavailable. Allow camera access in your browser, then reload.
          </p>
        ) : (
          <video
            ref={videoRef}
            className={`viewfinder__video ${facing === "user" ? "is-mirrored" : ""}`}
            autoPlay
            playsInline
            muted
          />
        )}

        <div className="viewfinder__grid" aria-hidden="true">
          <span /> <span /> <span /> <span />
        </div>

        <i className="corner corner--tl" aria-hidden="true" />
        <i className="corner corner--tr" aria-hidden="true" />
        <i className="corner corner--bl" aria-hidden="true" />
        <i className="corner corner--br" aria-hidden="true" />
      </section>

      <footer className="controls">
        <button
          className="controls__gallery"
          aria-label="Open gallery"
          onClick={onOpenGallery}
        >
          {latestPhoto && <img src={latestPhoto} alt="Latest photo" />}
        </button>

        <button
          className="controls__shutter"
          onClick={takePhoto}
          aria-label="Take photo"
        >
          <span />
        </button>

        <button
          className="controls__flip"
          onClick={flipCamera}
          aria-label="Switch camera"
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round"
               strokeLinejoin="round" aria-hidden="true">
            <path d="M20 11a8 8 0 0 0-14.3-4.5L4 8" />
            <path d="M4 3v5h5" />
            <path d="M4 13a8 8 0 0 0 14.3 4.5L20 16" />
            <path d="M20 21v-5h-5" />
          </svg>
        </button>
      </footer>
    </main>
  );
}