import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, ArrowUpRight } from "lucide-react";
import { db } from "@/api/dataClient";
import moment from "moment";

const LIMIT = 4;

export default function LatestBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // "-created_date" = newest first, so the latest posts lead the section.
    db.entities.BlogPost.filter({ status: "published" }, "-created_date", LIMIT)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-3">
              From the Blog
            </span>
            <h2 className="font-heading font-bold text-[clamp(1.4rem,3.6vw,2rem)] text-foreground text-balance">
              Latest Health &amp; Wellness Insights
            </h2>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 text-primary font-heading font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
          >
            View All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border/50 animate-pulse">
                <div className="h-40 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-16 bg-muted rounded" />
                  <div className="h-4 w-4/5 bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link
                  to={`/blog/${post.id}`}
                  className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden shrink-0">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary/15">{post.title?.[0]}</span>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-primary text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">
                        {post.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-heading font-bold text-sm sm:text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-auto">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {moment(post.publication_date || post.created_date).format("MMM D")}
                      </span>
                      {post.author ? (
                        <span className="flex items-center gap-1.5 truncate max-w-[90px]">
                          <User className="w-3.5 h-3.5 shrink-0" />
                          {post.author}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Read <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mobile-only "view all" — desktop version sits next to the heading above */}
        <div className="sm:hidden text-center mt-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/30 text-primary font-heading font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            View All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}