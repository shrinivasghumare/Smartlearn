"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import LayoutContext from "../../context/LayoutContext";
const NavBar = () => {
  const { router, user, setUser } = useContext(LayoutContext);
  const pathName = usePathname();

  const navLinks = [{ name: "Home", href: "/" }];

  const handleLogout = () => {
    console.log("logging out user");
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
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
                      {link.name}
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
