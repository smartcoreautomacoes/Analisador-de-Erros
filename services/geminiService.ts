import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';
import { EngineeringResponse } from '../types';

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeEngineeringContext = async (
  imageFile: File, 
  ragContext: string
): Promise<EngineeringResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const base64Image = await fileToGenerativePart(imageFile);

  const prompt = `
    ${SYSTEM_PROMPT}
    
    ---
    CONHECIMENTO RECUPERADO (RAG):
    ${ragContext || "Nenhum conhecimento específico fornecido. Use melhores práticas gerais."}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using flash for speed/efficiency in this demo
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert engineering assistant. Always output valid JSON matching the requested schema.",
        // Defining the schema explicitly helps Gemini 2.5 Flash be very precise
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumo_visual: {
              type: Type.OBJECT,
              properties: {
                tipo: { type: Type.STRING },
                textos: { type: Type.ARRAY, items: { type: Type.STRING } },
                sintomas: { type: Type.ARRAY, items: { type: Type.STRING } },
                hipoteses: { type: Type.ARRAY, items: { type: Type.STRING } },
                termos_chave: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["tipo", "textos", "sintomas", "hipoteses"],
            },
            perguntas: { type: Type.ARRAY, items: { type: Type.STRING } },
            comandos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  prioridade: { type: Type.STRING, enum: ["Alta", "Média", "Baixa"] },
                  descricao: { type: Type.STRING },
                  execucao: { type: Type.ARRAY, items: { type: Type.STRING } },
                  pre_checks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  pos_checks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rollback: { type: Type.ARRAY, items: { type: Type.STRING } },
                  notas: { type: Type.STRING },
                },
                required: ["prioridade", "descricao", "execucao", "pre_checks", "pos_checks", "rollback"],
              },
            },
            variaveis_para_confirmar: { type: Type.ARRAY, items: { type: Type.STRING } },
            riscos_e_precaucoes: { type: Type.ARRAY, items: { type: Type.STRING } },
            fontes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text received");

    return JSON.parse(text) as EngineeringResponse;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
