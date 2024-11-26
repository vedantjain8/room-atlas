import React from "react";
import Link from "next/link";
import styles from "./not-found.module.css";

const funnyLines = [
  "Oops! The page you're looking for has vanished into thin air.",
  "404: This isn't the page you're looking for. Move along.",
  "Our web developer misplaced this page. Sorry about that!",
  "The page is missing... or maybe it was never here?",
  "Looks like someone forgot to pay the page rent. It's evicted.",
  "404: The Bermuda Triangle strikes again.",
  "Oops! We hit a dead end. 🚧",
  "This page took a vacation without telling us. 😢",
  "Lost in the web labyrinth? Grab this link back home! 🕸️",
  "404: The only thing you'll find here is disappointment.",
];

export const metadata = {
  title: "404: Page Not Found",
};

export default function NotFound() {
  const randomLine = funnyLines[Math.floor(Math.random() * funnyLines.length)];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>404</h1>
        <p className={styles.subtitle}>Page Not Found</p>
        <p className={styles.description}>{randomLine}</p>
        <Link href="/" passHref>
          <p className={styles.button}>Take Me Home</p>
        </Link>
      </div>
    </div>
  );
}
