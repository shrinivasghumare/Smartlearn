"use client";
import { useContext } from "react";
import LayoutContext from "./context/LayoutContext";
import "./globals.css";
import Link from "next/link";
export default function Home() {
  const props = useContext(LayoutContext); //get the props
  props.checkuser(); //check if the user is logged in or not

  const cards = [
    { href: "/pages/videos", text: "Videos" },
    { href: "/pages/quizzes", text: "Quizzes" },
    { href: "/pages/notes", text: "Notes" },
    { href: "/pages/assignments", text: "Assignments" },
  ];
  return (
    <div className="hero_page">
      <div className="card_container d-flex align-items-center justify-space-evenly">
        {cards.map((card, idx) => {
          return (
            <Link className="cards" href={card.href} key={idx}>
              {card.text}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
