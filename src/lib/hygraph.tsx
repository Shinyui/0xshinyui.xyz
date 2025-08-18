import { GraphQLClient } from 'graphql-request'

const endpoint = process.env.HYGRAPH_ENDPOINT!

export const hygraph = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
  },
})

// TypeScript 型別定義
type Post = {
  title: string
  slug: string
  date: string
  excerpt: string
  coverImage: {
    url: string
  }
}

type AllPostsResponse = {
  posts: Post[]
}

type PostSlugsResponse = {
  posts: { slug: string }[]
}

type PostBySlugResponse = {
  post: {
    title: string
    date: string
    excerpt: string
    content: string
    coverImage: { url: string } | null
  }
}

// 改為指定型別
export async function getAllPosts() {
  const query = `
    {
      posts(orderBy: date_DESC, first: 30) {
        title
        slug
        date
        excerpt
        coverImage {
          url
        }
      }
    }
  `
  const data = await hygraph.request<AllPostsResponse>(query)
  return data.posts
}

export async function getPostSlugs() {
  const query = `
    {
      posts(first: 30) {
        slug
      }
    }
  `
  const data = await hygraph.request<PostSlugsResponse>(query)
  return data.posts
}

export async function getPostBySlug(slug: string) {
  const query = `
    query GetPostBySlug($slug: String!) {
      post(where: { slug: $slug }) {
        title
        date
        excerpt
        content
        coverImage {
          url
        }
      }
    }
  `;

  const variables = { slug }
  const data = await hygraph.request<PostBySlugResponse>(query, variables)

  console.log(data)

  return {
    title: data.post.title,
    date: data.post.date,
    excerpt: data.post.excerpt,
    content: data.post.content,
    coverImage: data.post.coverImage?.url ?? null,
  }
}
