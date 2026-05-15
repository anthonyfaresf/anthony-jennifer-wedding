import Hero from "@/components/Hero";
import Envelope from "@/components/Envelope";
import Countdown from "@/components/Countdown";
import Story from "@/components/Story";
import Photos from "@/components/Photos";
import Venue from "@/components/Venue";
import Schedule from "@/components/Schedule";
import RSVP from "@/components/RSVP";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";

export default function Home() {
  return (
    <main className="bg-cream text-body">
      {/* Envelope restored 2026-05-15 per Anthony — sealed "door" gate before
          the hero. Tap the wax seal to open, then "Enter" to dismiss the
          overlay and reveal the rest of the site. SessionStorage skip on
          subsequent visits so it doesn't replay all day. */}
      <Envelope />
      <AudioPlayer />
      <Hero />
      <Countdown />
      <Story />
      <Photos />
      <Venue />
      <Schedule />
      <RSVP />
      <FAQ />
      <Footer />
    </main>
  );
}
