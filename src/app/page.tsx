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

export default function Home() {
  return (
    <main className="bg-cream text-body">
      {/* Skip-to-RSVP — first focusable for keyboard/screen-reader users.
          Per 2026 a11y research (Knot Marble pattern). */}
      <SkipLink />
      {/* Envelope restored 2026-05-15 per Anthony — sealed "door" gate before
          the hero. Tap the wax seal to open, then "Enter" to dismiss the
          overlay and reveal the rest of the site. SessionStorage skip on
          subsequent visits so it doesn't replay all day. */}
      <Envelope />
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
