import { GoogleGenAI, Chat, GenerateContentResponse, Part, Content, GroundingChunk as SDKGroundingChunk } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';
import { GroundingChunk as LocalGroundingChunk } from '../types';

let ai: GoogleGenAI | null = null;

const getApiKey = (): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is not defined in environment variables.");
    throw new Error("API_KEY_MISSING: Khóa API chưa được cấu hình.");
  }
  return apiKey;
};

export const initializeGemini = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = getApiKey();
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const startChatSession = async (systemInstruction: string): Promise<Chat> => {
  const currentAi = initializeGemini();
  const chatConfig = {
    model: GEMINI_MODEL_TEXT,
    config: {
      systemInstruction: systemInstruction, // Use the provided system instruction
    },
    // History can be added here if needed
  };
  return currentAi.chats.create(chatConfig);
};

export const streamMessage = async (
  chat: Chat,
  messageText: string,
  onChunk: (textChunk: string, groundingChunks?: LocalGroundingChunk[]) => void,
  onComplete: (fullText: string, groundingChunks?: LocalGroundingChunk[]) => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const result = await chat.sendMessageStream({ message: messageText });
    let fullText = "";
    let accumulatedLocalGroundingChunks: LocalGroundingChunk[] = [];

    for await (const sdkResponseChunk of result) {
      const textChunk = sdkResponseChunk.text;
      fullText += textChunk;
      
      const sdkGroundingMetadata = sdkResponseChunk.candidates?.[0]?.groundingMetadata;
      let newLocalChunksFromThisSdkChunk: LocalGroundingChunk[] | undefined = undefined;

      if (sdkGroundingMetadata?.groundingChunks && sdkGroundingMetadata.groundingChunks.length > 0) {
         newLocalChunksFromThisSdkChunk = sdkGroundingMetadata.groundingChunks.map((sdkGc: SDKGroundingChunk): LocalGroundingChunk => {
            return {
              web: sdkGc.web ? { uri: sdkGc.web.uri, title: sdkGc.web.title } : undefined,
              retrievedContext: sdkGc.retrievedContext ? { uri: sdkGc.retrievedContext.uri, title: sdkGc.retrievedContext.title } : undefined,
            };
         });
         accumulatedLocalGroundingChunks = [...accumulatedLocalGroundingChunks, ...newLocalChunksFromThisSdkChunk];
      }
      onChunk(textChunk, newLocalChunksFromThisSdkChunk);
    }
    
    const uniqueLocalGroundingChunks = Array.from(
        new Map(
            accumulatedLocalGroundingChunks
                .filter(chunk => (chunk.web?.uri || chunk.retrievedContext?.uri)) 
                .map(item => [(item.web?.uri || item.retrievedContext?.uri)!, item])
        ).values()
    );

    onComplete(fullText, uniqueLocalGroundingChunks.length > 0 ? uniqueLocalGroundingChunks : undefined);
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn (stream):", error);
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error("Đã xảy ra lỗi không xác định"));
    }
  }
};
