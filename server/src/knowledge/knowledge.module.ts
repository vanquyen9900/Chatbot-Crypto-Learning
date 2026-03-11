import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { RagService } from './rag.service';
import { EmbeddingService } from './vector/embedding.service';
import { InMemoryVectorStore } from './vector/in-memory.vector-store';
import { LlmService } from './llm.service';
import { NewsService } from './news/news.service';
@Module({
  providers: [
    KnowledgeService,
    RagService,
    EmbeddingService,
    InMemoryVectorStore,
    LlmService,
    NewsService,
  ],
  exports: [RagService,LlmService],
})
export class KnowledgeModule {}