# Architecture

Browser -> Express static frontend -> REST API / Socket.IO -> ETA simulation service -> route data.

The backend is deliberately modular so the simulated GPS source can later be replaced by a real authorized feed and the rule-based ETA model can later be replaced by a trained ML model without changing the frontend API contract.
