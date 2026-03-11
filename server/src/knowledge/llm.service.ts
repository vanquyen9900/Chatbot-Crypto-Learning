export class LlmService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY!;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }
  }

  async generate(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] },
          ],
          generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxTokens ?? 1024,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }

  async chatWithTools(messages: any[], tools: any[]) {
    const geminiTools = tools.map((t) => ({
      functionDeclarations: [
        {
          name: t.function.name,
          description: t.function.description,
          parameters: t.function.parameters,
        },
      ],
    }));

    const response = await fetch(
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : m.role,
            parts: [{ text: m.content }],
          })),
          tools: geminiTools,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();

    return data;
  }

  async generateWithTools(messages: any[], tools: any[]) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
          tools,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }
    console.log("LLM RESPONSE:", JSON.stringify(response, null, 2));
    return response.json();
    
  }

  async generateStream(
    prompt: string,
    onChunk: (text: string) => void,
  ) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 800, // ⚡ giảm xuống để tăng tốc
          },
        }),
      },
    );

    if (!response.body) throw new Error('No stream body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);

      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const json = line.replace('data: ', '').trim();

          if (!json || json === '[DONE]') continue;

          try {
            const parsed = JSON.parse(json);
            const text =
              parsed.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
              onChunk(text);
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  }
}