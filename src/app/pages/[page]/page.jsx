"use client";
import { useContext } from "react";
import LayoutContext from "../../context/LayoutContext";

export default function Page({ params }) {
  const Layoutprops = useContext(LayoutContext);
  Layoutprops.checkuser();
  return (
    <>
      <h1>Welcome to {params.page} page!</h1>
    </>
  );
}
