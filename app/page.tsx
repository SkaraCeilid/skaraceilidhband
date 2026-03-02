import SiteHeader from "./components/SiteHeader";
import BioBanner from "./components/BioBanner";
import HeroBanner from "./components/HeroBanner";
import WatchSection from "./components/WatchSection";
import WhySkaraSection from "./components/WhySkaraSection";
import MentionsSection from "./components/MentionsSection";
import BookingsSection from "./components/BookingsSection";
import SectionDivider from "./components/SectionDivider";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#061a2b] text-white">
      <SiteHeader />
      <main className="flex w-full flex-1 flex-col">
        <HeroBanner />
        <SectionDivider className="py-6 md:py-8" />

        <BioBanner />
        <SectionDivider className="py-6 md:py-8" />

        <WatchSection />
        <SectionDivider className="py-6 md:py-8" />

        <WhySkaraSection />
        <SectionDivider className="py-6 md:py-8" />

        <MentionsSection />
        <SectionDivider className="py-6 md:py-8" />

        <BookingsSection />
      </main>
    </div>
  );
}
