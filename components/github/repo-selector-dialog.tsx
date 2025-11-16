"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Github } from "lucide-react";
import { toast } from "sonner";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  description: string | null;
  private: boolean;
}

interface RepoSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleId: string;
  ruleContent: string;
  ruleTitle: string;
  onSuccess: (prUrl: string) => void;
}

export function RepoSelectorDialog({
  open,
  onOpenChange,
  ruleId,
  ruleContent,
  ruleTitle,
  onSuccess,
}: RepoSelectorDialogProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [fileName, setFileName] = useState<string>("rules.mdc");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetchRepos();
      setFileName("rules.mdc");
    }
  }, [open]);

  const fetchRepos = async () => {
    setFetching(true);
    setError("");
    try {
      const response = await fetch("/api/github/repos");
      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          setError(data.error || "Please connect your GitHub account first");
        } else {
          setError(data.error || "Failed to fetch repositories");
        }
        return;
      }
      const data = await response.json();
      setRepos(data);
    } catch (error) {
      console.error("Error fetching repos:", error);
      setError("Failed to fetch repositories");
    } finally {
      setFetching(false);
    }
  };

  const handleCreatePR = async () => {
    if (!selectedRepo) {
      toast.error("Please select a repository");
      return;
    }

    if (!fileName || !fileName.trim()) {
      toast.error("Please enter a filename");
      return;
    }

    // Ensure filename ends with .mdc
    const finalFileName = fileName.trim().endsWith(".mdc")
      ? fileName.trim()
      : `${fileName.trim()}.mdc`;

    const [owner, repo] = selectedRepo.split("/");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/github/create-pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo,
          ruleId,
          ruleContent,
          ruleTitle,
          fileName: finalFileName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create PR");
        return;
      }

      toast.success("PR created successfully!");
      onSuccess(data.prUrl);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating PR:", error);
      setError("Failed to create PR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create PR on GitHub</DialogTitle>
          <DialogDescription>
            Select a repository and filename to create a pull request with this
            cursor rule
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filename Input */}
            <div className="space-y-2">
              <Label htmlFor="fileName">Filename</Label>
              <Input
                id="fileName"
                placeholder="rules.mdc"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                File will be created at{" "}
                <code className="text-xs">.cursor/rules/</code>
                {fileName && (
                  <span className="ml-1">
                    →{" "}
                    <code className="text-xs">
                      .cursor/rules/
                      {fileName.endsWith(".mdc") ? fileName : `${fileName}.mdc`}
                    </code>
                  </span>
                )}
              </p>
            </div>

            {/* Repository Selector */}
            <div className="space-y-2">
              <Label htmlFor="repo">Select Repository</Label>
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {repos.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {error ? (
                      <span>{error}</span>
                    ) : (
                      <span>
                        No repositories found. Make sure your GitHub account is
                        connected.
                      </span>
                    )}
                  </div>
                ) : (
                  repos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo.full_name)}
                      className={`w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors ${
                        selectedRepo === repo.full_name
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <div className="font-medium">{repo.name}</div>
                          {repo.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {repo.description}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {repo.full_name}
                          </div>
                        </div>
                        {repo.private && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Private
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePR}
                disabled={loading || !selectedRepo || !fileName.trim()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create PR
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
