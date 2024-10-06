"use client";
import Navbar from "./_components/_navbar/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LayoutContext from "./context/LayoutContext";
import Script from "next/script";
import Login from "./(auth)/login/page";
const RootLayout = ({ children }) => {
  const [user, setUser] = useState();
  // function used to authenticate the user before going to any other page!
  const router = useRouter();
  useEffect(() => {
    const Checkuser = () => {
      const userDetails = JSON.parse(localStorage.getItem("user"));
      // !userDetails ? router.push("/login") : setUser(userDetails);
      if (!userDetails) {
        router.push("/login");
      } else {
        setUser(userDetails);
      }
    };
    Checkuser();
  }, [router]);

  const Layoutprops = { user, setUser, router };

  return (
    <LayoutContext.Provider value={Layoutprops}>
      <html lang="en">
        <head>
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
            crossOrigin="anonymous"
          />
          <title>Vidyagram</title>
        </head>
        <body>
          <Navbar />
          <div className="mt-4" />
          {user ? children : <Login />}
          <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        </body>
      </html>
    </LayoutContext.Provider>
  );
};
export default RootLayout;
