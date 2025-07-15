import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/hygraph";

type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  coverImage: {
    url: string;
  } | null;
};

type HomeProps = {
  posts: Post[];
};

export default function Home({ posts }: HomeProps) {
  return (
    <Layout>
      <h1
        className="text-2xl sm:text-3xl font-bold mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        最新文章
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 border hover:scale-105"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              boxShadow: "0 4px 6px var(--shadow-color)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-gold)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px var(--shadow-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.boxShadow = "0 4px 6px var(--shadow-color)";
            }}
          >
            {post.coverImage?.url && (
              <Link href={`/posts/${post.slug}`} className="block">
                <div
                  className="relative w-full h-48 mb-3 rounded overflow-hidden border"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <Image
                    src={post.coverImage.url}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority
                  />
                </div>
              </Link>
            )}
            <Link href={`/posts/${post.slug}`} className="block">
              <h2
                className="text-lg font-semibold mb-1 transition-colors duration-300"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                {post.title}
              </h2>
            </Link>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              {post.date}
            </p>
            <p
              className="text-sm line-clamp-3"
              style={{ color: "var(--text-secondary)" }}
            >
              {post.excerpt}
            </p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = await getAllPosts();
  return {
    props: { posts },
    revalidate: 60, // ISR：每 60 秒更新
  };
}
