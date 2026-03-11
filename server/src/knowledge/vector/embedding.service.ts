export class EmbeddingService {
  private apiKey: string;

  private embeddingCache = new Map<string, number[]>();

  private apiCallCount = 0;

  private vectorDimension: number | null = null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY!;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!text || !text.trim()) {
      throw new Error('Cannot embed empty text');
    }

    const normalized = text.trim().toLowerCase();

    if (this.embeddingCache.has(normalized)) {
      console.log('⚡ EMBEDDING CACHE HIT');
      return this.embeddingCache.get(normalized)!;
    }

    console.log('🌍 CALLING GEMINI EMBEDDING API');
    this.apiCallCount++;
    console.log('API CALL COUNT:', this.apiCallCount);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Embedding API error: ${err}`);
    }

    const data = await response.json();

    if (!data?.embedding?.values) {
      throw new Error('Invalid embedding response structure');
    }

    const embedding: number[] = data.embedding.values;

    if (!this.vectorDimension) {
      this.vectorDimension = embedding.length;
      console.log('📏 Embedding dimension:', this.vectorDimension);
    }

    this.embeddingCache.set(normalized, embedding);

    return embedding;
  }

  getCacheSize(): number {
    return this.embeddingCache.size;
  }

  getApiCallCount(): number {
    return this.apiCallCount;
  }
}