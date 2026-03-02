import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function summarizeTicket(description: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Resuma o seguinte problema técnico em um título curto (máximo 10 palavras), mantendo os pontos mais importantes: "${description}"`,
      config: {
        systemInstruction: "Você é um assistente técnico que resume descrições de problemas em títulos concisos e informativos para um painel de suporte.",
      },
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error summarizing ticket:", error);
    return "";
  }
}
