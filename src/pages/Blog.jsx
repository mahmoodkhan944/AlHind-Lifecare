import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowUpRight, Newspaper } from "lucide-react";
import { db } from "@/api/dataClient";
import moment from "moment";

const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1672759455907-bdaef741cd88?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTI5fHxtZWRpY2FsJTIwYmxvZ3N8ZW58MHx8MHx8fDA%3D";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.BlogPost.filter({ status: "published" }, "-created_date", 50)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      {/* FIX: pt-32 pb-16 was fixed on every screen size, pushing content too far
          down on small phones. Now scales with the viewport. */}
      <section className="relative pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-emerald-900/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-bold text-[clamp(1.75rem,6vw,3rem)] text-white mb-4 text-balance"
          >
            Health &amp; Wellness Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 text-base sm:text-lg text-balance"
          >
            Expert insights on medical tourism and healthcare
          </motion.p>
        </div>
      </section>

      {/* Posts grid */}
      {/* FIX: "max-w-8xl" isn't a real Tailwind class (the scale stops at 7xl), so it
          was silently ignored and the grid had no max-width constraint at all —
          on ultra-wide monitors the cards stretched edge to edge. */}
      <section className="py-8 sm:py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-border/50 animate-pulse">
                  <div className="h-44 sm:h-48 bg-muted" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-4 w-4/5 bg-muted rounded" />
                    <div className="h-3 w-full bg-muted rounded" />
                    <div className="h-3 w-2/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Newspaper className="w-10 h-10 mx-auto mb-3 text-primary/40" />
              <p className="font-medium">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                >
                  <Link
                    to={`/blog/${post.id}`}
                    className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-44 sm:h-48 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden shrink-0">
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl font-bold text-primary/15">{post.title?.[0]}</span>
                        </div>
                      )}
                      {post.category && (
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-primary text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm">
                          {post.category}
                        </span>
                      )}
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <h3 className="font-heading font-bold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-auto">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          {moment(post.publication_date || post.created_date).format("MMM D, YYYY")}
                        </span>
                        {post.author ? (
                          <span className="flex items-center gap-1.5">
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
        </div>
      </section>
    </div>
  );
}