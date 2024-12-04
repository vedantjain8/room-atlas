// app/loading.tsx

import React from "react";
import styles from "./loading.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>
        Hold tight, we&apos;re loading your content...
      </p>
    </div>
  );
}
