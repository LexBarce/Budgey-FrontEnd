import { useEffect, useRef, useState } from "react";
import "./Camera.css";

export default function Camera({ onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facing, setFacing] = useState("environment");
  const [cameraError, setCameraError] = useState(false);
  const [lastPhoto, setLastPhoto] = useState(null);

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
    setLastPhoto(dataUrl);
    onCapture?.(dataUrl);
  };

  return (
    <main className="camera">
      <header className="camera__header">
        <h1 className="camera__logo">budgey</h1>
        <button className="camera__ring" aria-label="Camera settings" />
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
        <button className="controls__gallery" aria-label="Open gallery">
          {lastPhoto && <img src={lastPhoto} alt="Last photo taken" />}
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