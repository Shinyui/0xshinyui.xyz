import Layout from '@/components/Layout'
export default function Profile() {
  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">個人介紹</h1>
      <ul className="list-disc pl-6 space-y-1 text-gray-700">
        <li>現職：前端工程師</li>
        <li>技能：React, Next.js, Tailwind</li>
        <li>興趣：閱讀、教學、寫作</li>
      </ul>
    </Layout>
  )
}
