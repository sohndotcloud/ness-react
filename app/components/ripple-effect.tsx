import { useRef } from "react";

export default function CursorRippleLayer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastSpawn = useRef(0);

    function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
        const now = Date.now();
        if (now - lastSpawn.current < 120) return; // throttle: one ripple every 120ms
        lastSpawn.current = now;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement("span");
        ripple.className = "cursor-ripple";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        containerRef.current?.appendChild(ripple);
        setTimeout(() => ripple.remove(), 900);
    }

    return (
        <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            className="absolute inset-0 overflow-hidden pointer-events-auto touch-none"
            aria-hidden="true"
        />
    );
}