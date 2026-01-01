import { GoogleGenAI, Type } from "@google/genai";
import { ChecklistItem, ChatMessage } from "../types";

const apiKey = import.meta.env.VITE_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateRetailChecklist = async (sectionTitle: string): Promise<ChecklistItem[]> => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return [
      { id: generateId(), text: "Define key objectives (API Key Missing)", completed: false },
      { id: generateId(), text: "Draft initial outline", completed: false }
    ];
  }

  try {
    const prompt = `Generate a specific, actionable 5-item checklist for the "${sectionTitle}" section of a Retail Business Plan. The checklist should focus on standard industry requirements for this specific section.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The checklist item text" }
            }
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const rawItems = JSON.parse(jsonText);

    return rawItems.map((item: any) => ({
      id: generateId(),
      text: item.text,
      completed: false
    }));

  } catch (error) {
    console.error("Error generating checklist:", error);
    return [];
  }
};

export const chatWithRetailConsultant = async (
  currentContent: string,
  sectionTitle: string,
  userPrompt: string,
  history: ChatMessage[]
): Promise<string> => {
  if (!apiKey) return "Please configure your API Key to use the AI assistant.";

  try {
    const historyParts = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Add current context
    const contextPrompt = `
      You are an expert Retail Business Consultant. 
      The user is working on the "${sectionTitle}" section of their business plan.
      Current content of the section: "${currentContent.substring(0, 1000)}..."
      
      User's Request: ${userPrompt}
      
      Provide helpful, professional, and specific advice or content suggestions. Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...historyParts.map(h => ({ role: h.role, parts: h.parts })), // Previous history
        { role: 'user', parts: [{ text: contextPrompt }] }
      ]
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Error communicating with AI assistant.";
  }
};
