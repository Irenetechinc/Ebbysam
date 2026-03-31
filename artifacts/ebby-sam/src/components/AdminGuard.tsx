import { useEffect, useState } from "react";
import { verifySession, clearToken } from "@/lib/auth";
import AdminLogin from "@/pages/AdminLogin";

interface Props {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: Props) {
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">(
    "loading",
  );

  const check = () => {
    setStatus("loading");
    verifySession().then((valid) => setStatus(valid ? "authed" : "unauthed"));
  };

  useEffect(() => {
    check();
  }, []);

  const handleLogout = () => {
    clearToken();
    setStatus("unauthed");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === "unauthed") {
    return <AdminLogin onSuccess={check} />;
  }

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-end px-6 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
        <span className="text-xs text-muted-foreground uppercase tracking-widest mr-4 self-center">
          Admin Session
        </span>
        <button
          onClick={handleLogout}
          className="text-xs uppercase tracking-widest text-primary hover:text-primary/70 transition-colors border border-primary/40 px-3 py-1.5 rounded"
        >
          Log out
        </button>
      </div>
      {children}
    </div>
  );
}
