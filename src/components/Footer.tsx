export default function Footer() {
  return (
    <footer className="px-6 py-12 text-center w-full">
      <div className="max-w-md mx-auto">
        {/* Gold rule above signature — gives the empty cream around the
            block visual weight without filling it with content. */}
        <div className="w-20 h-px bg-gold mx-auto mb-10 opacity-70" />
        <div
          className="font-display leading-none mb-4 text-ink"
          style={{ fontSize: "clamp(56px, 10vw, 96px)", letterSpacing: "0.01em" }}
        >
          A <span className="text-gold mx-2" style={{ fontFamily: "var(--font-italianno), 'Italianno', cursive", fontSize: "0.9em" }}>&amp;</span> J
        </div>
        <p
          className="uppercase text-olive-deep/85 mb-3"
          style={{ fontSize: "clamp(11px, 1.2vw, 14px)", letterSpacing: "0.5em" }}
        >
          18 &middot; 07 &middot; 2026
        </p>
        <p
          className="uppercase text-olive-deep/65 mb-10"
          style={{ fontSize: "clamp(9px, 1vw, 11px)", letterSpacing: "0.4em" }}
        >
          Couvent Saint Jean &middot; Okaibe &middot; Lebanon
        </p>
        <div className="w-20 h-px bg-gold mx-auto mb-6 opacity-70" />
        <p
          className="italic text-body/70"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(13px, 1.3vw, 16px)",
          }}
        >
          With love, Anthony &amp; Jennifer
        </p>
      </div>
    </footer>
  );
}
