'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchHealthNews } from '../../services/apitube';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  image: string;
  publishedAt: string;
  source: string;
  link: string;
}

export const BlogScreen: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Research', 'Treatment', 'Prevention', 'Wellness'];

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        setError(null);
        const news = await fetchHealthNews(12);
        setArticles(news);
      } catch (err) {
        console.error('Failed to fetch health news:', err);
        setError('Failed to load health news. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, []);

  const filteredArticles = articles;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Health News</h1>
        <p className="text-[var(--muted)]">Latest health and medical news from trusted sources</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[var(--surface)] rounded-xl overflow-hidden border border-gray-800 animate-pulse">
              <div className="h-48 bg-gray-800" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-20" />
                <div className="h-6 bg-gray-800 rounded w-full" />
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="flex justify-between mt-4">
                  <div className="h-4 bg-gray-800 rounded w-24" />
                  <div className="h-4 bg-gray-800 rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Articles grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => window.open(article.link, '_blank')}
              className="bg-[var(--surface)] rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer group"
            >
              {/* Article Image */}
              <div className="h-48 overflow-hidden bg-gray-800">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-yellow)] flex items-center justify-center">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 15L16 10L5 21"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Source badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-yellow)] text-white">
                    {article.source}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-white font-bold text-xl mb-3 group-hover:text-[var(--accent-orange)] transition-colors line-clamp-2">
                  {article.title}
                </h2>

                {/* Summary */}
                <p className="text-[var(--muted)] text-sm mb-4 line-clamp-3">
                  {article.summary || 'Click to read more...'}
                </p>

                {/* Date */}
                <div className="flex items-center justify-between text-sm">
                  <p className="text-[var(--muted)] text-xs">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <span className="text-[var(--accent-orange)] text-xs font-semibold">
                    Read more →
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Subscribe CTA */}
      {!loading && !error && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-8 bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-yellow)] rounded-2xl text-center"
      >
        <h2 className="text-white font-bold text-2xl mb-2">Stay Informed</h2>
        <p className="text-white/90 mb-6">
          Get the latest research and insights delivered to your inbox
        </p>
        <div className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white transition-colors"
          />
          <button className="px-6 py-3 rounded-lg bg-white text-[var(--accent-orange)] font-semibold hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-white">
            Subscribe
          </button>
        </div>
      </motion.div>
      )}
    </div>
  );
};
