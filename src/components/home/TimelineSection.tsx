import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent {
  id: string;
  date: string;
  status: "Completed" | "Upcoming" | "In Progress";
  title: string;
  description: string;
  location: string;
}

const EVENTS: TimelineEvent[] = [
  {
    id: "1",
    date: "May 22, 2026",
    status: "Completed",
    title: "Leadership Handover",
    description: "The official handover ceremony where the outgoing prefects pass on their responsibilities to the newly elected council.",
    location: "Main Hall"
  },
  {
    id: "2",
    date: "June 15, 2026",
    status: "Completed",
    title: "First Council Meeting",
    description: "Inaugural meeting of the new cabinet to discuss the term's agenda, allocate duties, and swear in deputies.",
    location: "Board Room"
  },
  {
    id: "3",
    date: "July 20, 2026",
    status: "In Progress",
    title: "Inter-Class Debates",
    description: "Annual debate tournament focusing on current affairs, encouraging public speaking and critical thinking among students.",
    location: "Library"
  },
  {
    id: "4",
    date: "August 05, 2026",
    status: "Upcoming",
    title: "Sports Gala Registration",
    description: "Houses open registration for athletes for the termly intra-school sports competition.",
    location: "Online Portal"
  },
  {
    id: "5",
    date: "September 12, 2026",
    status: "Upcoming",
    title: "Academic Fair",
    description: "Showcasing student projects across sciences and arts to parents and the public.",
    location: "School Quadrangle"
  }
];

export function TimelineSection() {
  return (
    <section className="bg-[#0b0416] py-20 overflow-hidden relative border-t-4 border-gold">
      {/* Decorative blurry gradients background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="text-gold border-gold/30 mb-4 bg-gold/5">MCH 2026</Badge>
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl md:text-5xl mb-4">
            Council Timeline
          </h2>
          <p className="text-sm text-gray-400 sm:text-base">
            From elections to inaugurations, follow our journey through the year. 
            Mark these important dates on your calendar!
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 transform md:-translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-0">
            {EVENTS.map((event, index) => {
               const isEven = index % 2 === 0;
               const StatusIcon = event.status === "Completed" ? CheckCircle2 : event.status === "In Progress" ? CircleDashed : Clock;
               const statusColor = event.status === "Completed" ? "bg-white text-black" : event.status === "In Progress" ? "bg-gold text-white" : "bg-white/10 text-white/70";

               return (
                 <motion.div 
                   key={event.id}
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: "-100px" }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:justify-start' : 'md:justify-end'}`}
                 >
                   {/* Center Dot */}
                   <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gold transform -translate-x-1/2 border-4 border-[#0b0416] z-10 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>

                   {/* Card */}
                   <div className={`ml-12 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'} w-full`}>
                     <div className="bg-[#120822] border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl hover:border-gold/20 transition-colors group">
                       
                       <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                         <div className="flex items-center text-gray-400 text-sm">
                           <Clock className="w-4 h-4 mr-2" />
                           {event.date}
                         </div>
                         <Badge variant="outline" className={`${statusColor} border-none text-[10px] uppercase font-bold tracking-wider py-0.5 px-2`}>
                           <StatusIcon className="w-3 h-3 mr-1" />
                           {event.status}
                         </Badge>
                       </div>

                       <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors">{event.title}</h3>
                       <p className="text-gray-400 text-sm leading-relaxed mb-5">
                         {event.description}
                       </p>

                       <div className="flex items-center text-gray-500 text-xs font-medium">
                         <MapPin className="w-3.5 h-3.5 mr-1.5 text-gold" />
                         {event.location}
                       </div>
                     </div>
                   </div>
                 </motion.div>
               );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
