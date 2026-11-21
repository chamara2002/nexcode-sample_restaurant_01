"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { L } from "@/lib/content";

type Lang = "en" | "si";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (s: L) => string }>({
  lang: "en",
  setLang: () => {},
  t: (s) => s.en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "si" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  return <Ctx.Provider value={{ lang, setLang, t: (s) => s[lang] }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
