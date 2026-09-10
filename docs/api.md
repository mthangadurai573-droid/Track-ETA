# API Contract

## GET /api/trains
Returns available trains.

## GET /api/train/:trainNo
Returns route and station data.

## GET /api/train/:trainNo/live
Returns the current simulated GPS position, ETA, delay factors, status and ETA history.
When a train is stopped at an intermediate station, the response includes `status: "stopped"`, `is_stopped: true`, `current_speed_kmph: 0`, `station_stop_duration_minutes: 1`, and `station_stop_remaining_seconds`. The simulator holds every intermediate station for exactly 60 real seconds before accelerating toward the next segment. `remaining_journey_minutes` reports the current remaining travel and stop time; `predicted_eta` adds the stable operational delay estimate to that remaining time.

## POST /api/train/:trainNo/reset
Resets the selected train simulation.

## Socket.IO
Client emits `subscribe` with a train number. Server emits `train:update` every two seconds for subscribed trains.
