import Layout from '@/components/Layout'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts } from '@/lib/hygraph'

export default function Home({ posts }) {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">最新文章</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {posts.map((post) => (
          <div key={post.slug} className="bg-white rounded shadow p-4">
            {post.coverImage?.url && (
              <Link href={`/posts/${post.slug}`}>
                <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                  <Image
                    src={post.coverImage.url}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </Link>
            )}
            <Link href={`/posts/${post.slug}`} className="block">
              <h2 className="text-xl font-semibold text-gray-800 hover:underline mb-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-sm text-gray-500 mb-2">{post.date}</p>
            <p className="text-sm text-gray-600">{post.excerpt}</p>
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
