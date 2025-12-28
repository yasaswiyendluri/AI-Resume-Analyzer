import { route } from "@react-router/dev/routes";

export default [
  route("", "routes/home.tsx"),        // index route → "/"
  route("upload", "routes/upload.tsx"), // "/upload"
  route("auth", "routes/auth.tsx"),     // "/auth"
];
