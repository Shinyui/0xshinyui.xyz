import Layout from "@/components/Layout";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/hygraph";
import { useRouter } from "next/router";
import { GetStaticPaths, GetStaticProps } from "next";

type Post = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  contentType: string;
  coverImage: {
    url: string;
  } | null;
};

type CategoryPageProps = {
  posts: Post[];
  category: string;
  allCategories: string[];
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

export default function CategoryPage({ posts, category, allCategories }: CategoryPageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p style={{ color: "var(--text-primary)" }}>載入中...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>


      <h1
        className="text-2xl sm:text-3xl font-bold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        {getCategoryDisplayName(category)} 文章
      </h1>

      <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
        共 {posts.length} 篇文章
      </p>

      {/* 類別按鈕 */}
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
        {allCategories.map((cat) => {
          const isActive = cat === category;
          return (
            <Link
              key={cat}
              href={`/category/${encodeURIComponent(cat)}`}
              className="inline-block px-3 py-2 rounded-full text-sm font-medium border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: isActive ? "var(--accent-gold)" : "var(--card-background)",
                borderColor: "var(--accent-gold)",
                color: isActive ? "var(--background)" : "var(--accent-gold)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--accent-gold)";
                  e.currentTarget.style.color = "var(--background)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--card-background)";
                  e.currentTarget.style.color = "var(--accent-gold)";
                }
              }}
            >
              {getCategoryDisplayName(cat)}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p style={{ color: "var(--text-secondary)" }}>
            此類別暫無文章
          </p>
        </div>
      ) : (
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
      )}
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  const categories = Array.from(new Set(posts.map((post) => post.contentType)));
  
  const paths = categories.map((category) => ({
    params: { category: encodeURIComponent(category) },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = params?.category as string;
  const decodedCategory = decodeURIComponent(category);
  
  const allPosts = await getAllPosts();
  const posts = allPosts.filter((post) => post.contentType === decodedCategory);
  const allCategoriesUnsorted = Array.from(new Set(allPosts.map((post) => post.contentType)));
  
  // 排序：其他類別永遠在最後，其餘按字母順序
  const allCategories = allCategoriesUnsorted.sort((a, b) => {
    if (a === 'other') return 1;
    if (b === 'other') return -1;
    return a.localeCompare(b);
  });

  return {
    props: {
      posts,
      category: decodedCategory,
      allCategories,
    },
    revalidate: 60,
  };
};