// types/markdown-toc.d.ts
declare module 'markdown-toc' {
  type TocItem = {
    content: string
    slug: string
    lvl: number
  }

  type TocJson = TocItem[]

  interface TocResult {
    json: TocJson
    content: string
    tokens: unknown[]
  }

  function toc(markdown: string): TocResult

  export = toc
}
