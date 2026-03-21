import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, FileText, MessageSquare, Users } from "lucide-react";

const stats = [
  { label: "Student Voices", value: "—", icon: MessageSquare, color: "text-primary" },
  { label: "Open Issues", value: "—", icon: AlertTriangle, color: "text-gold" },
  { label: "Programmes", value: "—", icon: Calendar, color: "text-primary" },
  { label: "Documents", value: "—", icon: FileText, color: "text-gold" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground">Welcome back!</h1>
      <p className="mt-1 text-muted-foreground">Here's an overview of your council activities.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-card-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>
            Enable Lovable Cloud to activate authentication, database, and all council features.
            Once connected, your dashboard will populate with real-time data from all council modules.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
