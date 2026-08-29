import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import {
  Faq,
  Features,
  FinalCta,
  HowItWorks,
  MarketingFooter,
  Pricing,
  ProblemSection,
  RoiSection,
  SocialProof,
} from "@/components/marketing/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <main>
        <Hero />
        <SocialProof />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <RoiSection />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  );
}
