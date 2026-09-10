# Track ETA

## Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains

**Team:** Quantum Coders (TEAM031)

This prototype monitors long- and short-distance Indian train services and provides a single web dashboard for dynamic ETA forecasting, delay analytics, operational risk screening, predictive maintenance indicators, notifications, admin controls and reports.

### 10 demo long-distance trains
1. 12621 — Tamil Nadu Express (Chennai Central → New Delhi)
2. 12622 — Tamil Nadu Express (New Delhi → Chennai Central)
3. 12841 — Coromandel Express (Shalimar → Chennai Central)
4. 12842 — Coromandel Express (Chennai Central → Shalimar)
5. 12301 — Howrah Rajdhani Express (Howrah → New Delhi)
6. 12302 — Howrah Rajdhani Express (New Delhi → Howrah)
7. 12951 — Mumbai Rajdhani (Mumbai Central → New Delhi)
8. 12952 — Mumbai Rajdhani (New Delhi → Mumbai Central)
9. 12903 — Golden Temple Mail (Mumbai Central → Amritsar)
10. 12904 — Golden Temple Mail (Amritsar → Mumbai Central)

> Train movement, GPS coordinates, weather and delay values are simulated demo data. Use authorized railway/NTES feeds for production.

## Features
- Home overview
- Live train dashboard + Leaflet map
- Train search
- AI ETA prediction feature layer
- Delay analytics
- Accident/operational risk screening
- Predictive maintenance indicators
- Notifications
- Admin panel
- Reports
- Socket.IO live updates every 2 seconds

## Tech stack
- Frontend: HTML5, CSS3, JavaScript, Leaflet, OpenStreetMap, Chart.js
- Backend: Node.js, Express, Socket.IO
- Data: JavaScript route master / simulation; ready for MongoDB Atlas integration
- Deployment: GitHub + Render single Node.js service

## Run on Windows
```powershell
npm run install:backend
npm start
```
Open: `http://localhost:8000`

No Python or Uvicorn is required for this version.

## Deploy frontend on Vercel and backend on Render

The frontend uses `https://track-eta.onrender.com` as its default backend URL. The URL can be overridden before the frontend scripts load with `window.__BACKEND_URL__`, while the API helper and Socket.IO client continue to use the same configured value.

### Render settings

Create a **Web Service** from this repository using:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** `Node`
- **Environment variable:** `NODE_ENV=production`
- **Environment variable:** `ALLOWED_ORIGINS=https://YOUR-VERCEL-PROJECT.vercel.app`

Add the custom Vercel domain too, separated by commas, when applicable:

```text
ALLOWED_ORIGINS=https://YOUR-VERCEL-PROJECT.vercel.app,https://www.example.com
```

The included `render.yaml` contains the same settings and names the service `track-eta`, so its expected public URL is `https://track-eta.onrender.com`.

### Vercel settings

Import the repository as a static project with:

- **Root Directory:** repository root (`sih_eta_project`)
- **Framework Preset:** `Other`
- **Build Command:** leave empty
- **Output Directory:** `frontend`
- **Install Command:** leave empty

The included `vercel.json` already sets the output directory. Do not set the Vercel root directory to `frontend` unless you also change the output directory to `.`.

### Deployment checks

After both services are deployed, verify:

```text
https://track-eta.onrender.com/api/health
https://track-eta.onrender.com/api/trains
https://YOUR-VERCEL-PROJECT.vercel.app/
```

The first URL should return JSON with `ok: true`; the second should return the train array. Open the Vercel page and confirm the connection indicator becomes live and train updates continue through Socket.IO. Render may take a short time to wake from its free-service sleep state on the first request.

## Production realtime feed

The application supports an authorized railway/GPS provider without changing the frontend. Configure these backend environment variables:

```env
REALTIME_PROVIDER_URL=https://your-authorized-provider.example/live
REALTIME_PROVIDER_TOKEN=replace-with-secret
REALTIME_PROVIDER_TIMEOUT_MS=1500
```

The provider is queried with `?train_no=...` every 2 seconds. It may return one object, an object under `data`, or an array under `data`/`trains`. Required live fields are latitude, longitude, speed, and train number; accepted aliases include `lat`, `lng`, `speed_kmph`, `currentSpeed`, and `trainNumber`.

Without `REALTIME_PROVIDER_URL`, the app clearly labels data as demo simulation. If the provider is unavailable, it labels the snapshot as simulation fallback instead of hiding the failure.

Check feed configuration with `GET /api/health`. Never commit provider tokens; configure them in the deployment environment.
