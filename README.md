# Budgey frontend

React app for Budgey. Take a photo of something you bought, tag it with a name, amount, category, and reason, and see where your money goes.

## Tech

- React + Vite (plain JavaScript)
- Plain CSS, one file per screen
- Poppins font (loaded from Google Fonts)
- No UI library and no router. `App.jsx` switches screens with state.

## Getting started

You need [Node.js](https://nodejs.org) (LTS version).

```
npm install
npm run dev
```

Open http://localhost:5173 in **Chrome**. For a phone-sized view, press `F12`, then `Ctrl + Shift + M`, and set the size to 400 x 874.

### Test on a phone

```
npm run dev -- --host
```

Open the **Network** link on a phone on the same Wi-Fi. The layout loads, but the camera does not work there, because browsers only allow the camera on `localhost` or `https`. The upload button still works.

## Screens

| Screen | File | What it does |
|---|---|---|
| Camera | `Camera.jsx` | Live preview, flip camera, shutter, and upload from files or the photo library |
| Photo tag | `PhotoTag.jsx` | Form for item name, amount, category, and reason. It is also used to edit an existing entry. |
| Gallery | `Gallery.jsx` | Spending summary, photos grouped by month, details card, full-photo viewer, delete with confirmation, and Edit Details |
| Bottom nav | `BottomNav.jsx` | Camera and Gallery tabs |

## Flow

1. Take a photo or upload one. Both open the tag form.
2. Fill in the details and press **Add to Gallery**.
3. The gallery shows the photo under its month, and the totals update.
4. Tap a photo to see its details. **View this photo** opens the full-screen viewer, where you can **Delete** it or **Edit Details**.

## Project structure

```
frontend/
├── public/
├── src/
│   ├── App.jsx          screen switching, saving, editing, deleting
│   ├── main.jsx
│   ├── index.css        global styles
│   ├── Camera.jsx       + Camera.css
│   ├── PhotoTag.jsx     + PhotoTag.css
│   ├── Gallery.jsx      + Gallery.css
│   └── BottomNav.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Data

An entry looks like this:

```json
{
  "id": "lq3k9x2abc",
  "name": "Capybara Squishy",
  "amount": 85,
  "category": "Toys",
  "reason": "Want",
  "photo": "data:image/jpeg;base64,...",
  "createdAt": "2026-10-19T08:43:00.000Z"
}
```

- **Categories:** Food, Personal Care, Apparel, Travel, or Other (the user types their own).
- **Reasons:** Want, Reward, or Need.
- **Storage right now:** the browser's `localStorage`, under the key `budgey:entries`. Photos are shrunk to 900px so more of them fit. Data stays on one browser on one device, and clearing the browser's site data deletes it.

## Connecting to the backend (to do)

The backend is documented in `backend/README.md`. These are the differences to sort out when connecting:

| Frontend now | Backend expects |
|---|---|
| `amount` | `price` |
| `createdAt` | `purchased_at` with a UTC offset, like `+08:00` |
| `reason` | no `reason` field yet |
| Edit Details | no update endpoint yet |
| photo stored as text in the browser | photo uploaded to Firebase Storage, and the backend keeps `photo_path` |
| no login | Firebase token on every request (`AUTH_DISABLED=true` locally) |
| item name typed by hand | `POST /match` can suggest a name and category from the photo |

Planned changes:
- Keep the API base URL in one config value.
- Replace the `localStorage` code in `App.jsx` with API calls.
- Add the "Matched" suggestion to the tag form.
- Show loading and error states.

## Known limits

- Camera only works on `localhost` or `https`.
- The date and time on an entry are when it was saved, not when the photo was taken.
- The avatar and some icons are placeholders until the final Figma exports are added.
- The photo editor (filters and stickers) is not built yet.

## Troubleshooting

- **"Camera unavailable":** another tab or app is using the webcam, or camera access is blocked. Close the other app, then allow the camera in Chrome's site settings and reload.
- **`npm` says scripts are disabled (Windows PowerShell):** run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.
- **Page looks outdated:** hard reload with `Ctrl + Shift + R`.