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
import PaperStackScale from "@/components/PaperStackScale";

export default function Home() {
  return (
    <main className="bg-cream text-body">
      {/* Skip-to-RSVP — first focusable for keyboard/screen-reader users.
          Per 2026 a11y research (Knot Marble pattern). */}
      <SkipLink />
      {/* Envelope — single-tap entrance. Tap the wax seal → envelope opens
          + invite holds ~1.4s → fades to hero. Music starts on that same
          gesture. SessionStorage skip on subsequent visits. */}
      <Envelope />
      {/* Sticky pill nav — appears after hero scrolls past, IntersectionObserver
          highlights active section. */}
      <StickyNav />
      <AudioPlayer />
      {/*
        PAPER STACK — sections after Hero+Story stack on top of each other
        as you scroll, like a deck of cards being laid down. Each `.paper`
        section is position:sticky / top:0 / min-h-screen with z-index
        incrementing per slot, so the next paper rises up from below and
        physically covers the previous one (which stays pinned underneath).
        Apple AirPods / Pirelli wallpaper pattern.

        Hero + Story are NOT in the stack — they have their own internal
        scrub timelines (FrameSequence pin + horizontal Story scenes) that
        would conflict with an outer sticky parent. Hero plays its own film,
        Story horizontals its scenes, then the stack begins at Countdown.
      */}
      {/* Drives the scroll-bound scale-down on each outgoing paper so the
          stack reads as physical depth (next paper rises over previous,
          previous visibly recedes underneath). */}
      <PaperStackScale />
      <Hero />
      <Story />
      <div className="paper-stack-root">
        <section className="paper-slot" data-paper="1"><Countdown /></section>
        <section className="paper-slot" data-paper="2"><Venue /></section>
        <section className="paper-slot" data-paper="3"><Schedule /></section>
        <section className="paper-slot" data-paper="4"><RSVP /></section>
        <section className="paper-slot" data-paper="5"><FAQ /></section>
        <section className="paper-slot" data-paper="6"><Footer /></section>
      </div>
    </main>
  );
}
