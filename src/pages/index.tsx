import Layout from '@/components/Layout'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/hygraph'

type Post = {
  title: string
  slug: string
  date: string
  excerpt: string
  coverImage: {
    url: string
  } | null
}

type HomeProps = {
  posts: Post[]
}

export default function Home({ posts }: HomeProps) {
  return (
    <Layout>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">最新文章</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.slug} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4">
            {post.coverImage?.url && (
              <Link href={`/posts/${post.slug}`} className="block">
                <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                  <Image
                    src={post.coverImage.url}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority
                  />
                </div>
              </Link>
            )}
            <Link href={`/posts/${post.slug}`} className="block">
              <h2 className="text-lg font-semibold text-gray-800 hover:underline mb-1">
                {post.title}
              </h2>
            </Link>
            <p className="text-xs text-gray-500 mb-2">{post.date}</p>
            <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const posts = await getAllPosts()
  return {
    props: { posts },
    revalidate: 60, // ISR：每 60 秒更新
  }
}