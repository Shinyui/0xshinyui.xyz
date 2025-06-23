import Layout from '@/components/Layout'

export default function Profile() {
  return (
    <Layout>
      {/* 內容容器：限制最大寬度，並依螢幕大小改變左右 padding */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 標題：小螢幕用 2xl，≥640px (sm) 才用 3xl */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">個人介紹</h1>

        {/* 文章區：paragraph 之間用 space-y-* 控距，不必逐段加 mb-4 */}
        <section className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg">
          <p>
            0xShinyui，一個喜歡把點子變成產品、也願意為使用者多走幾步的 PM
          </p>
          <p>
            這幾年，我從寫文案、投廣告、跑數據，一路走到協作工程與設計，把產品從 0
            拉到 1，還順手學了 React 和&nbsp;Express，把自己搞成半個工程師。
            做過線上課程平台、私域會員系統、金流模塊，也踩過不少坑。
          </p>
          <p>
            我相信「產品不是寫完就好」，而是能不能真的解決用戶的問題。
            很多時候，一個轉化率的提升、一個功能的拿掉，比推出一堆新東西更有價值。
            所以我喜歡觀察、紀錄、測試，再推翻自己。
          </p>
          <p>
            這個部落格會分享我的技術實驗、成長過程、還有那些搞砸又學到的經驗。
            偶爾也會聊聊行銷漏斗、產品策略、數據分析，甚至創業與踩雷日誌。
          </p>
          <p>
            如果你對這些主題有共鳴，或剛好也在思考類似的事，歡迎留言或來信交流！
          </p>
        </section>
      </div>
    </Layout>
  )
}