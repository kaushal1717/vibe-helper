"use client";

import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/shared/copy-button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Eye,
  Copy as CopyIcon,
  Heart,
  MessageCircle,
  Calendar,
  Languages,
  GitBranch,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CursorRule } from "@/types";
import { toast } from "sonner";
import {
  markRuleAsViewed,
  hasViewedRule,
  hasCopiedRule,
  markRuleAsCopied,
} from "@/lib/utils/localStorage";
import { getSessionId } from "@/lib/utils/session";
import { RepoSelectorDialog } from "@/components/github/repo-selector-dialog";

export default function RuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ruleId = params.id as string;
  const { isSignedIn, isLoaded } = useUser();

  const [rule, setRule] = useState<CursorRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [showOriginal, setShowOriginal] = useState(true);
  const [translatedLanguage, setTranslatedLanguage] = useState<string | null>(
    null
  );
  const [shouldFetchTranslation, setShouldFetchTranslation] = useState(false);

  const batchTranslateFetcher = async (url: string) => {
    if (!rule || !translatedLanguage) return null;

    const formattedDate = new Date(rule.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const textsToTranslate = [
      rule.title || "",
      rule.description || "",
      ...(rule.tags || []),
      rule.content || "",

      "views",
      "copies",
      "likes",
      "comments",
      "Cursor Rule",
      "Back to Rules",
      "Show Original",
      "Translate",
      "Copy",
      "Copied",
      formattedDate,
      rule.user?.name || rule.user?.email || "",
      "Create PR on GitHub",
    ];

    const response = await fetch("/api/translate/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts: textsToTranslate,
        sourceLocale: "en",
        targetLocale: translatedLanguage,
        ruleId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Translation failed");
    }

    const data = await response.json();
    const translatedTexts = data.translatedTexts || [];

    const tagCount = rule.tags?.length || 0;
    const baseIndex = 2 + tagCount;

    return {
      title: translatedTexts[0] || rule.title,
      description: translatedTexts[1] || rule.description,
      tags: translatedTexts.slice(2, 2 + tagCount) || rule.tags,
      content: translatedTexts[baseIndex] || rule.content,
      uiLabels: {
        views: translatedTexts[baseIndex + 1] || "views",
        copies: translatedTexts[baseIndex + 2] || "copies",
        likes: translatedTexts[baseIndex + 3] || "likes",
        comments: translatedTexts[baseIndex + 4] || "comments",
        cursorRule: translatedTexts[baseIndex + 5] || "Cursor Rule",
        backToRules: translatedTexts[baseIndex + 6] || "Back to Rules",
        showOriginal: translatedTexts[baseIndex + 7] || "Show Original",
        translate: translatedTexts[baseIndex + 8] || "Translate",
        copy: translatedTexts[baseIndex + 9] || "Copy",
        copied: translatedTexts[baseIndex + 10] || "Copied",
        date: translatedTexts[baseIndex + 11] || formattedDate,
        userName:
          translatedTexts[baseIndex + 12] ||
          rule.user?.name ||
          rule.user?.email ||
          "",
        createPR: translatedTexts[baseIndex + 13] || "Create PR on GitHub",
      },
    };
  };

  const translationKey =
    rule && translatedLanguage && shouldFetchTranslation
      ? `page_translation_${ruleId}_${translatedLanguage}`
      : null;

  const {
    data: pageTranslationData,
    error: translationError,
    isLoading: isTranslating,
    mutate: mutateTranslation,
  } = useSWR(translationKey, batchTranslateFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
    revalidateIfStale: false,
    onSuccess: (data) => {
      if (data) {
        setShowOriginal(false);
        toast.success("Page translated successfully!");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to translate page"
      );
    },
  });

  const translatedTitle = pageTranslationData?.title || rule?.title || "";
  const translatedDescription =
    pageTranslationData?.description || rule?.description || "";
  const translatedTags = pageTranslationData?.tags || rule?.tags || [];
  const translatedContent = pageTranslationData?.content || rule?.content || "";

  const originalDate = rule
    ? new Date(rule.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const uiLabels = showOriginal
    ? {
        views: "views",
        copies: "copies",
        likes: "likes",
        comments: "comments",
        cursorRule: "Cursor Rule",
        backToRules: "Back to Rules",
        showOriginal: "Show Original",
        translate: "Translate",
        copy: "Copy",
        copied: "Copied",
        date: originalDate,
        userName: rule?.user?.name || rule?.user?.email || "",
        createPR: "Create PR on GitHub",
      }
    : pageTranslationData?.uiLabels || {
        views: "views",
        copies: "copies",
        likes: "likes",
        comments: "comments",
        cursorRule: "Cursor Rule",
        backToRules: "Back to Rules",
        showOriginal: "Show Original",
        translate: "Translate",
        copy: "Copy",
        copied: "Copied",
        date: originalDate,
        userName: rule?.user?.name || rule?.user?.email || "",
        createPR: "Create PR on GitHub",
      };

  const [showPRDialog, setShowPRDialog] = useState(false);
  const [cliCopied, setCliCopied] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [copyCount, setCopyCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const viewTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset tracking when ruleId changes
    viewTrackedRef.current = null;
    fetchRule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleId]);

  useEffect(() => {
    if (isSignedIn && ruleId) {
      fetch(`/api/rules/${ruleId}/like`)
        .then((res) => res.json())
        .then((data) => {
          if (data.liked !== undefined) {
            setLiked(data.liked);
          }
        })
        .catch(() => {
          toast.error("Failed to like rule");
        });
    } else {
      setLiked(false);
    }
  }, [isSignedIn, ruleId]);

  useEffect(() => {
    if (rule?._count?.likes !== undefined) {
      setLikeCount(rule._count.likes);
    }
  }, [rule?._count?.likes]);

  const fetchRule = async () => {
    try {
      const response = await fetch(`/api/rules/${ruleId}`);

      if (!response.ok) {
        setError("Rule not found");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setRule(data);
      setViewCount(data.viewCount || 0);
      setCopyCount(data.copyCount || 0);
      setLikeCount(data._count?.likes || 0);

      // Track view only once per ruleId (prevent double tracking in React Strict Mode)
      if (viewTrackedRef.current !== ruleId) {
        viewTrackedRef.current = ruleId;

        // Track view count with localStorage
        const isNewView = !hasViewedRule(ruleId);
        if (isNewView) {
          markRuleAsViewed(ruleId);
        }

        // Track view on server
        try {
          const sessionId = getSessionId();
          const viewResponse = await fetch(`/api/rules/${ruleId}/view`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          // Update view count in UI with latest from server
          if (viewResponse.ok) {
            const viewData = await viewResponse.json();
            if (viewData.viewCount !== undefined) {
              setViewCount(viewData.viewCount);
              setRule((prev) =>
                prev ? { ...prev, viewCount: viewData.viewCount } : null
              );
            }
          }
        } catch (error) {
          console.error("Error tracking view:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching rule:", error);
      setError("Failed to load rule");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (newCopyCount?: number) => {
    if (newCopyCount !== undefined) {
      setCopyCount(newCopyCount);
      setRule((prev) => (prev ? { ...prev, copyCount: newCopyCount } : null));
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleTranslate = () => {
    if (!rule || !selectedLanguage) {
      toast.error("Please select a language");
      return;
    }

    if (translatedLanguage && translatedLanguage !== selectedLanguage) {
      setShouldFetchTranslation(false);
    }

    setTranslatedLanguage(selectedLanguage);
    setShouldFetchTranslation(true);
  };

  const handleShowOriginal = () => {
    setShowOriginal(true);
    setSelectedLanguage("");
    setTranslatedLanguage(null);
    setShouldFetchTranslation(false);
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const languages = [
    { code: "ar", name: "Arabic" },
    { code: "zh", name: "Chinese" },
    { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" },
    { code: "nl", name: "Dutch" },
    { code: "en", name: "English" },
    { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "gu", name: "Gujarati" },
    { code: "hi", name: "Hindi" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
    { code: "kn", name: "Kannada" },
    { code: "ko", name: "Korean" },
    { code: "ml", name: "Malayalam" },
    { code: "mr", name: "Marathi" },
    { code: "no", name: "Norwegian" },
    { code: "pl", name: "Polish" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "sd", name: "Sindhi" },
    { code: "es", name: "Spanish" },
    { code: "sv", name: "Swedish" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "tr", name: "Turkish" },
    { code: "uk", name: "Ukrainian" },
    { code: "ur", name: "Urdu" },
  ];
  const handleCreatePRClick = () => {
    if (!isLoaded) {
      return;
    }

    if (isSignedIn) {
      setShowPRDialog(true);
    }
  };

  const cliCommand = `npx cursorize@latest add ${ruleId}`;

  const handleCliCopy = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCliCopied(true);
      toast.success("Command copied to clipboard!");

      const isNewCopy = !hasCopiedRule(ruleId);
      if (isNewCopy) {
        markRuleAsCopied(ruleId);
      }

      try {
        const sessionId = getSessionId();
        const response = await fetch(`/api/rules/${ruleId}/copy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.copyCount !== undefined) {
            setCopyCount(data.copyCount);
            setRule((prev) =>
              prev ? { ...prev, copyCount: data.copyCount } : null
            );
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error tracking copy:", errorData);
        }
      } catch (error) {
        toast.error("Failed to copy");
      }

      setTimeout(() => setCliCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleLike = async () => {
    if (!isSignedIn) {
      toast.error("Please log in to like rules");
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch(`/api/rules/${ruleId}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        toast.error("Please log in to like rules");
        setIsLiking(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to like");
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      setRule((prev) =>
        prev
          ? {
              ...prev,
              hasLiked: data.liked,
              _count: prev._count
                ? { ...prev._count, likes: data.likeCount }
                : { likes: data.likeCount, comments: 0, favorites: 0 },
            }
          : null
      );
      toast.success(data.liked ? "Liked!" : "Unliked");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to toggle like");
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !rule) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl border-[1.5px] border-white/60 shadow-2xl text-center slide-up">
          <h2 className="text-3xl font-black text-foreground mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            Rule Not Found
          </h2>
          <p className="text-foreground/60 mb-8 font-medium text-lg">
            {error || "The rule you're looking for doesn't exist."}
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 slide-up">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="hover:bg-secondary/10 transition-all duration-200 font-bold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {showOriginal ? "Back to Rules" : uiLabels.backToRules}
          </Button>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-[140px] border-foreground/20 font-semibold">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleTranslate}
              disabled={!selectedLanguage || isTranslating}
              variant="default"
              size="default"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-lg"
            >
              <Languages className="h-4 w-4 mr-2" />
              {isTranslating ? "Translating..." : uiLabels.translate}
            </Button>
            {!showOriginal && pageTranslationData && (
              <Button
                onClick={handleShowOriginal}
                variant="outline"
                size="default"
                className="border-foreground/20 font-bold"
              >
                {uiLabels.showOriginal}
              </Button>
            )}
          </div>
        </div>

        <Card className="glass-panel hover-glow border-[1.5px] border-white/60 shadow-2xl slide-up overflow-hidden">
          <CardHeader className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <Badge variant="secondary" className="bg-secondary/10 border-secondary/20 text-secondary border font-bold text-sm px-4 py-1.5">
                {rule.techStack}
              </Badge>
              <div className="glass-panel flex items-center px-4 py-2 rounded-lg border border-white/40 shadow-md">
                <Calendar className="h-4 w-4 mr-2 text-foreground/60" />
                <span className="text-sm font-bold text-foreground/70">
                  {uiLabels.date}
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              {showOriginal ? rule.title : translatedTitle}
            </h1>

            {(rule.description || translatedDescription) && (
              <p className="text-lg md:text-xl text-foreground/60 font-medium leading-relaxed tracking-wide">
                {showOriginal ? rule.description : translatedDescription}
              </p>
            )}

            {(rule.tags || translatedTags).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(showOriginal ? rule.tags : translatedTags).map(
                  (tag: any, index: any) => (
                    <Badge key={index} variant="outline" className="font-semibold border-foreground/20 text-foreground/70 px-3 py-1">
                      {tag}
                    </Badge>
                  )
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-foreground/60">
              <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-lg border border-white/40">
                <Eye className="h-4 w-4" />
                <span>
                  {rule.viewCount} {uiLabels.views}
                </span>
              </div>
              <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-lg border border-white/40">
                <CopyIcon className="h-4 w-4" />
                <span>
                  {rule.copyCount} {uiLabels.copies}
                </span>
              </div>
              {isSignedIn ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className={`text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold transition-all duration-200 ${liked ? "bg-red-500/10" : ""}`}
                  title="Like this rule"
                >
                  <Heart
                    className={`h-4 w-4 mr-2 transition-transform duration-200 ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`}
                  />
                  <span>
                    {likeCount} {uiLabels.likes}
                  </span>
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 font-bold transition-all duration-200"
                    title="Like this rule"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    <span>
                      {likeCount} {uiLabels.likes}
                    </span>
                  </Button>
                </SignInButton>
              )}
            </div>

            {/* CLI Command */}
            <div className="glass-panel flex items-center gap-2 px-4 py-3 rounded-xl border border-white/40 shadow-lg overflow-hidden">
              <code className="flex-1 text-sm text-foreground/70 font-mono whitespace-nowrap overflow-x-auto scrollbar-hide font-semibold">
                {cliCommand}
              </code>
              <button
                onClick={handleCliCopy}
                className="copy-btn-scale shrink-0 p-2 hover:bg-primary/20 rounded-lg transition-all duration-200"
                aria-label="Copy command"
              >
                {cliCopied ? (
                  <Check className="h-5 w-5 text-green-600 animate-in zoom-in duration-200" />
                ) : (
                  <CopyIcon className="h-5 w-5 text-foreground/60" />
                )}
              </button>
            </div>

            <Separator className="bg-foreground/10" />

            {/* GitHub PR Button */}
            <div className="flex items-center justify-end gap-2">
              {isLoaded && !isSignedIn ? (
                <SignInButton mode="modal">
                  <Button variant="outline" className="gap-2 border-foreground/20 font-bold hover:bg-secondary/10 shadow-md">
                    <GitBranch className="h-4 w-4" />
                    {uiLabels.createPR}
                  </Button>
                </SignInButton>
              ) : (
                <Button
                  onClick={handleCreatePRClick}
                  variant="outline"
                  className="gap-2 border-foreground/20 font-bold hover:bg-secondary/10 shadow-md"
                >
                  <GitBranch className="h-4 w-4" />
                  {uiLabels.createPR}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Rule Content */}
            <div className="glass-panel rounded-xl p-6 border border-white/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-foreground/70 uppercase tracking-wider">
                  {uiLabels.cursorRule}
                </h2>
                <CopyButton
                  content={
                    showOriginal
                      ? rule.content
                      : translatedContent || rule.content
                  }
                  onCopy={handleCopy}
                  copyLabel={uiLabels.copy}
                  copiedLabel={uiLabels.copied}
                  ruleId={rule.id}
                  onCopyCountUpdate={handleCopy}
                />
              </div>
              <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono overflow-x-auto font-semibold leading-relaxed">
                {showOriginal
                  ? rule.content
                  : translatedContent || rule.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* GitHub PR Dialog */}
        <RepoSelectorDialog
          open={showPRDialog}
          onOpenChange={setShowPRDialog}
          ruleId={rule.id}
          ruleContent={rule.content}
          ruleTitle={rule.title}
          onSuccess={(prUrl) => {
            window.open(prUrl, "_blank");
            toast.success("PR created! Opening in new tab...");
          }}
        />
      </div>
    </div>
  );
}
