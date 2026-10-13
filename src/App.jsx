import { useState } from "react";
import Camera from "./Camera";
import PhotoTag from "./Phototag";

export default function App() {
  const [photo, setPhoto] = useState(null);

  if (photo) {
    return (
      <PhotoTag
        photo={photo}
        onClose={() => setPhoto(null)}
        onSave={(entry) => {
          console.log("Saved:", entry); 
          setPhoto(null);
        }}
      />
    );
  }

  return <Camera onCapture={setPhoto} />;
}