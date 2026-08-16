const MAX_SPIKES = 40;
const MAX_MINUTES = 60;

const state = {
  started_at: new Date().toISOString(),
  totals: {
    requests: 0,
    errors: 0,
    total_ms: 0,
  },
  routes: new Map(),
  minutes: new Map(),
  spikes: [],
};

const currentMinuteKey = () => new Date().toISOString().slice(0, 16);

const routeKey = (req) => {
  if (req.route && req.route.path) {
    return `${req.method} ${req.baseUrl || ""}${req.route.path}`;
  }
  return `${req.method} ${req.path || req.originalUrl || "/"}`;
};

const trimMinutes = () => {
  const keys = [...state.minutes.keys()].sort();
  while (keys.length > MAX_MINUTES) {
    state.minutes.delete(keys.shift());
  }
};

const apiMetricsMiddleware = (req, res, next) => {
  const started = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
    const roundedMs = Math.round(durationMs);
    const isError = res.statusCode >= 400;
    const key = routeKey(req);

    state.totals.requests += 1;
    state.totals.total_ms += durationMs;
    if (isError) state.totals.errors += 1;

    const route = state.routes.get(key) || {
      route: key,
      count: 0,
      errors: 0,
      total_ms: 0,
      max_ms: 0,
      last_status: null,
      last_seen: null,
    };
    route.count += 1;
    route.total_ms += durationMs;
    route.max_ms = Math.max(route.max_ms, roundedMs);
    route.last_status = res.statusCode;
    route.last_seen = new Date().toISOString();
    if (isError) route.errors += 1;
    state.routes.set(key, route);

    const minuteKey = currentMinuteKey();
    const minute = state.minutes.get(minuteKey) || {
      minute: minuteKey,
      requests: 0,
      errors: 0,
      total_ms: 0,
    };
    minute.requests += 1;
    minute.total_ms += durationMs;
    if (isError) minute.errors += 1;
    state.minutes.set(minuteKey, minute);
    trimMinutes();

    if (durationMs >= 750 || res.statusCode >= 500) {
      state.spikes.unshift({
        route: key,
        status: res.statusCode,
        duration_ms: roundedMs,
        at: new Date().toISOString(),
      });
      state.spikes = state.spikes.slice(0, MAX_SPIKES);
    }
  });

  next();
};

const summarizeApiMetrics = () => {
  const routes = [...state.routes.values()]
    .map((route) => ({
      ...route,
      avg_ms: route.count ? Math.round(route.total_ms / route.count) : 0,
      total_ms: Math.round(route.total_ms),
    }))
    .sort((a, b) => b.count - a.count);

  const minutes = [...state.minutes.values()]
    .sort((a, b) => a.minute.localeCompare(b.minute))
    .map((minute) => ({
      minute: minute.minute,
      requests: minute.requests,
      errors: minute.errors,
      avg_ms: minute.requests ? Math.round(minute.total_ms / minute.requests) : 0,
    }));

  return {
    service: "JNTU-GV API",
    started_at: state.started_at,
    generated_at: new Date().toISOString(),
    totals: {
      requests: state.totals.requests,
      errors: state.totals.errors,
      avg_ms: state.totals.requests
        ? Math.round(state.totals.total_ms / state.totals.requests)
        : 0,
      error_rate:
        state.totals.requests > 0
          ? Number(((state.totals.errors / state.totals.requests) * 100).toFixed(2))
          : 0,
    },
    timeline: minutes,
    top_routes: routes.slice(0, 20),
    slowest_routes: [...routes].sort((a, b) => b.avg_ms - a.avg_ms).slice(0, 12),
    spikes: state.spikes,
  };
};

module.exports = { apiMetricsMiddleware, summarizeApiMetrics };
