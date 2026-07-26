import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, CheckCircle2 } from "lucide-react";
import { db } from "@/api/dataClient";
import { Button } from "@/components/ui/button";
import moment from "moment";

const parseList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try {
    const p = JSON.parse(val);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1720744786849-a7412d24ffbf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmxvZyUyMGRldGFpbHN8ZW58MHx8MHx8fDA%3D";

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.BlogPost.get(id)
      .then(setPost)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <p className="text-muted-foreground">Post not found</p>
        <Link to="/blog">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      {/* FIX: pt-28 pb-16 was fixed on every screen size; now scales down on mobile. */}
      <section className="relative pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-10 md:pb-12 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-[#0E8C7A]/85" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 sm:mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {post.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-4">
                {post.category}
              </span>
            )}
            <h1 className="font-heading font-bold text-[clamp(1.6rem,5.5vw,3rem)] text-white mb-4 leading-tight text-balance">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 shrink-0" />
                {moment(post.publication_date || post.created_date).format("MMM D, YYYY")}
              </span>
              {post.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 shrink-0" />
                  {post.author}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      {/* FIX: "max-w-8xl" isn't a valid Tailwind class (scale stops at 7xl), so it
          was silently ignored — the article had no width limit and could stretch
          to an unreadable line length on wide screens. Also "py-5" never changed
          across breakpoints, so this section never got proper breathing room. */}
      <section className="py-8 sm:py-9 md:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {post.cover_image_url && (
            <div className="w-full max-h-[28rem] sm:max-h-[32rem] overflow-hidden rounded-2xl shadow-lg mb-6 sm:mb-8 bg-muted flex items-center justify-center">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-auto max-h-[28rem] sm:max-h-[32rem] object-contain"
              />
            </div>
          )}
          <article
            className="bg-white rounded-2xl p-6 sm:p-8 md:p-12 border border-border/50 shadow-sm prose prose-sm sm:prose-base md:prose-lg max-w-none prose-headings:font-heading prose-a:text-primary prose-img:rounded-xl"
            // FIX: content now comes from a WYSIWYG editor (Quill) which outputs HTML,
            // not Markdown — <ReactMarkdown> would have shown raw HTML tags as plain
            // text instead of rendering them. This content is admin-authored only
            // (behind the protected /admin route), not public user input.
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {parseList(post.key_points).length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm mt-6 sm:mt-8">
              <h2 className="font-heading font-bold text-lg sm:text-xl mb-4">Key Points</h2>
              <ul className="space-y-2.5">
                {parseList(post.key_points).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0 mt-0.5" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parseList(post.additional_images).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
              {parseList(post.additional_images).map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${post.title} - image ${idx + 1}`}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover rounded-2xl shadow-sm border border-border/50"
                />
              ))}
            </div>
          )}

          <div className="mt-7 sm:mt-8 text-center">
            <Link to="/blog">
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}