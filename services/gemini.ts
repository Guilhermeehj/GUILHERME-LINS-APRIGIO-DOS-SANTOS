import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize, MusicTheoryData } from "../types";

// Helper to get client with current key
const getClient = () => {
  // Always create a new client to ensure we pick up any potentially updated environment API key 
  // (though in this environment it is usually static process.env.API_KEY).
  // For 'gemini-3-pro-image-preview', the user might have selected a key via window.aistudio.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const streamChat = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  onChunk: (text: string) => void
) => {
  const ai = getClient();
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: history,
    config: {
        // Higher thinking budget for better reasoning in chat if needed, 
        // but default is usually fine for general chat.
    }
  });

  const result = await chat.sendMessageStream({ message });
  
  for await (const chunk of result) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
};

export const generateProImage = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getClient();
  
  // Requirement: Users MUST select their own API key for this model if not already done.
  // We assume the caller handles the UI for `window.aistudio.openSelectKey()`.
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1" // Default square, can be made configurable if needed
      }
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image data returned from Gemini.");
};

export const getMusicTheoryAnalysis = async (query: string): Promise<MusicTheoryData> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze this music theory request: "${query}". 
    Return a JSON object with the scale/chord name, type, array of notes (just note names like C, D#, F, etc. without octaves unless specific), and a short description.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['scale', 'chord', 'interval', 'melody'] },
          notes: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          description: { type: Type.STRING }
        },
        required: ["name", "type", "notes", "description"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No data returned");
  return JSON.parse(text) as MusicTheoryData;
};