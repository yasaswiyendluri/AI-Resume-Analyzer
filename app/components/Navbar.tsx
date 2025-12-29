import { Link } from "react-router";

export default function Navbar() {
  return (
    <nav style={{ padding: "16px", borderBottom: "1px solid #ddd" }}>
      <Link to="/" style={{ marginRight: "16px" }}>Home</Link>
      <Link to="/upload" style={{ marginRight: "16px" }}>Upload</Link>
      <Link to="/auth">Auth</Link>
    </nav>
  );
}
