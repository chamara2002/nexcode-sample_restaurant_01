"use client";
import dynamic from "next/dynamic";
import { LangProvider } from "@/components/LangProvider";
import SmoothScroll from "@/components/SmoothScroll";
import { Booking, FloatingChat, Header, Journey, Menu, ProgressRail, Visit } from "@/components/Sections";

const Experience = dynamic(() => import("@/components/three/Experience"), { ssr: false });

export default function Client() {
  return (
    <LangProvider>
      <Experience />
      <SmoothScroll />
      <Header />
      <ProgressRail />
      <main id="top">
        <Journey />
        <Menu />
        <Booking />
        <Visit />
      </main>
      <FloatingChat />
    </LangProvider>
  );
}
