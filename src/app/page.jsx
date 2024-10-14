"use client";
import { useContext } from "react";
import LayoutContext from "./context/LayoutContext";
import "./globals.css";
import Link from "next/link";
export default function Home() {
  const props = useContext(LayoutContext);
  const cards = [
    { href: "/videos", text: "Videos" },
    { href: "/quizzes", text: "Quizzes" },
    { href: "/notes", text: "Notes" },
    { href: "/assignments", text: "Assignments" },
  ];

  return (
    <div className="hero_page">
      {props.user && (
        <>
          <h1 className="container font-monospace">Hello! {props.user.username}</h1>
          <div className="card_container d-flex align-items-center justify-space-evenly container">
            {cards.map((card, idx) => {
              return (
                <Link className="cards" href={card.href} key={idx}>
                  {card.text}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
