"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Key, Trash2, AlertCircle } from "lucide-react";

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
  const { data, error, isLoading, mutate } = useSWR<{ keys: ApiKey[] }>(
    "/api/portal/keys",
    fetcher
  );
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await fetch(`/api/portal/keys/${id}`, { method: "DELETE" });
      await mutate();
    } finally {
      setRevoking(null);
    }
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

  const keys = data?.keys ?? [];

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Keys
          </CardTitle>
          <CardDescription>
            Your API keys for accessing the Medialane REST API. Keep them secret.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No API keys found. Your key was auto-provisioned — if missing, try refreshing.
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
    </div>
  );
}
