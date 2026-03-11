import { Injectable } from '@nestjs/common';
import { PriceStrategy } from './price.strategy';
import { KnowledgeStrategy } from './knowledge.strategy';
import { OutOfScopeStrategy } from './outofscope.strategy';
import { LlmService } from '../../knowledge/llm.service';
import { GEMINI_TOOLS } from '../tools';
import { extractSymbol } from '../utils/symbol-extractor';
import { normalizeVietnamese } from '../utils/normalize';
import { detectPriceTimeIntent } from '../utils/time-intent';

@Injectable()
export class ChatOrchestratorService {

  private conversationHistory: any[] = [];
  private answerCache = new Map<string, string>();

  // nhớ coin trong hội thoại
  private currentSymbol: string | null = null;

  constructor(
    private priceStrategy: PriceStrategy,
    private knowledgeStrategy: KnowledgeStrategy,
    private outOfScopeStrategy: OutOfScopeStrategy,
    private llmService: LlmService,
  ) {}

  async handle(message: string): Promise<string> {

    const normalizedMessage = normalizeVietnamese(message);

    // ===============================
    // 1️⃣ ANSWER CACHE
    // ===============================
    const cacheKey = normalizedMessage;

    if (this.answerCache.has(cacheKey)) {
      return this.answerCache.get(cacheKey)!;
    }

    // ===============================
    // 2️⃣ MEMORY LIMIT
    // ===============================

    this.conversationHistory.push({
      role: 'user',
      content: message,
    });

    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
    }

    // ===============================
    // 3️⃣ SYMBOL DETECTION
    // ===============================

    const detectedSymbol = extractSymbol(message);
// nếu user chỉ nhập coin symbol → mặc định hỏi giá
    const isOnlySymbol =
      detectedSymbol &&
      normalizedMessage.trim() === detectedSymbol.toLowerCase();
    if (detectedSymbol) {
      this.currentSymbol = detectedSymbol;
    }

    // ===============================
    // 4️⃣ TIME INTENT
    // ===============================

    const timeIntent = detectPriceTimeIntent(message);

    // ===============================
    // 5️⃣ PRICE INTENT DETECTION
    // ===============================

    const hasDate = /\d{1,2}\/\d{1,2}\/\d{4}/.test(message);

    const needPrice =
      detectedSymbol &&
      (
        isOnlySymbol ||
        normalizedMessage.includes('gia') ||
        normalizedMessage.includes('bao nhieu') ||
        normalizedMessage.includes('hien tai') ||
        normalizedMessage.includes('hom nay') ||
        normalizedMessage.includes('hom qua') ||
        normalizedMessage.includes('dong cua') ||
        normalizedMessage.includes('price') ||
        hasDate
      );

    const needKnowledge =
      normalizedMessage.includes('la gi') ||
      normalizedMessage.includes('giai thich');

    // ===============================
    // 6️⃣ FAST PRICE PATH
    // ===============================

    if (needPrice) {

      const symbol = detectedSymbol;

      if (!symbol) {
        return 'Bạn vui lòng cung cấp tên coin (BTC, ETH, SOL...)';
      }

      try {

        const result = await this.priceStrategy.execute(
          symbol,
          timeIntent
        );

        this.answerCache.set(cacheKey, result);

        return result;

      } catch (error) {

        return 'Không thể lấy dữ liệu giá lúc này.';

      }
    }

    // ===============================
    // 7️⃣ FAST KNOWLEDGE PATH
    // ===============================

    if (needKnowledge) {

      const result = await this.knowledgeStrategy.execute(message);

      this.answerCache.set(cacheKey, result);

      return result;

    }

    // ===============================
    // 8️⃣ AGENT TOOL DECISION
    // ===============================

    const toolDecisionMessages = [
      {
        role: 'system',
        content: `
You are CoinSight AI.

You MUST decide which tool to call.

TOOLS:

get_price
Use when the user asks about:
• crypto price
• today price
• historical price
• "bao nhiêu"
• "giá"
• "hôm nay"
• "hôm qua"
• specific date

search_knowledge
Use when the user asks about:
• definition
• explanation
• mechanism
• "là gì"
• "giải thích"

CRITICAL RULES:

If crypto symbol appears AND user implies price → call get_price.

Do NOT answer price directly.

Prefer tool calls when possible.
`,
      },
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await this.llmService.generateWithTools(
      toolDecisionMessages,
      GEMINI_TOOLS,
    );

    const candidate = response.candidates?.[0];

    const parts = candidate?.content?.parts || [];

    const functionCallPart = parts.find(p => p.functionCall);

    // ===============================
    // 9️⃣ TOOL EXECUTION
    // ===============================

    if (functionCallPart?.functionCall) {

      const { name, args } = functionCallPart.functionCall;

      console.log('FUNCTION CALL:', name, args);

      let toolResult = '';

      if (name === 'get_price') {

        const symbol =
          extractSymbol(args.query) ||
          extractSymbol(message) ||
          this.currentSymbol;

        if (!symbol) {
          toolResult = 'Bạn vui lòng cung cấp tên coin (BTC, ETH, SOL...)';
        } else {

          this.currentSymbol = symbol;

          const timeIntent = detectPriceTimeIntent(args.query || message);

          toolResult = await this.priceStrategy.execute(
            symbol,
            timeIntent
          );

        }

      }

      if (name === 'search_knowledge') {

        toolResult = await this.knowledgeStrategy.execute(args.query);

      }

      this.conversationHistory.push({
        role: 'assistant',
        content: toolResult,
      });

      this.answerCache.set(cacheKey, toolResult);

      return toolResult;

    }

    // ===============================
    // 🔟 DIRECT LLM RESPONSE
    // ===============================

    const textPart = parts.find(p => p.text);

    const directText =
      textPart?.text || 'Xin lỗi, tôi chưa hiểu câu hỏi.';

    this.conversationHistory.push({
      role: 'assistant',
      content: directText,
    });

    this.answerCache.set(cacheKey, directText);

    return directText;
  }
}