"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
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
} from "lucide-react";
import type { CursorRule } from "@/types";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ruleId = params.id as string;

  const [rule, setRule] = useState<CursorRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [showOriginal, setShowOriginal] = useState(true);
  const [translatedLanguage, setTranslatedLanguage] = useState<string | null>(
    null
  );
  const [shouldFetchTranslation, setShouldFetchTranslation] = useState(false);

  const translateFetcher = async (url: string) => {
    if (!rule || !translatedLanguage) return null;

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: rule.content,
        sourceLocale: "en",
        targetLocale: translatedLanguage,
        ruleId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Translation failed");
    }

    return response.json();
  };

  const translationKey =
    rule && translatedLanguage && shouldFetchTranslation
      ? `translation_${ruleId}_${translatedLanguage}`
      : null;

  const {
    data: translationData,
    error: translationError,
    isLoading: isTranslating,
    mutate: mutateTranslation,
  } = useSWR(translationKey, translateFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
    revalidateIfStale: false,
    onSuccess: (data) => {
      if (data?.translatedText) {
        setShowOriginal(false);
        toast.success("Translation loaded!");
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to translate rule"
      );
    },
  });

  const translatedContent = translationData?.translatedText || null;

  useEffect(() => {
    fetchRule();
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

      // Increment view count
      await fetch(`/api/rules/${ruleId}/view`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Error fetching rule:", error);
      setError("Failed to load rule");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!rule) return;

    try {
      await fetch(`/api/rules/${ruleId}/copy`, {
        method: "POST",
      });
      // Update local copy count
      setRule((prev) =>
        prev ? { ...prev, copyCount: prev.copyCount + 1 } : null
      );
    } catch (error) {
      console.error("Error incrementing copy count:", error);
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

  // Common languages for translation
  const languages = [
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
    { code: "hi", name: "Hindi" },
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
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rules
        </Button>

        <Card>
          <CardHeader>
            {/* Tech Stack Badge */}
            <Badge variant="secondary" className="w-fit mb-4">
              {rule.techStack}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {rule.title}
            </h1>

            {/* Description */}
            {rule.description && (
              <p className="text-lg text-gray-600 mb-6">{rule.description}</p>
            )}

            {/* Tags */}
            {rule.tags && rule.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {rule.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{rule.viewCount} views</span>
              </div>
              <div className="flex items-center gap-1">
                <CopyIcon className="h-4 w-4" />
                <span>{rule.copyCount} copies</span>
              </div>
              {rule._count && (
                <>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{rule._count.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{rule._count.comments} comments</span>
                  </div>
                </>
              )}
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
                    {rule.user?.name || rule.user?.email}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(rule.createdAt)}</span>
                  </div>
                </div>
              </div>

              <CopyButton content={rule.content} onCopy={handleCopy} />
            </div>
          </CardHeader>

          <CardContent>
            {/* Rule Content */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700 uppercase">
                  Cursor Rule
                </h2>
                <div className="flex items-center gap-2">
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
                      variant="outline"
                      size="sm"
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      {isTranslating ? "Translating..." : "Translate"}
                    </Button>
                    {translatedContent && !showOriginal && (
                      <Button
                        onClick={handleShowOriginal}
                        variant="outline"
                        size="sm"
                      >
                        Show Original
                      </Button>
                    )}
                  </div>
                  <CopyButton
                    content={
                      showOriginal
                        ? rule.content
                        : translatedContent || rule.content
                    }
                    onCopy={handleCopy}
                  />
                </div>
              </div>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-x-auto">
                {showOriginal
                  ? rule.content
                  : translatedContent || rule.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
