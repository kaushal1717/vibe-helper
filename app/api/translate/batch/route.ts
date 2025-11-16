import { NextRequest, NextResponse } from "next/server";
import { LingoDotDevEngine } from "lingo.dev/sdk";
import { unstable_cache } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const {
      texts,
      sourceLocale = "en",
      targetLocale,
      ruleId,
    } = await request.json();

    if (
      !texts ||
      !Array.isArray(texts) ||
      texts.length === 0 ||
      !targetLocale
    ) {
      return NextResponse.json(
        { error: "Texts array and targetLocale are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LINGO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Lingo.dev API key not configured" },
        { status: 500 }
      );
    }

    const lingoDotDev = new LingoDotDevEngine({
      apiKey,
    });

    const translationPromises = texts.map(async (text, index) => {
      if (!text || text.trim() === "") {
        return text;
      }
      const cacheKeyParts = ruleId
        ? ["batch_translation", ruleId, targetLocale, `item_${index}`]
        : ["batch_translation", "general", targetLocale, `item_${index}`];

      const getCachedTranslation = unstable_cache(
        async () => {
          try {
            return await lingoDotDev.localizeText(text, {
              sourceLocale,
              targetLocale,
            });
          } catch (error) {
            console.error("Translation error for text:", text, error);
            return text;
          }
        },
        cacheKeyParts,
        {
          revalidate: 7200,
          tags: ["translations", ruleId ? `rule-${ruleId}` : "general"],
        }
      );

      return getCachedTranslation();
    });

    const translatedTexts = await Promise.all(translationPromises);

    return NextResponse.json({ translatedTexts });
  } catch (error) {
    console.error("Batch translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate texts" },
      { status: 500 }
    );
  }
}
