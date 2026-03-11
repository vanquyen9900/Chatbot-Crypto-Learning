import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Tag,
} from "lucide-react";

interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  category: string;
  source: string;
  date: string;
  imageUrl?: string;
  content?: string;
  whyMatters?: string;
  relatedCoins?: string[];
  url?: string;
}

export function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>("All");
  const [selectedArticle, setSelectedArticle] =
    useState<NewsArticle | null>(null);

  const categories = [
    "All",
    "Market",
    "Bitcoin",
    "Altcoins",
    "Regulation",
    "Education",
  ];

  // ✅ Fetch crypto news with image + content
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(
          ....
        );

        const data = await res.json();

        const mapped: NewsArticle[] = data.articles.map(
          (item: any, index: number) => ({
            id: index,
            title: item.title,
            summary: item.description || "Crypto market update",
            category: "Market",
            source: item.source.name,
            date: new Date(item.publishedAt).toLocaleDateString(),
            imageUrl: item.image,
            content: item.content || item.description,
            whyMatters:
              "Crypto news helps beginners understand how global events impact digital assets.",
            relatedCoins: ["Bitcoin", "Ethereum"],
            url: item.url,
          }),
        );

        setArticles(mapped);
      } catch (err) {
        console.error("News fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      article.summary
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-black/60">
        Đang tải tin tức crypto...
      </div>
    );
  }

  // ================= DETAIL VIEW =================
  if (selectedArticle) {
    return (
      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <button
            onClick={() => setSelectedArticle(null)}
            className="mb-8 flex items-center gap-2 text-black/60 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </button>

          <h1 className="mb-4 text-4xl font-bold">
            {selectedArticle.title}
          </h1>

          <p className="mb-6 text-black/60">
            {selectedArticle.summary}
          </p>

          {selectedArticle.imageUrl && (
            <img
              src={selectedArticle.imageUrl}
              alt={selectedArticle.title}
              className="mb-8 rounded-xl"
            />
          )}

          <p className="mb-8 text-black/80 leading-relaxed">
            {selectedArticle.content}
          </p>

          {selectedArticle.url && (
            <a
              href={selectedArticle.url}
              target="_blank"
              className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            >
              Đọc bài gốc
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // ================= LIST VIEW =================
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">
        Tin tức Crypto
      </h1>

      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full rounded border p-3"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <article
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="cursor-pointer overflow-hidden rounded-xl border hover:shadow"
          >
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="h-48 w-full object-cover"
              />
            )}

            <div className="p-4">
              <h3 className="mb-2 font-bold">
                {article.title}
              </h3>

              <p className="text-sm text-black/60 line-clamp-3">
                {article.summary}
              </p>

              <div className="mt-2 text-xs text-black/50">
                {article.source} • {article.date}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
