import { route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("upload", "routes/upload.tsx"),
  route("auth", "routes/auth.tsx"),
];
