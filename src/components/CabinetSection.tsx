import { Users, Award, Shield } from "lucide-react";

const CABINET_MEMBERS = [
  { name: "Chairperson", position: "Chairperson", initials: "CH" },
  { name: "Vice Chairperson", position: "Vice Chairperson", initials: "VC" },
  { name: "Speaker", position: "Speaker", initials: "SP" },
  { name: "Deputy Speaker", position: "Deputy Speaker", initials: "DS" },
  { name: "General Secretary", position: "General Secretary", initials: "GS" },
  { name: "Asst. General Secretary", position: "Assistant General Secretary", initials: "AG" },
  { name: "Secretary Finance", position: "Secretary Finance", initials: "SF" },
  { name: "Secretary Welfare", position: "Secretary Welfare", initials: "SW" },
  { name: "Secretary Health", position: "Secretary Health", initials: "SH" },
  { name: "Secretary Women Affairs", position: "Secretary Women Affairs", initials: "WA" },
  { name: "Secretary Publicity", position: "Secretary Publicity", initials: "PB" },
  { name: "Secretary PWDs", position: "Secretary Persons with Disabilities", initials: "PD" },
  { name: "Patron", position: "Patron", initials: "PT" },
  { name: "Electoral Commission", position: "Electoral Commission", initials: "EC" },
];

export function CabinetGrid() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            The Cabinet
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Meet the leaders driving positive change across Mengo Senior School.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CABINET_MEMBERS.map((m) => (
            <div
              key={m.position}
              className="group flex flex-col items-center rounded-xl border bg-card p-4 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
            >
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {m.initials}
              </div>
              <p className="text-sm font-semibold text-card-foreground">{m.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.position}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhoWeAre() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
            <Award className="h-7 w-7 text-gold" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Who We Are
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            The Mengo Senior School Student Council is the elected body representing the voice of every
            student. We bridge the gap between the student body and the school administration, championing
            welfare, academic excellence, discipline, and holistic development. Our council is composed of
            14 dedicated officers who serve with integrity, accountability, and a passion for positive change.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {[
            { icon: Shield, title: "Integrity", desc: "Leading by example with honesty and transparency in all we do." },
            { icon: Users, title: "Representation", desc: "Every student's voice matters. We listen, advocate, and act." },
            { icon: Award, title: "Excellence", desc: "Striving for the highest standards in academics and service." },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <v.icon className="mx-auto mb-3 h-8 w-8 text-gold" />
              <h3 className="font-serif text-lg font-bold text-card-foreground">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
