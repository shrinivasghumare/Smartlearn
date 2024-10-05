"use client";
import LayoutContext from "../../../context/LayoutContext";
import { useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./styles.css";
import "../../../globals.css";
import Link from "next/link";
export default function videoLayout({ children, params }) {
  const LayoutProps = useContext(LayoutContext);
  const [navVisible, setNavVisible] = useState(false);
  const [modules, setModules] = useState();
  LayoutProps.checkuser();
  useEffect(() => {
    setModules(JSON.parse(localStorage.getItem("modules")) || null);
  }, []);

  const pathName = usePathname();
  return (
    <>
      <div className="videoLayout d-flex">
        {navVisible && (
          <div className="videoNav nav nav-tabs pt-3">
            {modules.map((module, index) => {
              const module_href = `/videos/${module?.replaceAll(" ", "_")}`;

              return (
                <Link
                  key={index}
                  href={module_href}
                  className={`nav-link ${
                    pathName === module_href ? "active" : ""
                  }`}
                >
                  <p className="tab">{module}</p>
                </Link>
              );
            })}
          </div>
        )}
        {children}
        <div
          className="showNavBtn btn btn-dark m-1"
          onClick={() => setNavVisible((x) => !x)}
        >
          {navVisible ? <X_Square /> : <ThreeDots />}
        </div>
      </div>
    </>
  );
}

function X_Square({}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-x-square"
      viewBox="0 0 16 16"
    >
      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
    </svg>
  );
}

function ThreeDots({}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-three-dots"
      viewBox="0 0 16 16"
    >
      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
    </svg>
  );
}
