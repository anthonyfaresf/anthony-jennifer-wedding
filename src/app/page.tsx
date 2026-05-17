// Per Anthony 2026-05-16 (second pass): the static VerseOpener was wrong.
// He wanted a CINEMATIC click-to-enter gate over the animated olive/wine/
// Couvent watercolor sequence, followed by the original animated Hero (wine
// cheers scrub on scroll). VerseOpener archived; VerseGate (animated +
// click-to-enter) + restored Hero are now wired in.
import VideoGate from "@/components/VideoGate";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Story from "@/components/Story";
import Venue from "@/components/Venue";
import RSVP from "@/components/RSVP";
import Gifts from "@/components/Gifts";
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
      {/* SSR-rendered prepaint cover — opaque wax-seal frame visible from
          the very first paint so hero never flashes through. Hidden by
          .aj-gate-passed class (set inline in layout when session flag
          already exists, OR by VideoGate on dismount). */}
      <div className="aj-prepaint-cover" aria-hidden />
      {/* Cinematic video gate — tap the wax seal to open. */}
      <VideoGate />
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
      {/* INTERLEAVED PAPER STACK — per Anthony 2026-05-16:
          "after every photo animation plays it lays to the back a bit,
          and then another section stacks on top of it with info, and it locks."

          One paper-stack-root holds EVERYTHING after Hero. Each scene is
          its own paper-slot (with --scene modifier = 200vh for FrameSequence
          scrub). When the next paper-slot rises over a scene, PaperStackScale
          shrinks the scene to 0.88 + dims to brightness 0.82 + lifts y:-24,
          and the rising paper locks on top via sticky + higher z-index.

          Order: intro → Scene1 → Countdown → Scene2 → Venue → Scene3 →
          Schedule → RSVP → FAQ → Footer. Z-indexes 1→10 ascending so each
          new paper covers the previous. */}
      {/* Per Anthony 2026-05-16 + 4-brain consensus: "forget our story."
          New invitation-first order — each section answers the next
          question a guest mentally asks.

          Hero      → WHO (the invitation: families, couple, request)
          Countdown → WHEN (the date + days until)
          Scene 1   → CEREMONY chapter (mass, time)
          Scene 2   → RECEPTION chapter (cocktail, dinner, dancing)
          Scene 3   → DRESS & TRAVEL chapter (formal, route, parking)
          Venue     → WHERE (full Couvent photo + address + map)
          Schedule  → day-of timeline (overlaps with chapters; kept
                      for guests who want the linear list at a glance)
          RSVP      → ACTION
          FAQ       → loose ends (gifts, kids, accommodations)
          Footer    → contact + thanks */}
      {/* STRICT ALTERNATION per Anthony 2026-05-16:
          "1 photo, 1 white page with info, not 2 pages directly after
          each other, not 2 white pages directly after each."
          Every photo (watercolor scene OR venue) is followed by one
          white info card. No back-to-back whites, no back-to-back
          photos. Story intro removed (was redundant white). */}
      {/* v15 simplified order per Anthony 2026-05-17:
          - Schedule moved INTO Story scene 0 as an overlay on the ceremony
            photo (no standalone Schedule slot anymore).
          - FAQ slot replaced with Gifts (registry message + Whish details).
          - Venue collapsed to ONE slot — photo with map-pin overlay link;
            details slot dropped.
          - Story scene 2 (Dress & Travel) removed — info embedded under
            the Venue pin so the slot count stays clean and the photo/white
            alternation holds.
          Strict alternation: white (countdown) → photo (ceremony) → white
          (RSVP) → photo (reception) → white (gifts) → photo (venue) →
          white (footer). 7 slots. */}
      {/* v19 — Celebrate-with-us scene dropped per Anthony 2026-05-17.
          Slots now: countdown · The Day · RSVP · Reception (verse) ·
          Gifts · Venue · Footer (7 total, clean alternation). */}
      <div className="paper-stack-root">
        <section className="paper-slot" data-paper="1"><Countdown /></section>
        <section className="paper-slot paper-slot--scene" data-paper="2">
          <Story only={0} /> {/* Photo — The Day + timeline overlay */}
        </section>
        <section className="paper-slot" data-paper="3"><RSVP /></section>
        <section className="paper-slot paper-slot--scene" data-paper="4">
          <Story only={1} /> {/* Photo — Reception + Matthew 19:9 */}
        </section>
        <section className="paper-slot" data-paper="5"><Gifts /></section>
        <section className="paper-slot" data-paper="6"><Venue slice="hero" /></section>
        <section
          className="paper-slot flex items-center justify-center"
          data-paper="7"
        >
          <Footer />
        </section>
      </div>
    </main>
  );
}
