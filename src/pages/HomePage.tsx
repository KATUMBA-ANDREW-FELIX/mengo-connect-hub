import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import schoolCrest from "@/assets/school-crest.png";
import { WhoWeAre, CabinetGrid } from "@/components/CabinetSection";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        <div className="relative z-10 flex flex-col items-center px-4 py-24 text-center md:py-36">
          <img src={schoolCrest} alt="School Crest" className="mb-6 h-24 w-24 drop-shadow-lg" />
          <h1 className="font-serif text-4xl font-extrabold text-primary-foreground md:text-6xl">
            Mengo Senior School
            <span className="mt-2 block text-gold-light">Student Council</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Serving with integrity, representing every voice, and building a better school community together.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="lg" asChild>
              <Link to="/student-voice">
                <MessageSquare className="mr-2 h-5 w-5" />
                Student Voice
              </Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/login">
                Councillor Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <WhoWeAre />
      <CabinetGrid />

      {/* CTA */}
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
            Your Voice Matters
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
            Have a project idea, complaint, or suggestion? Submit it through our Student Voice platform
            and let the council take action.
          </p>
          <Button variant="hero" size="lg" className="mt-8" asChild>
            <Link to="/student-voice">Submit Now</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
