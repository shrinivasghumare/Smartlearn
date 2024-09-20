"use client";
import Navbar from "./(components)/navbar/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LayoutContext from "./context/LayoutContext";
const RootLayout = ({ children }) => {
  const [user, setUser] = useState();

  // function used to authenticate the user before going to any other page!
  const router = useRouter();
  const checkuser = () => {
    useEffect(() => {
      const userDetails = JSON.parse(localStorage.getItem("user"));
      if (!userDetails) {
        router.push("/login");
      } else setUser(userDetails);
    }, []);
  };

  const Layoutprops = { user, setUser, checkuser,router };

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
          <Navbar/>
          {children}
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossOrigin="anonymous"
          />
        </body>
      </html>
    </LayoutContext.Provider>
  );
};
export default RootLayout;
