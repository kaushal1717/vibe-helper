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
import { markRuleAsViewed, hasViewedRule } from "@/lib/utils/localStorage";
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
      };

  const [showPRDialog, setShowPRDialog] = useState(false);
  const [cliCopied, setCliCopied] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [copyCount, setCopyCount] = useState(0);
  const viewTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset tracking when ruleId changes
    viewTrackedRef.current = null;
    fetchRule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleId]);

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
    // Update copy count in UI
    if (newCopyCount !== undefined) {
      setCopyCount(newCopyCount);
      setRule((prev) => (prev ? { ...prev, copyCount: newCopyCount } : null));
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    { code: "gu", name: "Gujarati" },
    { code: "hi", name: "Hindi" },
    { code: "en", name: "English" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "ur", name: "Urdu" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "nl", name: "Dutch" },
    { code: "pl", name: "Polish" },
    { code: "tr", name: "Turkish" },
    { code: "sv", name: "Swedish" },
    { code: "da", name: "Danish" },
    { code: "fi", name: "Finnish" },
    { code: "no", name: "Norwegian" },
    { code: "cs", name: "Czech" },
    { code: "uk", name: "Ukrainian" },
  ];
  const handleCreatePRClick = () => {
    if (!isLoaded) {
      return; // Wait for auth to load
    }

    if (isSignedIn) {
      setShowPRDialog(true);
    }
    // If not signed in, SignInButton will handle the modal
  };

  const cliCommand = `npx cursorize@latest add ${ruleId}`;

  const handleCliCopy = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCliCopied(true);
      toast.success("Command copied to clipboard!");
      setTimeout(() => setCliCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Rule Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "The rule you're looking for doesn't exist."}
        </p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {showOriginal ? "Back to Rules" : uiLabels.backToRules}
          </Button>

          <div className="flex items-center gap-2">
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-[140px]">
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
            >
              <Languages className="h-4 w-4 mr-2" />
              {isTranslating ? "Translating..." : uiLabels.translate}
            </Button>
            {!showOriginal && pageTranslationData && (
              <Button
                onClick={handleShowOriginal}
                variant="outline"
                size="default"
              >
                {uiLabels.showOriginal}
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit mb-4">
              {rule.techStack}
            </Badge>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {showOriginal ? rule.title : translatedTitle}
            </h1>

            {(rule.description || translatedDescription) && (
              <p className="text-lg text-gray-600 mb-6">
                {showOriginal ? rule.description : translatedDescription}
              </p>
            )}

            {(rule.tags || translatedTags).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {(showOriginal ? rule.tags : translatedTags).map(
                  (tag: any, index: any) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  )
                )}
              </div>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>
                  {rule.viewCount} {uiLabels.views}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CopyIcon className="h-4 w-4" />
                <span>
                  {rule.copyCount} {uiLabels.copies}
                </span>
              </div>
              {rule._count && (
                <>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>
                      {rule._count.likes} {uiLabels.likes}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {rule._count.comments} {uiLabels.comments}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* CLI Command */}
            <div className="mt-4 flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md border border-gray-200 overflow-hidden">
              <code className="flex-1 text-xs text-gray-700 font-mono whitespace-nowrap overflow-x-auto scrollbar-hide">
                {cliCommand}
              </code>
              <button
                onClick={handleCliCopy}
                className="shrink-0 p-1.5 hover:bg-gray-200 rounded transition-colors"
                aria-label="Copy command"
              >
                {cliCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <CopyIcon className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>

            <Separator className="mb-6" />

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rule.user?.image || undefined} />
                  <AvatarFallback>
                    {getInitials(
                      rule.user?.name || null,
                      rule.user?.email || "U"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {uiLabels.userName || rule.user?.name || rule.user?.email}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{uiLabels.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CopyButton content={rule.content} onCopy={handleCopy} />
                {isLoaded && !isSignedIn ? (
                  <SignInButton mode="modal">
                    <Button variant="outline" className="gap-2">
                      <GitBranch className="h-4 w-4" />
                      Create PR on GitHub
                    </Button>
                  </SignInButton>
                ) : (
                  <Button
                    onClick={handleCreatePRClick}
                    variant="outline"
                    className="gap-2"
                  >
                    <GitBranch className="h-4 w-4" />
                    Create PR on GitHub
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Rule Content */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase">
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
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">
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
