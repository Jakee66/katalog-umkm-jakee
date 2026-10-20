"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.protocol === "https:") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker terdaftar:", reg.scope);
        })
        .catch((err) => {
          console.warn("PWA Service Worker gagal didaftarkan:", err);
        });
    } else if ("serviceWorker" in navigator && window.location.hostname === "localhost") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker terdaftar (localhost):", reg.scope);
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
