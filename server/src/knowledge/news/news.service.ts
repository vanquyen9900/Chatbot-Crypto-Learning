import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GNewsResponse, NewsArticle } from './news.types';

@Injectable()
export class NewsService {

  private readonly API =
    "https://gnews.io/api/v4/search?q=cryptocurrency&lang=en&max=20&apikey=2ea7decf19554e8a986b5fd622da827a";

  async fetchCryptoNews(): Promise<NewsArticle[]> {

    const res = await axios.get<GNewsResponse>(this.API);

    const articles = res.data.articles;

    const fullArticles: NewsArticle[] = [];

    for (const article of articles) {

      const fullContent = await this.fetchFullArticle(article.url);

      fullArticles.push({
        ...article,
        content: fullContent ?? article.content ?? article.description ?? '',
      });

    }

    return fullArticles;
  }

  async fetchFullArticle(url: string): Promise<string | null> {

    try {

      const res = await axios.get(url);

      const $ = cheerio.load(res.data);

      const text = $('p')
        .map((i, el) => $(el).text())
        .get()
        .join('\n');

      return text;

    } catch {

      return null;

    }

  }

}