import EntranceSplash from "@/components/EntranceSplash";
import Hero from "@/components/Hero";
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
      <AudioPlayer />
      <EntranceSplash />
      <Hero />
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
