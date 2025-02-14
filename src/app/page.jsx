"use client";
import { useContext } from "react";
import LayoutContext from "@context/LayoutContext";
import "./globals.css";
import Link from "next/link";
export default function Home() {
  const { user } = useContext(LayoutContext);
  const cards = [
    { href: "/videos", text: "Videos" },
    { href: "/quizzes", text: "Quizzes" },
    { href: "/classrooms", text: "Classroom" },
  ];

  return (
    <div className="card_container d-flex align-items-center justify-space-evenly container">
      {user &&
        cards.map((card, idx) => {
          return (
            <Link className="cards" href={card.href} key={idx}>
              {card.text}
            </Link>
          );
        })}
    </div>
  );
}
