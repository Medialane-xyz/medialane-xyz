"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/src/components/ui/dialog";
import { Key, Trash2, AlertCircle, Plus, Copy, Check } from "lucide-react";

interface ApiKey {
  id: string;
  prefix: string;
  label: string | null;
  status: "ACTIVE" | "REVOKED";
  lastUsedAt: string | null;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ApiKeysTab() {
  // Backend returns { data: ApiKey[] } — unwrap via data?.data
  const { data, error, isLoading, mutate } = useSWR<{ data: ApiKey[] }>(
    "/api/portal/keys",
    fetcher
  );
  const [revoking, setRevoking] = useState<string | null>(null);

  // Create key dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<{ prefix: string; plaintext: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await fetch(`/api/portal/keys/${id}`, { method: "DELETE" });
      await mutate();
    } finally {
      setRevoking(null);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/portal/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: labelInput.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) return;
      const created = json?.data ?? json;
      setNewKey({ prefix: created.prefix, plaintext: created.plaintext });
      await mutate();
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey.plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setLabelInput("");
    setNewKey(null);
    setCopied(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 rounded-xl border border-destructive/20 bg-destructive/5">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-sm">Failed to load API keys. Make sure the backend is running.</span>
      </div>
    );
  }

  const keys = data?.data ?? [];
  const activeCount = keys.filter((k) => k.status === "ACTIVE").length;

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              API Keys
            </CardTitle>
            <CardDescription>
              Your API keys for accessing the Medialane REST API. Keep them secret.
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            disabled={activeCount >= 5}
            title={activeCount >= 5 ? "Maximum 5 active keys reached" : undefined}
          >
            <Plus className="w-4 h-4 mr-1" />
            New Key
          </Button>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No API keys yet. Create one to start using the Medialane API.
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-sm text-primary">{k.prefix}***</code>
                      {k.label && (
                        <span className="text-xs text-muted-foreground">({k.label})</span>
                      )}
                      <Badge
                        variant={k.status === "ACTIVE" ? "default" : "secondary"}
                        className={
                          k.status === "ACTIVE"
                            ? "bg-green-500/15 text-green-600 border-green-500/30"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {k.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {k.lastUsedAt
                        ? `Last used ${new Date(k.lastUsedAt).toLocaleDateString()}`
                        : "Never used"}{" "}
                      · Created {new Date(k.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {k.status === "ACTIVE" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      disabled={revoking === k.id}
                      onClick={() => handleRevoke(k.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create key dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && handleCloseCreate()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          {newKey ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy your key now — it won&apos;t be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-lg break-all">
                  {newKey.plaintext}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseCreate}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key-label">Label (optional)</Label>
                <Input
                  id="key-label"
                  placeholder="e.g. production, staging"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  maxLength={64}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
