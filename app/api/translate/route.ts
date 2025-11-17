import { NextRequest, NextResponse } from "next/server";

const TRANSLATION_MODEL = "gpt-5-mini";

type TranslateRequestBody = {
  text?: unknown;
  sourceLanguage?: unknown;
  targetLanguages?: unknown;
};

type ChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const parseBody = async (request: NextRequest) => {
  try {
    return (await request.json()) as TranslateRequestBody;
  } catch (error) {
    console.error("Failed to parse translate request body", error);
    throw new Error("無効なJSONです。");
  }
};

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI APIキーが設定されていません。" },
      { status: 500 }
    );
  }

  let body: TranslateRequestBody;
  try {
    body = await parseBody(request);
  } catch (error) {
    console.error("[Translate API] Invalid JSON body:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "無効なリクエストです。" },
      { status: 400 }
    );
  }

  const { text, sourceLanguage, targetLanguages } = body;

  if (typeof text !== "string" || text.trim().length === 0) {
    console.error("[Translate API] Invalid text:", { text, type: typeof text });
    return NextResponse.json(
      { error: "翻訳するテキストを入力してください。" },
      { status: 400 }
    );
  }

  if (typeof sourceLanguage !== "string" || sourceLanguage.trim().length === 0) {
    console.error("[Translate API] Invalid sourceLanguage:", { sourceLanguage, type: typeof sourceLanguage });
    return NextResponse.json(
      { error: "元の言語が指定されていません。" },
      { status: 400 }
    );
  }

  if (!Array.isArray(targetLanguages) || targetLanguages.length === 0) {
    console.error("[Translate API] Invalid targetLanguages:", { targetLanguages, isArray: Array.isArray(targetLanguages) });
    return NextResponse.json(
      { error: "翻訳対象の言語が指定されていません。" },
      { status: 400 }
    );
  }

  const trimmedText = text.trim();
  const normalizedSource = sourceLanguage.trim().toLowerCase();
  const normalizedTargets = Array.from(
    new Set(
      targetLanguages
        .map((lang) =>
          typeof lang === "string" ? lang.trim().toLowerCase() : String(lang)
        )
        .filter((lang) => lang.length > 0 && lang !== normalizedSource)
    )
  );

  if (normalizedTargets.length === 0) {
    console.error("[Translate API] No valid target languages after normalization:", { 
      originalTargetLanguages: targetLanguages, 
      normalizedTargets, 
      normalizedSource 
    });
    return NextResponse.json(
      { error: "翻訳対象の言語が指定されていません。" },
      { status: 400 }
    );
  }

  const prompt =
    `Please translate the following ${normalizedSource} text into the target languages. ` +
    `Respond in JSON format with each language code as the key and the translated text as the value. ` +
    `Only include the requested language codes: ${normalizedTargets.join(", ")}.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: TRANSLATION_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a professional translator. Return results as a compact JSON object.",
          },
          {
            role: "user",
            content: `${prompt}\n\nText:\n"""${trimmedText}"""`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      console.error("[Translate API] OpenAI API error:", { 
        status: response.status, 
        statusText: response.statusText, 
        errorPayload 
      });
      const message =
        typeof errorPayload?.error === "string"
          ? errorPayload.error
          : response.statusText;
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const completion = (await response.json()) as ChatCompletion;
    const content = completion?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "翻訳結果を取得できませんでした。" },
        { status: 502 }
      );
    }

    let translations: Record<string, string> = {};
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      normalizedTargets.forEach((lang) => {
        const value = parsed[lang];
        if (typeof value === "string") {
          translations[lang] = value.trim();
        }
      });
    } catch (error) {
      console.error("Failed to parse translation response", error, content);
      return NextResponse.json(
        { error: "翻訳結果の解析に失敗しました。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Translation request failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "翻訳中に予期せぬエラーが発生しました。",
      },
      { status: 500 }
    );
  }
}
