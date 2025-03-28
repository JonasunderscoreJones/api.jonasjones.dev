# api.jonasjones.dev
API worker for cloudflare

This is the worker adapter for the backend. It allows for control over the primary traffic to the api backend as well as the error fallback implementations.

# Redirect
Any request from `https://api.jonasjones.dev/` will be redirected to `https://someapi.jonasjones.dev/` and the response will be returned if the backend is up. Otherwhise an error message is returned

# Requests

The following requests are implemented in the worker and are not redirected to the Rust API-Backend

## GET /status

Internally pings the backend and returns whether or not it is online
