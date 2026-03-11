// src/knowledge/data/raw-knowledge.ts

import { RawKnowledge } from './raw-knowledge.types';

export const RAW_KNOWLEDGE: RawKnowledge[] = [
  {
    id: 'ema-crossover-v1',

    title: 'EMA Crossover Strategy',
    source: 'Internal Research Note',
    author: 'System',
    publishedYear: 2024,

    domain: 'trading',
    category: 'strategy',

    level: 'beginner',

    tags: ['ema', 'trend', 'crossover', 'spot'],

    version: 1,

    content: `
    EMA Crossover là chiến lược giao cắt giữa EMA 9 và EMA 21.
    RAG_SECRET_TEST: ABCD9999
    Khi EMA 9 cắt lên EMA 21 → tín hiệu mua.
    Khi EMA 9 cắt xuống EMA 21 → tín hiệu bán.
    Chiến lược này hoạt động tốt trong thị trường có xu hướng rõ ràng.
    BTC là đồng tiền ảo phổ biến nhất.
`
  }
];