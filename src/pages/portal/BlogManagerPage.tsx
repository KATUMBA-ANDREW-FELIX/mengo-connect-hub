import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function BlogManagerPage() {
  const { profile } = useAuth();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("none");

  const fetchBlogs = async () => {
    try {
      const { data } = await api.get("/blogs/");
      setBlogs(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handlePost = async () => {
    if (!title || !content) return;
    setPosting(true);
    try {
      await api.post("/blogs/", {
        title,
        content,
        media_url: mediaType !== "none" ? mediaUrl : null,
        media_type: mediaType,
        author: profile?.full_name || "Publicity Office",
      });
      toast.success("Blog Posted!");
      setTitle("");
      setContent("");
      setMediaUrl("");
      setMediaType("none");
      fetchBlogs();
    } catch (e: any) {
      toast.error("Failed to post blog");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Blog / Publicity Manager</h1>
        <p className="text-sm text-muted-foreground">Manage public announcements shown on the homepage.</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Plus className="h-4 w-4" /> Create New Post</h2>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. End of Term Events" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Write announcement..." />
            </div>
            <div>
               <Label>Attach Media (Optional)</Label>
               <div className="flex gap-2 mt-1">
                 <Select value={mediaType} onValueChange={setMediaType}>
                   <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="none">No Media</SelectItem>
                     <SelectItem value="image">Image</SelectItem>
                     <SelectItem value="video">Video</SelectItem>
                   </SelectContent>
                 </Select>
                 <Input 
                   value={mediaUrl} 
                   onChange={e => setMediaUrl(e.target.value)} 
                   placeholder="Paste Image or Video URL..." 
                   disabled={mediaType === "none"} 
                   className="flex-1" 
                 />
               </div>
            </div>
            <Button onClick={handlePost} disabled={posting || !title || !content}>
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />} Post to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold">Recent Posts</h3>
        {loading ? <p className="text-sm text-muted-foreground">Loading...</p> : 
         blogs.length === 0 ? <p className="text-sm text-muted-foreground">No posts yet.</p> :
         blogs.map((b) => (
           <Card key={b.id}>
             <CardContent className="p-4 space-y-2">
               <h4 className="font-bold">{b.title}</h4>
               <p className="text-xs text-muted-foreground">{b.author} • {new Date(b.created_at).toLocaleString()}</p>
               {b.media_url && b.media_type === "image" && (
                 <img src={b.media_url} alt="Media" className="my-2 max-h-48 rounded-md object-cover" />
               )}
               {b.media_url && b.media_type === "video" && (
                 <video src={b.media_url} controls className="my-2 max-h-48 w-full max-w-sm rounded-md" />
               )}
               <p className="text-sm whitespace-pre-wrap">{b.content}</p>
             </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
