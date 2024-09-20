"use client";
import { useContext } from "react";
import LayoutContext from "./context/LayoutContext";
export default function Home() {
  const props = useContext(LayoutContext); //get the props
  props.checkuser(); //check if the user is logged in or not
  return (
    <>
      <h1>Welcome to home page {props.user?.username} !</h1>
      <p>{props.title}</p>
    </>
  );
}
