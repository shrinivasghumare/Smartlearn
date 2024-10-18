"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import LayoutContext from "../../context/LayoutContext";
import Image from "next/image";
import logo from "../../assets/vidyagram_logo.png";
import "./styles.css";
const NavBar = () => {
  const { router, user } = useContext(LayoutContext);
  const pathName = usePathname();
  const navLinks = [
    { href: "/", text: "Home" },
    { href: "/videos", text: "Videos" },
    { href: "/quizzes", text: "Quizzes" },
    { href: "/notes", text: "Notes" },
    { href: "/assignments", text: "Assignments" },
  ];

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary rounded">
        <div className="container-fluid">
          <Link
            className="navbar-brand d-flex align-items-center"
            href={user ? "/" : "/login"}
          >
            <Image src={logo} width={50} alt="vidyagram" />
            {`VidyaGram${(user && "-" + user?.roll_no) || ""}`}
          </Link>
          {user && (
            <>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathName === "/"
                        : pathName.startsWith(link.href) && link.href !== "/";

                    return (
                      <li className="nav-item" key={link.href}>
                        <Link
                          href={link.href}
                          className={`nav-link ${isActive ? "active" : ""}`}
                        >
                          {link.text}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <button
                  className="btn btn-outline-dark"
                  onClick={() => router.push("/logout")}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
