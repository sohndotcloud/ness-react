import { useEffect, useRef } from "react";

export default function CursorRippleLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpawn = useRef(0);

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      const now = Date.now();
      if (now - lastSpawn.current < 120) return; // throttle: one ripple every 120ms
      lastSpawn.current = now;

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "cursor-ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 900);
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
      <div
          ref={containerRef}
          className="absolute inset-0 overflow-hidden pointer-events-none touch-none"
          aria-hidden="true"
      />
  );
}