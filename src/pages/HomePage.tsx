import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import mengoBadge from "@/assets/mengo-badge.jpg";
import { WhoWeAre, CabinetGrid } from "@/components/CabinetSection";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

function PublicBlogSection() {
  const [blogs, setBlogs] = useState<any[]>([]);
  useEffect(() => {
    api.get("/blogs/").then(({ data }) => setBlogs(data.results || [])).catch(() => {});
  }, []);

  if (blogs.length === 0) return null;

  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">Pillar News & Announcements</h2>
          <p className="text-sm text-muted-foreground mt-2">Updates from the Publicity Office</p>
        </div>
        <div className="mx-auto max-w-4xl space-y-4">
          {blogs.map(b => (
            <div key={b.id} className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="font-bold text-lg">{b.title}</h3>
              <p className="text-xs text-primary mb-3 font-medium">{b.author} • {new Date(b.created_at).toLocaleDateString()}</p>
              
              {b.media_url && b.media_type === "image" && (
                <div className="my-4 overflow-hidden rounded-lg bg-muted text-center border shadow-sm">
                  <img src={b.media_url} alt="Blog Attachment" className="max-h-[60vh] w-full object-contain mx-auto" />
                </div>
              )}
              {b.media_url && b.media_type === "video" && (
                <div className="my-4 overflow-hidden rounded-lg bg-muted border shadow-sm flex justify-center">
                  <video src={b.media_url} controls className="max-h-[60vh] w-full max-w-3xl" />
                </div>
              )}

              <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-wrap">{b.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero — compact for mobile */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 flex flex-col items-center px-4 py-16 text-center sm:py-24 md:py-32">
          <img src={mengoBadge} alt="Mengo Badge" className="mb-4 h-20 w-20 rounded-full border-4 border-gold object-cover shadow-xl sm:h-28 sm:w-28" />
          <h1 className="font-serif text-3xl font-extrabold text-primary-foreground sm:text-4xl md:text-6xl">
            Mengo Senior School
            <span className="mt-1 block text-gold-light text-2xl sm:text-3xl md:text-5xl">Student Council</span>
          </h1>
          <p className="mx-auto mt-1 text-xs font-medium text-gold-light/80 italic sm:text-sm">"Akwana Akira Ayomba"</p>
          <p className="mx-auto mt-4 max-w-xl text-sm text-primary-foreground/80 sm:text-lg">
            Serving with integrity, representing every voice, building a better school.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="hero" size="default" asChild>
              <Link to="/student-voice"><MessageSquare className="mr-2 h-4 w-4" /> Student Voice</Link>
            </Button>
            <Button variant="hero-outline" size="default" asChild>
              <Link to="/login">Portal <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicBlogSection />
      <WhoWeAre />
      <CabinetGrid />

      {/* CTA — compact */}
      <section className="bg-hero-gradient py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-primary-foreground sm:text-3xl md:text-4xl">Your Voice Matters</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80">
            Have an idea, complaint, or project? Submit it through Student Voice.
          </p>
          <Button variant="hero" className="mt-6" asChild>
            <Link to="/student-voice">Submit Now</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
