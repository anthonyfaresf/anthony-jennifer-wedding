export default function Footer() {
  return (
    <footer className="px-6 py-12 text-center w-full">
      <div className="max-w-md mx-auto">
        {/* Gold rule above signature — gives the empty cream around the
            block visual weight without filling it with content. */}
        <div className="w-20 h-px bg-gold mx-auto mb-10 opacity-70" />
        {/* Monogram — gold cormorant garamond ampersand to match the hero
            and gate (Anthony 2026-05-17 flagged the prior italianno cursive
            as "another font you used please fix it"). */}
        <div
          className="font-display leading-none mb-4 text-ink"
          style={{ fontSize: "clamp(56px, 10vw, 96px)", letterSpacing: "0.01em" }}
        >
          A <span className="text-gold mx-2 align-middle" style={{ fontSize: "0.85em" }}>&amp;</span> J
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
          className="italic text-body/70 mb-8"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(13px, 1.3vw, 16px)",
          }}
        >
          With love, Anthony &amp; Jennifer
        </p>
        {/* AF&U credit per Anthony 2026-05-17 — small, restrained,
            tonal with the cream paper. Subscribe to opening in a new tab. */}
        <p
          className="text-body/40 uppercase"
          style={{ fontSize: "10px", letterSpacing: "0.32em" }}
        >
          Designed &amp; developed by{" "}
          <a
            href="https://www.afandu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-olive-deep/70 hover:text-olive-deep underline-offset-4 hover:underline transition-colors"
          >
            AF&amp;U
          </a>
        </p>
      </div>
    </footer>
  );
}
