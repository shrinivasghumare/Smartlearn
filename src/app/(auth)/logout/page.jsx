'use client'
import { useContext,useEffect } from "react";
import LayoutContext from "../../context/LayoutContext";

export default function Logout() {
    const { router, setUser } = useContext(LayoutContext);
    console.log("logging out user");
    useEffect(() => {    
      setUser(null);
    }, [])
    
    localStorage.removeItem("user");
    router.push("/login");

    return <>Logging out...</>;
}