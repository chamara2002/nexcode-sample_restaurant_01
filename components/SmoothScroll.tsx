"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { journey, clamp01 } from "@/lib/journey";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    journey.reducedMotion = reduced;

    const update = () => {
      const el = document.getElementById("journey");
      if (!el) return;
      const span = el.offsetHeight - window.innerHeight;
      journey.target = clamp01((window.scrollY - el.offsetTop) / span);
      document.documentElement.style.setProperty("--journey", journey.target.toFixed(4));
    };

    let lenis: Lenis | null = null;
    let tick: ((t: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09 });
      lenis.on("scroll", () => {
        ScrollTrigger.update();
        update();
      });
      tick = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    // Chapter text: each block fades in as its stop arrives and out as the camera moves on
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".chapter__inner").forEach((el, i) => {
        if (i === 0) {
          // the opening chapter is visible on load and only fades out
          gsap.to(el, { autoAlpha: 0, y: reduced ? 0 : -40, scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom 30%", scrub: true } });
          return;
        }
        gsap
          .timeline({ scrollTrigger: { trigger: el.parentElement, start: "top 70%", end: "bottom 30%", scrub: true } })
          .fromTo(el, { autoAlpha: 0, y: reduced ? 0 : 40 }, { autoAlpha: 1, y: 0, duration: 0.3 })
          .to(el, { autoAlpha: 1, duration: 0.4 })
          .to(el, { autoAlpha: 0, y: reduced ? 0 : -40, duration: 0.3 });
      });
    });

    return () => {
      ctx.revert();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);
  return null;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
  if (lenis) lenis.scrollTo(el, { duration: 2.2 });
  else el.scrollIntoView();
}
