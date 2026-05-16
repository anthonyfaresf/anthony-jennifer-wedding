// Per Anthony 2026-05-16 (second pass): the static VerseOpener was wrong.
// He wanted a CINEMATIC click-to-enter gate over the animated olive/wine/
// Couvent watercolor sequence, followed by the original animated Hero (wine
// cheers scrub on scroll). VerseOpener archived; VerseGate (animated +
// click-to-enter) + restored Hero are now wired in.
import VerseGate from "@/components/VerseGate";
import Hero from "@/components/Hero";
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
      {/* Skip-to-RSVP — first focusable for keyboard/screen-reader users. */}
      <SkipLink />
      {/* Cinematic verse gate — animated olive/wine/Couvent watercolor +
          Song of Solomon 3:4 + couple + date + venue. Tap to enter →
          fades to hero. Skipped on second visit via sessionStorage. */}
      <VerseGate />
      {/* Sticky pill nav — appears after hero scrolls past */}
      <StickyNav />
      <AudioPlayer />
      {/* PAPER STACK scale-down driver — every paper-slot below shrinks
          as the next paper rises over it. */}
      <PaperStackScale />
      {/* Hero — wine-cheers 31-frame canvas scrub with the invitation
          glass-card. The animation lives here, not in the gate. */}
      <Hero />
      {/*
        INTERLEAVED STORY + INFO — per Anthony 2026-05-16: instead of
        "all story up front, all info at the end," each watercolor
        scene is followed by an info card that stacks on top.

        Story Scene 1 (Meeting)   → Countdown card
        Story Scene 2 (Promise)   → Venue card
        Story Scene 3 (Wedding)   → Schedule card
        Then RSVP + FAQ + Footer round out the stack.

        Story.tsx renders all 3 scenes in one component for now;
        next pass splits it into <StoryScene index={n} /> so cards
        can sit BETWEEN scenes, not after all of them. This iteration
        moves the info cards EARLIER in the scroll so they're not all
        dumped at the end — partial fix while the refactor lands.
      */}
      {/* INTERLEAVED scroll — story photo → info card → photo → info card.
          Each Story scene is followed by an info card that paper-stacks on
          top per the existing paper-stack pattern. */}
      <Story only="intro" />
      <Story only={0} />
      <div className="paper-stack-root">
        <section className="paper-slot" data-paper="1"><Countdown /></section>
      </div>
      <Story only={1} />
      <div className="paper-stack-root">
        <section className="paper-slot" data-paper="1"><Venue /></section>
      </div>
      <Story only={2} />
      <div className="paper-stack-root">
        <section className="paper-slot" data-paper="1"><Schedule /></section>
        <section className="paper-slot" data-paper="2"><RSVP /></section>
        <section className="paper-slot" data-paper="3"><FAQ /></section>
        <section className="paper-slot" data-paper="4"><Footer /></section>
      </div>
    </main>
  );
}
