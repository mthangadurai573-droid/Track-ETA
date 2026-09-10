# Judge Demo Notes

## 60-second story

We ingest a train's latest simulated GPS state, combine route progress with explainable operational factors such as congestion, weather, track condition and dwell overrun, and recalculate the expected arrival continuously. The dashboard shows not only the ETA, but why it changed.

## Key differentiators
- Dynamic ETA rather than static timetable ETA
- Explainable delay factors
- Live map position
- Real-time Socket.IO updates
- One-command local run and one-service cloud deployment
