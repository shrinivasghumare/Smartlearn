"use client";
import { useContext, useEffect } from "react";
import LayoutContext from "../../context/LayoutContext";

export default function Logout() {
  const { router, setUser } = useContext(LayoutContext);
  console.log("logging out user");
  useEffect(() => {
    setUser(null);
    router.push("/login");
    localStorage.clear();
  }, []);

  return <>Logging out...</>;
}
