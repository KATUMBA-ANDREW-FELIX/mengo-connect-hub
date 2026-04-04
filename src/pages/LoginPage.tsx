import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogIn, Loader2, HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import mengoBadge from "@/assets/mengo-badge.jpg";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { api } from "@/lib/api";


export default function LoginPage() {
  const navigate = useNavigate();
  const { user, setAuthData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    if (user) navigate("/portal", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter your username and password");
      return;
    }
    setLoading(true);
    
    try {
      const res = await api.post("/users/login/", { username, password });
      
      const { access, refresh, user: userData } = res.data;
      
      setAuthData(access, refresh, userData ?? { id: "", username });
      
      toast.success("Welcome back!");
      navigate("/portal");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!resetUsername) {
      toast.error("Please enter your username");
      return;
    }
    setSendingReset(true);
    try {
      await api.post("/users/forgot-password/", { username: resetUsername });
      toast.success("Reset request sent to Administration");
      setForgotOpen(false);
      setResetUsername("");
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Could not find account");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src={mengoBadge} alt="Mengo Crest" className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-gold object-cover shadow-lg" />
          <h1 className="font-serif text-2xl font-bold text-foreground">Councillor Portal</h1>
          <p className="mt-1 text-xs font-mono text-muted-foreground tracking-wider">
            Mengo Student Council
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your username
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="e.g. jdoe"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
            />
            <p className="text-xs text-muted-foreground">Your unique council username</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password *</Label>
              <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-primary">
                    Forgot Password?
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reset Password Request</DialogTitle>
                    <DialogDescription>
                      Enter your username to request a temporary password from the Administration.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reset-username">Username</Label>
                      <Input
                        id="reset-username"
                        placeholder="e.g. jdoe"
                        value={resetUsername}
                        onChange={(e) => setResetUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setForgotOpen(false)}>Cancel</Button>
                    <Button onClick={handleRequestReset} disabled={sendingReset}>
                      {sendingReset && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Please wait..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Lock className="mr-1 inline h-3 w-3" />
          Access restricted to elected council members only
        </p>
      </div>
    </div>
  );
}
