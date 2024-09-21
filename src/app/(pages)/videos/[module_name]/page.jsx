'use client'
import { useContext } from "react";
import LayoutContext from "../../../context/LayoutContext";

export default function Module({ params }) {
  const LayoutProps = useContext(LayoutContext);
  LayoutProps.checkuser();
  return <h1 className="container">This are videos for {params.module_name.toString().replaceAll("_"," ")} module!</h1>;
}
