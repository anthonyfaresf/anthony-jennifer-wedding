export default function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-ink/10 text-center">
      <div className="max-w-md mx-auto">
        <div className="font-display text-3xl text-ink mb-2">
          A <span className="text-gold mx-1">&</span> J
        </div>
        <p className="text-xs uppercase tracking-[0.4em] text-olive-deep mb-6">
          18 · 07 · 2026
        </p>
        <div className="w-12 h-px bg-gold mx-auto mb-6" />
        <p className="text-xs text-body/60 italic">
          With love, Anthony &amp; Jennifer
        </p>
      </div>
    </footer>
  );
}
