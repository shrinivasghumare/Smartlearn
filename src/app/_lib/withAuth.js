"use client";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function withAuth(WrappedComponent) {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        router.push("/login");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
}
