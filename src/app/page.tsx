import Hero from "@/components/Hero";
import Envelope from "@/components/Envelope";
import Countdown from "@/components/Countdown";
import Story from "@/components/Story";
import Venue from "@/components/Venue";
import Schedule from "@/components/Schedule";
import RSVP from "@/components/RSVP";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import StickyNav from "@/components/StickyNav";
import SkipLink from "@/components/SkipLink";
import PaperStack from "@/components/PaperStack";

export default function Home() {
  return (
    <main className="bg-cream text-body">
      {/* Skip-to-RSVP — first focusable for keyboard/screen-reader users.
          Per 2026 a11y research (Knot Marble pattern). */}
      <SkipLink />
      {/* Envelope restored 2026-05-15 per Anthony — single-tap entrance now.
          Tap the wax seal → envelope opens + invite holds ~1.4s → fades to
          hero. Music starts on that same gesture (AudioPlayer listens for
          first user click). SessionStorage skip on subsequent visits. */}
      <Envelope />
      {/* PaperStack — adds Apple/Linear scroll-stack reveal to each section
          (entry: rise + fade + scale-in, exit: subtle scale-down + dim).
          Skips Hero/Story (they have their own internal scrub timelines).
          Per Anthony 2026-05-15: "sections stack on top like papers". */}
      <PaperStack />
      {/* Sticky pill nav — appears after hero scrolls past, IntersectionObserver
          highlights active section. Per 2026 wedding-site research, this is
          the canonical wayfinding pattern for long-scroll single-page sites. */}
      <StickyNav />
      <AudioPlayer />
      <Hero />
      <Countdown />
      <Story />
      <Venue />
      <Schedule />
      <RSVP />
      <FAQ />
      <Footer />
    </main>
  );
}
