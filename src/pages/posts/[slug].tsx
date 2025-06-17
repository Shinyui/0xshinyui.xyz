import { getPostBySlug, getPostSlugs } from '@/lib/hygraph'
import Layout from '@/components/Layout'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeStringify from 'rehype-stringify'
import toc from 'markdown-toc'

import { GetStaticPaths, GetStaticProps } from 'next'

type TocItem = { slug: string; content: string, lvl: number}

type PostProps = {
  post: {
    title: string
    date: string
    excerpt: string
    contentHtml: string
    toc: TocItem[]
    coverImage: string | null
  }
}

export default function Post({ post }: PostProps) {
  return (
    <Layout>
    <div className="mx-auto mb-12">
      {post.coverImage && (
        <div className="w-full aspect-[16/9] mb-6 rounded-lg overflow-hidden shadow-md">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{post.title}</h1>
      <p className="text-base text-gray-600 mb-4">{post.date}</p>
      <p className="text-lg text-gray-700">{post.excerpt}</p>
    </div>

  <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8">
    {/* 👉 左側目錄 */}
    {post.toc.length > 0 && (
<nav className="sticky top-6 self-start border-r pr-4 text-sm text-gray-600">
  <strong className="block mb-4 text-lg font-semibold text-gray-800">目錄</strong>
  <ul className="space-y-2">
    {post.toc.map((item) => (
      <li key={item.slug}>
        <a
          href={`#${item.slug}`}
          className={`
            text-base text-blue-600 hover:underline hover:text-blue-800 transition-colors block
            ${item.lvl === 2 ? 'pl-0' : ''}
            ${item.lvl === 3 ? 'pl-4' : ''}
            ${item.lvl === 4 ? 'pl-6' : ''}
            ${item.lvl === 5 ? 'pl-8' : ''}
            ${item.lvl === 6 ? 'pl-10' : ''}
          `}
        >
          {item.content}
        </a>
      </li>
    ))}
  </ul>
</nav>
    )}

    {/* 👉 右側文章內容 */}
    <article
        className="
          prose max-w-none text-gray-800
          [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-8 [&_h1]:mb-4
          [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mt-5 [&_h3]:mb-2
          [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-4 [&_h4]:mb-1
          [&_h5]:text-lg [&_h5]:font-medium [&_h5]:text-gray-900 [&_h5]:mt-4 [&_h5]:mb-1
          [&_h6]:text-base [&_h6]:font-medium [&_h6]:text-gray-900 [&_h6]:mt-3 [&_h6]:mb-1

          [&_p]:text-base [&_p]:text-gray-700 [&_p]:mb-4 [&_p]:leading-relaxed
          [&_a]:text-blue-600 hover:[&_a]:underline hover:[&_a]:text-blue-800
          [&_strong]:font-semibold text-gray-900
          [&_em]:italic text-gray-600
          [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:bg-blue-50
          [&_blockquote]:text-gray-600 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:my-6
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
          [&_li]:mb-1
          [&_code]:bg-gray-100 [&_code]:text-pink-600 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-6
          [&_table]:table-auto [&_table]:border [&_table]:border-gray-300 [&_table]:text-sm [&_table]:my-6
          [&_thead]:bg-gray-100 [&_thead]:text-gray-800 [&_thead]:font-semibold
          [&_th]:border [&_th]:px-3 [&_th]:py-2
          [&_td]:border [&_td]:px-3 [&_td]:py-2
          [&_hr]:my-10 [&_hr]:border-t [&_hr]:border-gray-200
          [&_img]:rounded [&_img]:shadow-md [&_img]:my-4 hover:[&_img]:scale-105 transition-transform duration-300 ease-in-out

          [id]:target:bg-yellow-50
          [id]:target:before:content-[''] [id]:target:before:block [id]:target:before:h-20 [id]:target:before:-mt-20
        "
      dangerouslySetInnerHTML={{ __html: post.contentHtml }}
    />
  </div>
</Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPostSlugs()
  const paths = posts.map((p) => ({ params: { slug: p.slug } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostBySlug(params!.slug as string)

  // 轉為 HTML
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype) // 將 Markdown 轉為 HAST
    .use(rehypeSlug) // 自動為 h1~h6 加上 id
    .use(rehypeAutolinkHeadings) // 為 h1~h6 加上錨點連結
    .use(rehypeStringify) // 將 HTML AST 轉成 HTML 字串
    .process(postData.content)

  const contentHtml = processed.toString()

  // 產生 TOC
  const tocData = toc(postData.content).json as TocItem[]

  return {
    props: {
      post: {
        title: postData.title,
        date: postData.date,
        excerpt: postData.excerpt,
        contentHtml,
        coverImage: postData.coverImage,
        toc: tocData,
      },
    },
  }
}
