"use client";
import LayoutContext from "../../context/LayoutContext";
import { useContext } from "react";
export default function QuizLayout({ children }) {
  const props = useContext(LayoutContext);
  props.checkuser();
  return <>{props.user && children}</>;
}
