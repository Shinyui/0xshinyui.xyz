import { GraphQLClient } from 'graphql-request'

const endpoint = process.env.HYGRAPH_ENDPOINT!

export const hygraph = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`, // 如果有設定 Token
  },
})

export async function getAllPosts() {
  const query = `
    {
      posts(orderBy: date_DESC) {
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
  const data = await hygraph.request(query)
  return data.posts
}

export async function getPostSlugs() {
  const query = `
    {
      posts {
        slug
      }
    }
  `
  const data = await hygraph.request(query)
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
  `

  const variables = { slug }
  const data = await hygraph.request(query, variables)

  return {
    title: data.post.title,
    date: data.post.date,
    excerpt: data.post.excerpt,
    content: data.post.content,
    coverImage: data.post.coverImage?.url ?? null,
  }
}