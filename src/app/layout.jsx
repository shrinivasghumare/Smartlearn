"use client";
import Navbar from "./_components/navbar/page";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LayoutContext from "./context/LayoutContext";
import Script from "next/script";
const RootLayout = ({ children }) => {
  const [user, setUser] = useState();
  // function used to authenticate the user before going to any other page!
  const router = useRouter();
  const pathName = usePathname();
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
  }, [router, pathName]);

  const Layoutprops = { user, setUser, router};

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
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf_viewer.min.css"
          />
          <title>Vidyagram</title>
        </head>
        <body>
          <Navbar />
          {children}
          <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
          <Script
            type="module"
            src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs"
            strategy="lazyOnload"
          />
          <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.mjs"
            type="module"
            strategy="lazyOnload"
          />
        </body>
      </html>
    </LayoutContext.Provider>
  );
};
export default RootLayout;
