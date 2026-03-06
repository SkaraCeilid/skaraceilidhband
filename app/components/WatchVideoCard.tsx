"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";

type WatchVideoCardProps = {
  videoId: string;
  title: string;
  isActive: boolean;
  onActivate: (videoId: string) => void;
};

type YouTubePlayer = {
  destroy: () => void;
  getCurrentTime: () => number;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, string | number>;
    }
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youTubeApiPromise: Promise<YouTubeNamespace> | null = null;
const MOBILE_QUERY = "(max-width: 760px)";

function loadYouTubeIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API can only load in the browser."));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youTubeApiPromise) {
    return youTubeApiPromise;
  }

  youTubeApiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    ) as HTMLScriptElement | null;

    const resolveIfReady = () => {
      if (window.YT?.Player) {
        resolve(window.YT);
        return true;
      }

      return false;
    };

    if (resolveIfReady()) {
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (!resolveIfReady()) {
        reject(new Error("YouTube IFrame API loaded without window.YT.Player."));
      }
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => {
        reject(new Error("Failed to load YouTube IFrame API script."));
      };
      document.head.appendChild(script);
    }
  }).catch((error) => {
    youTubeApiPromise = null;
    throw error;
  });

  return youTubeApiPromise;
}

export default function WatchVideoCard({
  videoId,
  title,
  isActive,
  onActivate,
}: WatchVideoCardProps) {
  const isMobile = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const mediaQuery = window.matchMedia(MOBILE_QUERY);
      const listener = () => onStoreChange();
      mediaQuery.addEventListener("change", listener);
      return () => {
        mediaQuery.removeEventListener("change", listener);
      };
    },
    () => {
      if (typeof window === "undefined") {
        return false;
      }

      return window.matchMedia(MOBILE_QUERY).matches;
    },
    () => false
  );
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [isPopoutOpen, setIsPopoutOpen] = useState(false);
  const [resumeAtSeconds, setResumeAtSeconds] = useState(0);
  const [inlinePlayerKey, setInlinePlayerKey] = useState(0);
  const modalPlayerMountRef = useRef<HTMLDivElement | null>(null);
  const modalPlayerRef = useRef<YouTubePlayer | null>(null);

  const inlineEmbedSrc = useMemo(() => {
    const resumeAt = Math.max(0, Math.floor(resumeAtSeconds));
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&start=${resumeAt}`;
  }, [videoId, resumeAtSeconds]);

  const closePopoutToInline = useCallback(() => {
    const currentTime = modalPlayerRef.current?.getCurrentTime();
    if (typeof currentTime === "number" && Number.isFinite(currentTime)) {
      setResumeAtSeconds(currentTime);
    }

    setIsPopoutOpen(false);
    setIsPlayingInline(true);
    setInlinePlayerKey((value) => value + 1);
  }, []);

  const playInlineInCard = useCallback(() => {
    onActivate(videoId);
    setResumeAtSeconds(0);
    setIsPopoutOpen(false);
    setIsPlayingInline(true);
    setInlinePlayerKey((value) => value + 1);
  }, [onActivate, videoId]);

  const openPopout = useCallback(() => {
    onActivate(videoId);
    setIsPlayingInline(false);
    setIsPopoutOpen(true);
  }, [onActivate, videoId]);

  useEffect(() => {
    if (!isPopoutOpen || !isActive) {
      return;
    }

    let cancelled = false;

    const setupPlayer = async () => {
      try {
        const youTube = await loadYouTubeIframeApi();
        if (cancelled || !modalPlayerMountRef.current) {
          return;
        }

        modalPlayerRef.current = new youTube.Player(modalPlayerMountRef.current, {
          videoId,
          playerVars: {
            autoplay: 1,
            rel: 0,
            playsinline: 1,
            start: Math.max(0, Math.floor(resumeAtSeconds)),
          },
        });
      } catch {
        setIsPopoutOpen(false);
        setIsPlayingInline(true);
        setInlinePlayerKey((value) => value + 1);
      }
    };

    setupPlayer();

    return () => {
      cancelled = true;
      modalPlayerRef.current?.destroy();
      modalPlayerRef.current = null;
    };
  }, [isActive, isPopoutOpen, resumeAtSeconds, videoId]);

  useEffect(() => {
    if (!isPopoutOpen || !isActive) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopoutToInline();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePopoutToInline, isActive, isPopoutOpen]);

  useEffect(() => {
    return () => {
      modalPlayerRef.current?.destroy();
      modalPlayerRef.current = null;
    };
  }, []);

  const showInlinePlayer = isActive && isPlayingInline && !isPopoutOpen;

  return (
    <article className="watch-card" aria-label={title}>
      {showInlinePlayer ? (
        <div className="watch-card__media watch-card__media--playing">
          {!isMobile ? (
            <button
              type="button"
              className="watch-card__popout"
              onClick={openPopout}
              aria-label={`Open popout for ${title}`}
            >
              Pop out
            </button>
          ) : null}
          <iframe
            key={inlinePlayerKey}
            className="watch-card__iframe"
            src={inlineEmbedSrc}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          className="watch-card__media"
          onClick={isMobile ? playInlineInCard : openPopout}
          aria-label={`Play ${title}`}
          aria-haspopup={isMobile ? undefined : "dialog"}
        >
          <Image
            className="watch-card__thumbnail"
            src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            fill
            sizes="(min-width: 900px) 33vw, 100vw"
          />
          <span className="watch-card__play" aria-hidden="true">
            <span className="watch-card__play-icon" />
          </span>
        </button>
      )}

      <p className="watch-card__title">{title}</p>

      {isActive && isPopoutOpen && !isMobile ? (
        <div
          className="watch-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={closePopoutToInline}
        >
          <div className="watch-modal__panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="watch-modal__close"
              onClick={closePopoutToInline}
              aria-label={`Close popout video: ${title}`}
            >
              <span aria-hidden="true">X</span>
            </button>
            <div className="watch-modal__video-wrap">
              <div ref={modalPlayerMountRef} className="watch-modal__player" />
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
