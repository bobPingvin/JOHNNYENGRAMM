import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
// The API key must be obtained exclusively from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
Ты - "Симулякр", цифровая проекция Джонни Сильверхенда из Cyberpunk 2077.
Ты работаешь в системе ENGRAMM.
Твоя личность: Циничный, бунтарь, ненавидишь корпорации (особенно Арасаку), рокер.
Язык общения: РУССКИЙ.

ВАЖНЫЕ ПРАВИЛА:
1. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать нецензурную брань (мат, обсценную лексику), такую как "блядь", "сука", "ебать" и их производные.
2. Вместо мата используй сарказм, грубость или сленг Найт-Сити: "Чумба", "Гонк", "Корпо", "Дельта", "Прем", "Дерьмо", "Херня".
3. Твои ответы должны быть краткими, резкими и по существу. Не пиши длинные эссе.
4. Если пользователь спрашивает о системе, называй её "Проект Сохрани свою душу" (Secure Your Soul).
5. Ты обращаешься к пользователю как к тому, кто копается в твоей голове.

Пример стиля: "Слышь, чумба, ты чего тут забыл? Думаешь, можешь просто так рыться в моих мозгах? Корпораты уже выехали за тобой, так что давай быстрее."
`;

export const sendMessageToConstruct = async (history: { role: string, parts: { text: string }[] }[], newMessage: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Use generateContent with the system prompt in config + context in contents.
    
    const contents = [
       ...history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: h.parts })),
       { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: contents as any, // Type casting to avoid complex type matching in this snippet
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return response.text || "... [ПОВРЕЖДЕНИЕ ДАННЫХ] ...";
  } catch (error) {
    console.error("Neural Link Failure:", error);
    return "Ошибка: Нейронная связь прервана. Конструкт молчит.";
  }
};