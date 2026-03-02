"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function BioBanner() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`about-section ${isVisible ? "is-visible" : ""}`}
      aria-label="About Skara"
    >
      <div className="about-section__inner">
        <div className="about-section__content">
          <p className="about-section__eyebrow">About</p>
          <h2 className="about-section__title">
            Traditional roots.
            <br />
            Modern lift.
          </h2>
          <p className="about-section__text">
            Skara is a four-piece ceilidh line-up blending fiddle, pipes, guitar and drums
            into a polished live sound that keeps dance floors moving.
          </p>
        </div>

        <div className="about-section__media">
          <Image
            src="/bio-banner.jpg"
            alt="Skara band members with instruments"
            width={1600}
            height={980}
            sizes="(max-width: 1023px) 100vw, 62vw"
            className="about-section__image"
          />
          <div className="about-section__media-fade" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
