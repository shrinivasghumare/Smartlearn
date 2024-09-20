"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import LayoutContext from "../../context/LayoutContext";
import "./styles.css";
const NavBar = () => {
  const { router, user, setUser } = useContext(LayoutContext);
  const pathName = usePathname();

  const navLinks = [
    { href: "/", text: "Home" },
    { href: "/pages/videos", text: "Videos" },
    { href: "/pages/quizzes", text: "Quizzes" },
    { href: "/pages/notes", text: "Notes" },
    { href: "/pages/assignments", text: "Assignments" },
  ];

  const handleLogout = () => {
    console.log("logging out user");
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navbarStyle = {
    top: 0,
    left: 0,
    background: "rgba(255, 255, 255, 0.25)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    borderRadius: "10px 10px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg bg-body-tertiary position-sticky"
        style={navbarStyle}
      >
        <div className="container-fluid">
          <Link className="navbar-brand" href="/">
            {user?.username}
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {navLinks.map((link) => {
                const isActive = pathName.startsWith(link.href);
                return (
                  <li className="nav-item" key={link.href}>
                    <Link
                      href={link.href}
                      className={`nav-link ${isActive && "active"}`}
                    >
                      {link.text}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {!user && (
              <button
                className="btn btn-outline-primary"
                onClick={() => router.push("/login")}
              >
                Login
              </button>
            )}
            {user && (
              <button
                className="btn btn-outline-primary"
                onClick={() => handleLogout()}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
