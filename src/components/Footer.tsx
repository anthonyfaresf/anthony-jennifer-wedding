export default function Footer() {
  return (
    <footer className="px-6 py-16 sm:py-20 text-center w-full">
      <div className="max-w-2xl mx-auto">
        {/* Bigger / more breathing per Anthony 2026-05-17 v19 — fills the
            slot so the empty cream feels intentional. */}
        <div className="w-28 h-px bg-gold mx-auto mb-14 opacity-70" />
        <div
          className="font-display leading-none mb-7 text-ink"
          style={{ fontSize: "clamp(88px, 16vw, 168px)", letterSpacing: "0.01em" }}
        >
          A <span className="text-gold mx-2 align-middle" style={{ fontSize: "0.85em" }}>&amp;</span> J
        </div>
        <p
          className="uppercase text-olive-deep/90 mb-4"
          style={{ fontSize: "clamp(16px, 1.9vw, 22px)", letterSpacing: "0.5em" }}
        >
          18 &middot; 07 &middot; 2026
        </p>
        <p
          className="uppercase text-olive-deep/75 mb-14"
          style={{ fontSize: "clamp(12px, 1.4vw, 16px)", letterSpacing: "0.4em" }}
        >
          Couvent Saint Jean &middot; Okaibe &middot; Lebanon
        </p>
        <div className="w-28 h-px bg-gold mx-auto mb-9 opacity-70" />
        <p
          className="text-body/75 mb-12"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(20px, 2.4vw, 30px)",
          }}
        >
          With love, Anthony &amp; Jennifer
        </p>
        <p
          className="text-body/45 uppercase"
          style={{ fontSize: "clamp(11px, 1.1vw, 13px)", letterSpacing: "0.32em" }}
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
