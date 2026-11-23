import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("upload", "routes/upload.tsx"),
  route("results", "routes/results.tsx"),
  route("history", "routes/history.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
