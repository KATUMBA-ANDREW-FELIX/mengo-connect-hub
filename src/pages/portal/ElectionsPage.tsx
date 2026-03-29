import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Download, ShieldCheck, Settings2, UserCheck, Vote, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import jsPDF from "jspdf";
import mengoBadge from "@/assets/mengo-badge.jpg";
import { unsaLogoB64 } from "@/assets/unsaBase64";

interface Applicant {
  id: string;
  applicant_name: string;
  class: string;
  stream?: string;
  average_score: number; // Serves as the Total / 30
  smart_score?: number;
  conf_score?: number;
  qapp_score?: number;
  comment?: string;
  gender: string;
  status: string;
}

export default function ElectionsPage() {
  const { user, hasAnyRole } = useAuth();
  const isTopHead = hasAnyRole(["patron", "chairperson", "speaker", "electoral_commission"]);

  const [minAverage, setMinAverage] = useState(15);
  const [electionTitle, setElectionTitle] = useState("S.2 Councillors 2026");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Add candidate form
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newStream, setNewStream] = useState("");
  const [newGender, setNewGender] = useState("male");
  const [newSmart, setNewSmart] = useState("");
  const [newConf, setNewConf] = useState("");
  const [newQapp, setNewQapp] = useState("");
  const [newComment, setNewComment] = useState("");

  // Filtering
  const [filterSearch, setFilterSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStream, setFilterStream] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [computedAverage, setComputedAverage] = useState<number | null>(null);

  // Edit Candidate
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editClass, setEditClass] = useState("");
  const [editStream, setEditStream] = useState("");
  const [editGender, setEditGender] = useState("male");
  const [editSmart, setEditSmart] = useState("");
  const [editConf, setEditConf] = useState("");
  const [editQapp, setEditQapp] = useState("");
  const [editComment, setEditComment] = useState("");

  // EC access delegation
  const [grants, setGrants] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [grantUserId, setGrantUserId] = useState("");

  const fetchApplicants = async () => {
    try {
      const { data } = await api.get("/applications/");
      const entries = Array.isArray(data) ? data : data.results || [];
      setApplicants(entries);
    } catch(e) { console.error("Failed to load applicants", e); }
    finally { setLoading(false); }
  };

  const fetchGrants = async () => {
    try {
      const { data } = await api.get("/ec-access-grants/");
      setGrants(Array.isArray(data) ? data : data.results || []);
    } catch(e) { console.error(e); }
  };

  const fetchProfiles = async () => {
    try {
      const { data } = await api.get("/users/all-profiles/");
      setAllProfiles(Array.isArray(data) ? data : data.results || []);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    fetchApplicants();
    if (isTopHead) { fetchGrants(); fetchProfiles(); }
  }, []);

  const filteredApplicants = applicants.filter((a) => {
    let match = true;
    if (filterSearch && !a.applicant_name.toLowerCase().includes(filterSearch.toLowerCase())) match = false;
    if (filterClass !== "all" && a.class?.toLowerCase() !== filterClass.toLowerCase()) match = false;
    if (filterStream !== "all" && (a as any).stream?.toLowerCase() !== filterStream.toLowerCase()) match = false;
    if (filterGender !== "all" && a.gender?.toLowerCase() !== filterGender) match = false;
    return match;
  });

  const uniqueClasses = Array.from(new Set(applicants.map(a => a.class).filter(Boolean)));
  const uniqueStreams = Array.from(new Set(applicants.map(a => (a as any).stream).filter(Boolean)));

  const qualified = filteredApplicants.filter((a) => a.status === "qualified").length;
  const disqualified = filteredApplicants.filter((a) => a.status === "disqualified").length;

  const handleComputeAverage = () => {
    if (filteredApplicants.length === 0) {
      toast.error("No candidates in current filter");
      return;
    }
    const total = filteredApplicants.reduce((sum, a) => sum + a.average_score, 0);
    const avg = Math.round(total / filteredApplicants.length);
    setComputedAverage(avg);
    setMinAverage(avg);
    toast.success(`Computed Avg Total: ${avg}/30. Set as new screening minimum!`);
  };

  const handleAddCandidate = async () => {
    if (!newName || !newClass || !newGender || !newSmart || !newConf || !newQapp) {
      toast.error("Fill all required fields"); return;
    }
    const totalScore = Number(newSmart) + Number(newConf) + Number(newQapp);
    try {
      await api.post("/applications/", {
        applicant_name: newName,
        applicant_class: newClass,
        stream: newStream || null,
        gender: newGender,
        smart_score: Number(newSmart),
        conf_score: Number(newConf),
        qapp_score: Number(newQapp),
        comment: newComment || null,
        average_score: totalScore,
        status: "pending",
      });
      toast.success("Candidate added!");
      setAddOpen(false);
      setNewName(""); setNewClass(""); setNewStream(""); 
      setNewGender("male"); setNewSmart(""); setNewConf(""); setNewQapp(""); setNewComment("");
      fetchApplicants();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to add candidate");
    }
  };

  const openEditModal = (a: any) => {
    setEditingId(a.id);
    setEditName(a.applicant_name);
    setEditClass(a.class || "");
    setEditStream(a.stream || "");
    setEditGender(a.gender || "male");
    setEditSmart(a.smart_score?.toString() || "");
    setEditConf(a.conf_score?.toString() || "");
    setEditQapp(a.qapp_score?.toString() || "");
    setEditComment(a.comment || "");
  };

  const saveEditCandidate = async () => {
    if (!editingId) return;
    const smart = Number(editSmart || 0);
    const conf = Number(editConf || 0);
    const qapp = Number(editQapp || 0);
    const average_score = smart + conf + qapp;

    try {
      await api.patch(`/applications/${editingId}/`, {
        applicant_name: editName,
        class: editClass,
        stream: editStream,
        gender: editGender,
        smart_score: smart,
        conf_score: conf,
        qapp_score: qapp,
        average_score,
        comment: editComment
      });
      toast.success("Candidate updated!");
      setEditingId(null);
      fetchApplicants();
    } catch(e) {
      toast.error("Failed to update candidate");
    }
  };

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Are you sure you want to completely remove this candidate?")) return;
    try {
      await api.delete(`/applications/${id}/`);
      toast.success("Candidate removed");
      fetchApplicants();
    } catch (e) {
      toast.error("Failed to delete candidate");
    }
  };

  const handleAutoScreen = async () => {
    try {
      await api.post("/applications/auto-screen/", { min_average: minAverage });
      toast.success(`Screened using min target of ${minAverage}/30`);
      fetchApplicants();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Failed to autoscreen");
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "qualified" ? "disqualified" : "qualified";
    try {
      await api.patch(`/applications/${id}/`, { status: next });
      fetchApplicants();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const grantAccess = async () => {
    if (!grantUserId || !user) return;
    try {
      await api.post("/ec-access-grants/", {
        granted_to: grantUserId,
      });
      toast.success("Access granted!"); 
      fetchGrants(); 
      setGrantUserId("");
    } catch(e: any) {
      toast.error(e.response?.data?.detail || "Error granting access");
    }
  };

  const revokeAccess = async (id: string) => {
    try {
      await api.delete(`/ec-access-grants/${id}/`);
      toast.success("Access revoked");
      fetchGrants();
    } catch (e) {
      toast.error("Error revoking access");
    }
  };

  const getDynamicTitle = () => {
    let parts = [];
    if (filterClass !== "all") parts.push(filterClass);
    if (filterStream !== "all") parts.push(filterStream);
    if (filterGender !== "all") parts.push(filterGender);
    
    if (parts.length > 0) {
       return `${parts.join(" ")} - ${electionTitle}`.toUpperCase();
    }
    return electionTitle.toUpperCase();
  };

  const generateBallotPDF = () => {
    const qual = filteredApplicants.filter((a) => a.status === "qualified");
    if (!qual.length) { toast.error("No qualified applicants in current filter"); return; }
    const males = qual.filter((a) => a.gender === "male");
    const females = qual.filter((a) => a.gender === "female");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const m = 15;
    let y = 15;

    doc.setFont("helvetica", "bold"); doc.setFontSize(20);
    doc.text("MENGO SENIOR SCHOOL", pageW / 2, y, { align: "center" });
    y += 7; doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text("Kampala, Uganda", pageW / 2, y, { align: "center" });
    y += 4; doc.setFontSize(9);
    doc.text('"Akwana Akira Ayomba"', pageW / 2, y, { align: "center" });
    y += 6;
    doc.setDrawColor(128, 0, 32); doc.setLineWidth(1);
    doc.line(m, y, pageW - m, y); y += 8;
    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("OFFICIAL BALLOT PAPER", pageW / 2, y, { align: "center" });
    y += 7; doc.setFontSize(13);
    doc.text(getDynamicTitle(), pageW / 2, y, { align: "center" });
    y += 6; doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text("Instructions: Tick (\u2713) ONE candidate in each category.", pageW / 2, y, { align: "center" });
    doc.setTextColor(0); y += 10;

    const drawCat = (title: string, cands: Applicant[], startY: number) => {
      let cy = startY;
      if (cy > 250) { doc.addPage(); cy = 20; }
      doc.setFillColor(128, 0, 32);
      doc.rect(m, cy, pageW - m * 2, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.setTextColor(255); doc.text(title, pageW / 2, cy + 6.5, { align: "center" });
      doc.setTextColor(0); cy += 11;
      doc.setFillColor(240, 240, 240);
      doc.rect(m, cy, pageW - m * 2, 7, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("No.", m + 4, cy + 5); doc.text("Candidate Name", m + 18, cy + 5);
      doc.text("Class", m + 90, cy + 5); doc.text("Stream", m + 120, cy + 5);
      doc.text("Tick", pageW - m - 12, cy + 5); cy += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      cands.forEach((c, idx) => {
        if (cy > 270) { doc.addPage(); cy = 20; }
        if (idx % 2 === 0) { doc.setFillColor(250, 250, 250); doc.rect(m, cy, pageW - m * 2, 10, "F"); }
        doc.setDrawColor(200); doc.setLineWidth(0.3); doc.line(m, cy + 10, pageW - m, cy + 10);
        doc.setTextColor(0); doc.text(`${idx + 1}.`, m + 4, cy + 7);
        doc.setFont("helvetica", "bold"); doc.text(c.applicant_name.toUpperCase(), m + 18, cy + 7);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100);
        doc.text(c.class || '', m + 90, cy + 7);
        doc.text(c.stream || "", m + 120, cy + 7);
        doc.setTextColor(0); doc.setFontSize(10);
        doc.setDrawColor(128, 0, 32); doc.setLineWidth(0.5);
        doc.rect(pageW - m - 14, cy + 2, 7, 7); cy += 10;
      });
      return cy + 6;
    };

    if (females.length) y = drawCat("FEMALE COUNCILLOR", females, y);
    if (males.length) y = drawCat("MALE COUNCILLOR", males, y);

    y += 4; doc.setDrawColor(128, 0, 32); doc.setLineWidth(0.5);
    doc.line(m, y, pageW - m, y); y += 6;
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text("Electoral Commission — Mengo Senior School Student Council", pageW / 2, y, { align: "center" });
    y += 4;
    doc.text(`Generated on ${new Date().toLocaleDateString("en-UG", { day: "numeric", month: "long", year: "numeric" })}`, pageW / 2, y, { align: "center" });
    doc.save(`Ballot_${getDynamicTitle().replace(/\s+/g, "_")}.pdf`);
    toast.success("Ballot PDF downloaded!");
  };

  const generateScreeningReportPDF = async () => {
    const qual = filteredApplicants;
    if (!qual.length) { toast.error("No candidates in current filter"); return; }
    
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    const addImageToDoc = (src: string, x: number, y: number, w: number, h: number, format: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          doc.addImage(img, format, x, y, w, h);
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    try {
      await Promise.all([
        addImageToDoc(mengoBadge, 15, 10, 25, 25, "JPEG"),
        addImageToDoc(unsaLogoB64, pageW - 40, 10, 25, 25, "PNG")
      ]);
    } catch(e) {
      console.error("Failed to load PDF images:", e);
    }

    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("MENGO SENIOR SCHOOL", pageW / 2, y, { align: "center" });
    y += 6; doc.setFontSize(12);
    doc.text(getDynamicTitle(), pageW / 2, y, { align: "center" });
    y += 6; doc.setFontSize(11);
    doc.text("SCREENING EVALUATION TOOL", pageW / 2, y, { align: "center" });
    y += 6; doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(`Election: ${getDynamicTitle()}    Threshold: ${minAverage}/30`, pageW / 2, y, { align: "center" });
    y += 8;

    const m = 15;
    doc.setFillColor(41, 128, 185);
    doc.rect(m, y, pageW - m * 2, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    
    doc.text("No.", m + 3, y + 5);
    doc.text("Name", m + 15, y + 5);
    doc.text("Class/Stream", m + 60, y + 5);
    doc.text("Smart /10", m + 100, y + 5);
    doc.text("Conf /10", m + 120, y + 5);
    doc.text("Q.App /10", m + 140, y + 5);
    doc.text("Total /30", m + 160, y + 5);
    doc.text("%", m + 180, y + 5);
    doc.text("Qualifies", m + 195, y + 5);
    doc.text("Comment", m + 215, y + 5);
    
    doc.setTextColor(0, 0, 0);
    y += 8;

    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    qual.forEach((c, idx) => {
      if (y > 190) { doc.addPage(); y = 20; }
      if (idx % 2 === 0) { doc.setFillColor(245, 245, 245); doc.rect(m, y, pageW - m * 2, 8, "F"); }
      
      const pct = ((c.average_score / 30) * 100).toFixed(1) + "%";
      const qualifies = c.average_score >= minAverage ? "YES" : "NO";
      
      doc.text(`${idx + 1}`, m + 3, y + 5);
      doc.text(c.applicant_name, m + 15, y + 5);
      doc.text(`${c.class} ${c.stream || ''}`, m + 60, y + 5);
      doc.text(`${c.smart_score || '-'}`, m + 103, y + 5);
      doc.text(`${c.conf_score || '-'}`, m + 123, y + 5);
      doc.text(`${c.qapp_score || '-'}`, m + 143, y + 5);
      doc.text(`${c.average_score}`, m + 163, y + 5);
      doc.text(pct, m + 180, y + 5);
      doc.text(qualifies, m + 195, y + 5);
      if (c.comment) { doc.text(c.comment.substring(0, 40), m + 215, y + 5); }
      
      y += 8;
    });

    doc.save(`Screening_Report_${getDynamicTitle().replace(/\s+/g, "_")}.pdf`);
    toast.success("Screening Report PDF downloaded!");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Electoral Commission</h1>
          <p className="text-sm text-muted-foreground">Manage candidates, screening & ballots.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isTopHead && (
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings2 className="mr-1 h-4 w-4" /> Settings
            </Button>
          )}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Candidate</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Add Candidate</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div><Label>Full Name *</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Nakamya Faith" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Class *</Label><Input value={newClass} onChange={e => setNewClass(e.target.value)} placeholder="S.2" /></div>
                  <div><Label>Stream</Label><Input value={newStream} onChange={e => setNewStream(e.target.value)} placeholder="North" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Gender *</Label>
                    <Select value={newGender} onValueChange={setNewGender}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Smart /10</Label><Input type="number" min={0} max={10} value={newSmart} onChange={e => setNewSmart(e.target.value)} /></div>
                  <div><Label>Conf /10</Label><Input type="number" min={0} max={10} value={newConf} onChange={e => setNewConf(e.target.value)} /></div>
                  <div><Label>Q.App /10</Label><Input type="number" min={0} max={10} value={newQapp} onChange={e => setNewQapp(e.target.value)} /></div>
                </div>
                <div><Label>Comment</Label><Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Optional comment" /></div>
                <Button onClick={handleAddCandidate} className="w-full">Add Candidate</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" onClick={generateScreeningReportPDF}>
            <Download className="mr-1 h-4 w-4" /> Report PDF
          </Button>
          <Button size="sm" variant="outline" onClick={generateBallotPDF}>
            <Download className="mr-1 h-4 w-4" /> Ballot PDF
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Candidate</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div><Label>Full Name *</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Class *</Label><Input value={editClass} onChange={e => setEditClass(e.target.value)} /></div>
              <div><Label>Stream</Label><Input value={editStream} onChange={e => setEditStream(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Gender *</Label>
                <Select value={editGender} onValueChange={setEditGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Smart /10</Label><Input type="number" min={0} max={10} value={editSmart} onChange={e => setEditSmart(e.target.value)} /></div>
              <div><Label>Conf /10</Label><Input type="number" min={0} max={10} value={editConf} onChange={e => setEditConf(e.target.value)} /></div>
              <div><Label>Q.App /10</Label><Input type="number" min={0} max={10} value={editQapp} onChange={e => setEditQapp(e.target.value)} /></div>
            </div>
            <div><Label>Comment</Label><Input value={editComment} onChange={e => setEditComment(e.target.value)} /></div>
            <DialogFooter className="mt-4">
              <Button onClick={saveEditCandidate} className="w-full">Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card className="bg-muted/30 border-primary/10">
        <CardContent className="p-3 sm:p-4 grid gap-3 sm:grid-cols-4 items-end">
          <div className="space-y-1">
            <Label className="text-xs">Search Name</Label>
            <Input size={1} placeholder="e.g. John" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Class</Label>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map(c => <SelectItem key={c as string} value={c as string}>{c as string}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Stream</Label>
            <Select value={filterStream} onValueChange={setFilterStream}>
              <SelectTrigger><SelectValue placeholder="All Streams" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                {uniqueStreams.map(s => <SelectItem key={s as string} value={s as string}>{s as string}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Gender</Label>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-4 flex justify-between items-center border-t border-primary/10 pt-3 mt-1">
             <div className="text-sm">
               {computedAverage !== null && <span>Current Filter Avg: <strong className="text-primary">{computedAverage}/30</strong></span>}
             </div>
             <Button size="sm" variant="secondary" onClick={handleComputeAverage}>Compute Filter Average</Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      {showSettings && isTopHead && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> Screening & Access Settings</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Min Screening Total (/30)</Label>
                <Input type="number" min={0} max={30} value={minAverage} onChange={e => setMinAverage(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Election Title</Label>
                <Input value={electionTitle} onChange={e => setElectionTitle(e.target.value)} />
              </div>
            </div>
            <Button size="sm" onClick={handleAutoScreen}><UserCheck className="mr-1 h-4 w-4" /> Auto-Screen All</Button>

            {/* EC Access Delegation */}
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4 text-primary" /> EC Access Delegation</h4>
              <p className="text-xs text-muted-foreground mb-2">Grant other councillors access to the Elections module.</p>
              <div className="flex gap-2 flex-wrap">
                <Select value={grantUserId} onValueChange={setGrantUserId}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Select councillor" /></SelectTrigger>
                  <SelectContent>
                    {allProfiles.filter(p => !grants.some(g => g.granted_to === p.user_id)).map(p => (
                      <SelectItem key={p.user_id} value={p.user_id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={grantAccess} disabled={!grantUserId}>Grant Access</Button>
              </div>
              {grants.length > 0 && (
                <div className="mt-2 space-y-1">
                  {grants.map(g => {
                    const p = allProfiles.find(pr => pr.user_id === g.granted_to);
                    return (
                      <div key={g.id} className="flex items-center justify-between rounded bg-background px-3 py-1.5 text-sm">
                        <span>{p?.full_name || "Unknown"}</span>
                        <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => revokeAccess(g.id)}>Revoke</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold sm:text-3xl">{filteredApplicants.length}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Applicants</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-primary sm:text-3xl">{qualified}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Qualified</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-destructive sm:text-3xl">{disqualified}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Disqualified</p>
        </CardContent></Card>
      </div>

      {/* Applicants */}
      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Vote className="h-4 w-4 text-primary" />
            Candidates (Min: {minAverage}/30)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground">Name</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground">Class</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground hidden sm:table-cell">Stream</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground hidden sm:table-cell">Gender</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground" title="Smartness">Smt</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground" title="Confidence">Cnf</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground" title="Quick at Application">Q.A</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground text-primary">Tot /30</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground hidden 2xl:table-cell">Comment</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="py-2 px-2 text-left font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="py-8 text-center text-muted-foreground">Loading…</td></tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr><td colSpan={10} className="py-8 text-center text-muted-foreground">No candidates match filters.</td></tr>
                ) : filteredApplicants.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-2 font-medium">{a.applicant_name}</td>
                    <td className="py-2 px-2 text-muted-foreground">{a.class}</td>
                    <td className="py-2 px-2 text-muted-foreground hidden lg:table-cell">{(a as any).stream || "—"}</td>
                    <td className="py-2 px-2 capitalize text-muted-foreground hidden sm:table-cell">{a.gender}</td>
                    <td className="py-2 px-2 text-muted-foreground">{a.smart_score || "—"}</td>
                    <td className="py-2 px-2 text-muted-foreground">{a.conf_score || "—"}</td>
                    <td className="py-2 px-2 text-muted-foreground">{a.qapp_score || "—"}</td>
                    <td className="py-2 px-2">
                      <span className={`font-bold ${a.average_score >= minAverage ? "text-primary" : "text-destructive"}`}>
                        {a.average_score}
                      </span>
                    </td>
                    <td className="py-2 px-2 hidden 2xl:table-cell">
                      {a.comment ? <span className="text-[10px] text-muted-foreground truncate max-w-[150px] block" title={a.comment}>{a.comment}</span> : "—"}
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant={a.status === "qualified" ? "default" : a.status === "disqualified" ? "destructive" : "secondary"} className="text-[10px] sm:text-xs">
                        {a.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 flex flex-wrap gap-1 min-w-[140px]">
                      {a.status !== "pending" && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleStatus(a.id, a.status)}>
                          {a.status === "qualified" ? "Disqualify" : "Qualify"}
                        </Button>
                      )}
                      {isTopHead && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit" onClick={() => openEditModal(a)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" title="Delete" onClick={() => handleDeleteCandidate(a.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
