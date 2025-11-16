import { NextRequest, NextResponse } from "next/server";
import { LingoDotDevEngine } from "lingo.dev/sdk";
import { unstable_cache } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const {
      text,
      sourceLocale = "en",
      targetLocale,
      ruleId,
    } = await request.json();

    if (!text || !targetLocale) {
      return NextResponse.json(
        { error: "Text and targetLocale are required" },
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

    const cacheKeyParts = ruleId
      ? ["translation", ruleId, targetLocale]
      : ["translation", "general", targetLocale, text.slice(0, 50)];

    const getCachedTranslation = unstable_cache(
      async () => {
        const lingoDotDev = new LingoDotDevEngine({
          apiKey,
        });

        return await lingoDotDev.localizeText(text, {
          sourceLocale,
          targetLocale,
        });
      },
      cacheKeyParts,
      {
        revalidate: 7200,
        tags: ["translations", ruleId ? `rule-${ruleId}` : "general"],
      }
    );

    const translatedText = await getCachedTranslation();

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Failed to translate text" },
      { status: 500 }
    );
  }
}
