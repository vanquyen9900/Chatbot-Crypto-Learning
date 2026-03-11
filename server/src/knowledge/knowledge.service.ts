import { Injectable, OnModuleInit } from '@nestjs/common';
import { RAW_KNOWLEDGE } from './data/raw-knowledge';
import { RawKnowledge } from './data/raw-knowledge.types';
import { chunkText } from './chunking/chunker';
import { VectorDocument } from './vector/vector.types';
import { FileVectorStore } from './vector/file-vector-store';
import { EmbeddingService } from './vector/embedding.service';
import { RAG_CONFIG } from './constants/rag.constants';
import { NewsService } from './news/news.service';
import { NewsArticle } from './news/news.types';
@Injectable()
export class KnowledgeService implements OnModuleInit {

  private vectorStore = new FileVectorStore();

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly newsService: NewsService
  ) {}

  async onModuleInit() {

    console.log('--- KNOWLEDGE PIPELINE START ---');

    /**
     * STEP 1 — Load static knowledge
     */
    const rawKnowledge: RawKnowledge[] = RAW_KNOWLEDGE;

    console.log('Loaded static knowledge count:', rawKnowledge.length);

    /**
     * STEP 2 — Fetch crypto news (safe)
     */
    let newsArticles: NewsArticle[] = [];

    try {

      newsArticles = await this.newsService.fetchCryptoNews();

      console.log('News fetched:', newsArticles.length);

    } catch (err) {

      console.log('News fetch failed → skip news');

      newsArticles = [];

    }

    /**
     * STEP 3 — Convert news → RawKnowledge format
     */
    const newsKnowledge: RawKnowledge[] = newsArticles.map(
      (article, index): RawKnowledge => ({
        id: `news-${index}`,

        title: article.title,

        source: article.source?.name,

        domain: 'trading',

        category: 'research_paper',

        level: 'beginner',

        tags: ['crypto', 'news', 'market'],

        version: 1,

        content: `
      Title: ${article.title}

      Description: ${article.description ?? ''}

      Content: ${article.content ?? ''}

      Source: ${article.source?.name ?? ''}

      Published: ${article.publishedAt}
`,
      }),
    );

    /**
     * STEP 4 — Merge static knowledge + news
     */
    const rawItems: RawKnowledge[] = [
      ...rawKnowledge,
      ...newsKnowledge,
    ];

    console.log('Total knowledge items:', rawItems.length);

    /**
     * STEP 5 — Chunk → Embed → Vector Store
     */

    const vectorDocs: VectorDocument[] = [];

    const existingVectors = this.vectorStore.getAll();

    console.log('Existing vectors:', existingVectors.length);

    for (const item of rawItems) {

      const chunks = chunkText(item.content, {
        chunkSize: 1500,
        overlap: 200,
      });

      console.log(`Item ${item.id} chunk count:`, chunks.length);

      for (let i = 0; i < chunks.length; i++) {

        const chunk = chunks[i];

        const id = `${item.id}-chunk-${i}`;

        /**
         * Skip nếu vector đã tồn tại
         */
        const exists = existingVectors.some(v => v.id === id);

        if (exists) {
          continue;
        }

        try {

          const embedding = await this.embeddingService.embed(chunk);

          vectorDocs.push({
            id,
            content: chunk,
            metadata: {
              sourceType: 'knowledge',
              sourceId: item.id,
              tags: [
                ...item.tags,
                item.domain,
                item.category,
                item.level,
              ],
            },
            embedding,
          });

        } catch (err) {

          console.log('Embedding failed for chunk:', id);

        }

      }
    }

    /**
     * Save vectors
     */
    if (vectorDocs.length > 0) {

      this.vectorStore.addDocuments(vectorDocs);

      console.log('New vectors added:', vectorDocs.length);

    }

    /**
     * DEBUG INFO
     */

    const allVectors = this.vectorStore.getAll();

    console.log(
      'Total vector documents:',
      allVectors.length,
    );

    if (allVectors.length > 0) {

      console.log(
        'Embedding dimension:',
        allVectors[0].embedding.length,
      );

      console.log(
        'Sample vector:',
        {
          id: allVectors[0].id,
          contentPreview: allVectors[0].content.slice(0, 150)
        }
      );

    }

    console.log('--- KNOWLEDGE PIPELINE END ---');
  }

  /**
   * RAG SEARCH
   */
  async search(query: string, topK = RAG_CONFIG.TOP_K) {

    const queryEmbedding =
      await this.embeddingService.embed(query);

    const results = this.vectorStore.similaritySearch(
      queryEmbedding,
      topK,
    );

    console.log('--- SEARCH DEBUG ---');

    results.forEach((r, i) => {

      console.log(`Result ${i + 1} score:`, r.score);

      console.log(
        r.doc.content.slice(0, 300)
      );

      console.log('------------------');

    });

    /**
     * Filter top results
     */
    const filtered = results.slice(0, 5);

    console.log('Filtered count:', filtered.length);

    return filtered.map(r => ({
      doc: { content: r.doc.content },
      metadata: r.doc.metadata,
      score: r.score,
    }));
  }

  /**
   * Debug vector store
   */
  getAllVectors() {

    return this.vectorStore.getAll();

  }

}

export interface SearchResult {
  doc: {
    content: string;
  };
  metadata: {
    sourceId: string;
    sourceType: string;
    tags?: string[];
  };
  score?: number;
}