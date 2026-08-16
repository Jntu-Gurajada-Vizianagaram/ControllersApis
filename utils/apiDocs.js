const humanizePath = (path = "") =>
  String(path || "")
    .replace(/^\/+/, "")
    .replace(/[-_/]+/g, " ")
    .replace(/:\w+/g, "parameter")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Root";

const normalizeRoutePath = (basePath, routePath) => {
  const base = String(basePath || "").replace(/\/+$/, "");
  const route = String(routePath || "").replace(/^\/+/, "");
  return route ? `${base}/${route}` : base || "/";
};

const getMethods = (route) =>
  Object.keys(route.methods || {})
    .filter((method) => route.methods[method])
    .map((method) => method.toUpperCase())
    .sort();

const classifyRouteGroup = (routePath, fallbackGroup) => {
  const path = String(routePath || "").toLowerCase();
  if (path.includes("/gallery")) return "Gallery APIs";
  if (path.includes("event-photo") || path.includes("/events") || path.includes("main-event")) return "Event APIs";
  if (path.includes("/updates") || path.includes("notification")) return "Notification APIs";
  if (path.includes("/press-notes")) return "Press Note APIs";
  if (path.includes("/webadmin") || path.includes("carousel")) return "Carousel and Media APIs";
  if (path.includes("/site") || path.includes("/website") || path.includes("navbar") || path.includes("youtube")) return "Website CMS APIs";
  if (path.includes("/admins") || path.startsWith("/admin")) return "Admin and Auth APIs";
  if (path.includes("/directors")) return "Director APIs";
  if (path.includes("/affliated-colleges")) return "College APIs";
  if (path.includes("/mailing") || path.includes("grievance")) return "Mailing and Grievance APIs";
  if (path.includes("/results")) return "Results APIs";
  if (path.includes("/developer")) return "Developer APIs";
  return fallbackGroup || "General APIs";
};

const groupBy = (items, key) =>
  items.reduce((groups, item) => {
    const groupKey = item[key] || "Other";
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
    return groups;
  }, {});

const countBy = (items, key) =>
  items.reduce((counts, item) => {
    const countKey = item[key] || "Other";
    counts[countKey] = (counts[countKey] || 0) + 1;
    return counts;
  }, {});

const collectRouterRoutes = (basePath, router, group) => {
  if (!router || !Array.isArray(router.stack)) return [];

  return router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) => {
      const routePath = normalizeRoutePath(basePath, layer.route.path);
      const routeGroup = classifyRouteGroup(routePath, group);
      return getMethods(layer.route).map((method) => ({
        method,
        path: routePath,
        group: routeGroup,
        mount_group: group,
        title: `${method} ${humanizePath(routePath)}`,
        access:
          routePath.includes("/admin") ||
          method !== "GET" ||
          routePath.includes("request") ||
          routePath.includes("admins")
            ? "Authenticated admin console users with assigned role access"
            : "Public website or authenticated console users",
        description: `${method} endpoint for ${humanizePath(routePath)}.`,
      }));
    });
};

const buildApiDocs = (mounts = []) => {
  const routes = mounts
    .flatMap(({ basePath, router, group }) =>
      collectRouterRoutes(basePath, router, group),
    )
    .sort((a, b) =>
      `${a.group}${a.method}${a.path}`.localeCompare(`${b.group}${b.method}${b.path}`),
    );

  return {
    service: "JNTU-GV API",
    version: "1.0",
    generated_at: new Date().toISOString(),
    route_count: routes.length,
    groups: [...new Set(routes.map((route) => route.group))].sort(),
    methods: [...new Set(routes.map((route) => route.method))].sort(),
    method_counts: countBy(routes, "method"),
    group_counts: countBy(routes, "group"),
    by_method: groupBy(routes, "method"),
    by_group: groupBy(routes, "group"),
    routes,
  };
};

module.exports = { buildApiDocs };
