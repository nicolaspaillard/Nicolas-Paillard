import { inject, Injectable } from "@angular/core";
import { doc, Firestore, getDoc } from "@angular/fire/firestore";
import { ApiError, GoogleGenAI, Model } from "@google/genai";

@Injectable({
  providedIn: "root",
})
export class PromptService {
  private db: Firestore = inject(Firestore);
  getAi = async () => new GoogleGenAI({ apiKey: (await getDoc(doc(this.db, "keys", "gemini"))).get("api_key") as string });
  getModels = async (): Promise<string[]> => {
    const ai = await this.getAi();
    // const models = (await ai.models.list({ config: { pageSize: 1000 } })).page.filter(model => {});
    const models: Model[] = [];
    for await (const model of await ai.models.list()) {
      const isTextCapable = model.supportedActions?.includes("generateContent");
      const isNotSpecialized = model.name && !model.name.includes("image") && !model.name.includes("tts") && !model.name.includes("live") && !model.name.includes("audio") && !model.name.includes("embedding");
      if (isNotSpecialized && isTextCapable) models.push(model);
    }
    return models
      .map(model => {
        let score = 0;
        if (model.name!.includes("pro")) score += 100;
        if (model.name!.includes("latest")) score += 20;
        if (model.name!.includes("flash")) score += 70;
        if (model.name!.includes("lite")) score += 40;
        if (model.name!.includes("preview")) score -= 10;
        if (model.name!.includes("exp")) score -= 20;
        return { score: score, model: model };
      })
      .sort((a, b) => b.score - a.score)
      .map(model => model.model.name!);
  };
  prompt = async (prompt: string): Promise<{ model: string; text: string }> => {
    const ai = await this.getAi();
    let lastError: ApiError | undefined;
    for (const model of await this.getModels()) {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: { systemInstruction: "Tu parles exclusivement en français" },
        });
        return { model: model, text: response.text! };
      } catch (err: unknown) {
        if (!(err instanceof Error)) throw err;
        const parsed = JSON.parse(err.message) as { error: ApiError };
        const status = (err as { status?: number }).status;
        if (!status || ![429, 500, 502, 503, 504].includes(status)) throw parsed.error;
        lastError = parsed.error;
      }
    }
    throw lastError as ApiError;
  };
}
