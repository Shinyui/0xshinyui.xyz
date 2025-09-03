import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/hygraph";

type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  contentType: string
  coverImage: {
    url: string;
  } | null;
};

type HomeProps = {
  posts: Post[];
  tags: string[];
};

// 類別名稱轉換函數
const getCategoryDisplayName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'pm': '產品管理',
    'opt': '運營',
    'dev': '程式開發',
    'edtech': "線上教育",
    'other': '其他'
  };
  return categoryMap[category] || category;
};

export default function Home({ posts, tags }: HomeProps) {
  return (
    <Layout>
      <h1
        className="text-2xl sm:text-3xl font-bold mb-8"
        style={{ color: "var(--text-primary)" }}
      >
        最新文章
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/"
          className="inline-block px-3 py-2 rounded-full text-sm font-medium border transition-all duration-300 hover:scale-105"
          style={{
            backgroundColor: "var(--card-background)",
            borderColor: "var(--accent-gold)",
            color: "var(--accent-gold)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-gold)";
            e.currentTarget.style.color = "var(--background)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--card-background)";
            e.currentTarget.style.color = "var(--accent-gold)";
          }}
        >
          全部文章
        </Link>
        {tags.map((tag) => (
          <Link
              key={tag}
              href={`/category/${encodeURIComponent(tag)}`}
              className="inline-block px-3 py-2 rounded-full text-sm font-medium border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--accent-gold)",
                color: "var(--accent-gold)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-gold)";
                e.currentTarget.style.color = "var(--background)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--card-background)";
                e.currentTarget.style.color = "var(--accent-gold)";
              }}
            >
              {getCategoryDisplayName(tag)}
            </Link>
        ))}
      </div>

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
            <p 
              className="inline-block mb-1 py-[4px] px-[8px] rounded text-[12px] font-medium"
              style={{
                backgroundColor: "var(--accent-gold)",
                color: "var(--background)",
                opacity: 0.9
              }}
            >
                {getCategoryDisplayName(post.contentType)}
              </p>
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
  const allTags = Array.from(new Set(posts.map((post) => post.contentType)));
  
  // 排序：其他類別永遠在最後，其餘按字母順序
  const tags = allTags.sort((a, b) => {
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    return a.localeCompare(b);
  });
  
  return {
    props: { posts, tags },
    revalidate: 60, // ISR：每 60 秒更新
  };
}
