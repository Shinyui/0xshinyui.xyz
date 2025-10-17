import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';

interface MaxPrices {
  usdttwd: string;
  twdusdt: string;
}

interface CostCalculation {
  transferFee: number; // 轉帳費用 15 塊
  tradingFeeRate: number; // 台幣買 U 市價敲入 0.15% 手續費
  exchangeToBinanceFee: number; // 台灣交易所到幣安 0.2U
  binanceToTrxFee: number; // 幣安到 TRX 冷錢包 1U
  trxTransferFee: number; // TRX 冷錢包轉出到目標地址 1U
}

const OTCExchange = () => {
  const [prices, setPrices] = useState<MaxPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [twdAmount, setTwdAmount] = useState<string>('10000');
  const [profitRate, setProfitRate] = useState<string>('6');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 成本配置
  const costs: CostCalculation = {
    transferFee: 15,
    tradingFeeRate: 0.0015, // 0.15%
    exchangeToBinanceFee: 0.2,
    binanceToTrxFee: 1,
    trxTransferFee: 1
  };

  // 獲取實時報價
  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/max-prices');
      if (response.ok) {
        const data = await response.json();
        setPrices({
          usdttwd: data.usdttwd,
          twdusdt: data.twdusdt
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  // 計算 OTC 報價
  const calculateOTCPrice = () => {
    if (!prices || !twdAmount || !profitRate) return null;

    const amount = parseFloat(twdAmount);
    const profitMargin = parseFloat(profitRate) / 100; // 將百分比轉換為小數
    if (isNaN(amount) || amount <= 0 || isNaN(profitMargin) || profitMargin < 0) return null;

    const usdtTwdRate = parseFloat(prices.usdttwd);
    
    // 計算可獲得的 USDT 數量（不含成本）
    const baseUsdtAmount = amount / usdtTwdRate;
    
    // 計算各項成本
    const transferFeeCost = costs.transferFee; // 固定成本
    const tradingFeeCost = amount * costs.tradingFeeRate; // 變動成本
    const totalFixedUsdtCosts = costs.exchangeToBinanceFee + costs.binanceToTrxFee + costs.trxTransferFee; // 固定 USDT 成本
    
    // 總成本（轉換為 USDT）
    const totalTwdCosts = transferFeeCost + tradingFeeCost;
    const totalTwdCostsInUsdt = totalTwdCosts / usdtTwdRate;
    const totalCostsInUsdt = totalTwdCostsInUsdt + totalFixedUsdtCosts;
    
    // 扣除成本後的 USDT 數量
    const netUsdtAmount = baseUsdtAmount - totalCostsInUsdt;
    
    // 使用用戶輸入的利潤率
    const finalUsdtAmount = netUsdtAmount / (1 + profitMargin);
    
    // 計算實際匯率
    const actualRate = amount / finalUsdtAmount;
    
    return {
      baseUsdtAmount,
      totalCostsInUsdt,
      netUsdtAmount,
      finalUsdtAmount,
      actualRate,
      marketRate: usdtTwdRate,
      profitAmount: finalUsdtAmount * profitMargin,
      profitRate: profitMargin * 100, // 返回百分比形式
      costBreakdown: {
        transferFee: transferFeeCost,
        tradingFee: tradingFeeCost,
        exchangeToBinance: costs.exchangeToBinanceFee,
        binanceToTrx: costs.binanceToTrxFee,
        trxTransfer: costs.trxTransferFee
      }
    };
  };

  useEffect(() => {
    fetchPrices();
    // 每 30 秒更新一次報價
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculation = calculateOTCPrice();

  return (
    <>
      <Head>
        <title>OTC 換匯計算機 - TWD/USDT</title>
        <meta name="description" content="專業的 OTC 換匯服務，提供實時 TWD/USDT 匯率報價，並計算交易成本和利潤。" />
      </Head>

      <Layout>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          OTC 換匯服務
        </h1>
        <p 
          className="text-lg mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          為 OTC 商家所建立的換匯計算機
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 實時報價卡片 */}
          <div 
            className="rounded-lg shadow-lg p-6"
            style={{ 
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              border: "1px solid"
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 
                className="text-xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Max 交易所實時報價
              </h2>
              <button
                onClick={fetchPrices}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--accent-gold)",
                  color: "var(--background)"
                }}
              >
                {loading ? '更新中...' : '刷新'}
              </button>
            </div>

            {prices ? (
              <div className="space-y-4">
                <div 
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "var(--hover-background)" }}
                >
                  <div 
                    className="text-sm mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    USDT/TWD
                  </div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {parseFloat(prices.usdttwd).toFixed(4)}
                  </div>
                </div>
                
                <div 
                  className="rounded-lg p-4"
                  style={{ backgroundColor: "var(--hover-background)" }}
                >
                  <div 
                    className="text-sm mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    TWD/USDT
                  </div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {parseFloat(prices.twdusdt).toFixed(6)}
                  </div>
                </div>

                {lastUpdated && (
                  <div 
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    最後更新: {lastUpdated.toLocaleTimeString('zh-TW')}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div 
                  className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
                  style={{ borderColor: "var(--accent-gold)" }}
                ></div>
                <p 
                  className="mt-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  載入報價中...
                </p>
              </div>
            )}
          </div>

          {/* OTC 計算機 */}
          <div 
            className="rounded-lg shadow-lg p-6"
            style={{ 
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              border: "1px solid"
            }}
          >
            <h2 
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              OTC 報價計算機
            </h2>
            
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  台幣金額 (TWD)
                </label>
                <input
                  type="number"
                  value={twdAmount}
                  onChange={(e) => setTwdAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all duration-300"
                  style={{
                    backgroundColor: "var(--hover-background)",
                    borderColor: "var(--border-color)",
                    border: "1px solid",
                    color: "var(--text-primary)"
                  }}
                  placeholder="請輸入台幣金額"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  目標利潤率 (%)
                </label>
                <input
                  type="number"
                  value={profitRate}
                  onChange={(e) => setProfitRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all duration-300"
                  style={{
                    backgroundColor: "var(--hover-background)",
                    borderColor: "var(--border-color)",
                    border: "1px solid",
                    color: "var(--text-primary)"
                  }}
                  placeholder="請輸入目標利潤率"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <div 
                  className="text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  建議範圍: 3% - 10%
                </div>
              </div>

              {calculation && (
                <div className="space-y-4 mt-6">
                  {/* 主要結果 */}
                  <div 
                    className="rounded-lg p-4"
                    style={{ 
                      backgroundColor: "var(--accent-gold)",
                      color: "var(--background)"
                    }}
                  >
                    <div className="text-sm mb-1 opacity-80">您將收到的 USDT</div>
                    <div className="text-3xl font-bold">
                      {calculation.finalUsdtAmount.toFixed(2)} USDT
                    </div>
                    <div className="text-sm mt-1 opacity-80">
                      實際匯率: {calculation.actualRate.toFixed(4)} TWD/USDT
                    </div>
                  </div>

                  {/* 成本明細 */}
                  <div 
                    className="rounded-lg p-4"
                    style={{ backgroundColor: "var(--hover-background)" }}
                  >
                    <h3 
                      className="font-semibold mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      成本明細
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>轉帳費用:</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.costBreakdown.transferFee} TWD</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>交易手續費 (0.15%):</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.costBreakdown.tradingFee.toFixed(2)} TWD</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>交易所轉帳費:</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.costBreakdown.exchangeToBinance} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>幣安轉帳費:</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.costBreakdown.binanceToTrx} USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>TRX 轉帳費:</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.costBreakdown.trxTransfer} USDT</span>
                      </div>
                      <hr 
                        className="my-2" 
                        style={{ borderColor: "var(--border-color)" }}
                      />
                      <div className="flex justify-between font-semibold">
                        <span style={{ color: "var(--text-primary)" }}>總成本:</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.totalCostsInUsdt.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span style={{ color: "var(--accent-gold)" }}>利潤 ({calculation.profitRate.toFixed(1)}%):</span>
                        <span style={{ color: "var(--accent-gold)" }}>{calculation.profitAmount.toFixed(2)} USDT</span>
                      </div>
                    </div>
                  </div>

                  {/* 市場比較 */}
                  <div 
                    className="rounded-lg p-4"
                    style={{ 
                      backgroundColor: "var(--hover-background)",
                      borderColor: "var(--accent-gold)",
                      border: "1px solid"
                    }}
                  >
                    <h3 
                      className="font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      市場比較
                    </h3>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>市場匯率:</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.marketRate.toFixed(4)} TWD/USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>OTC 匯率:</span>
                        <span style={{ color: "var(--text-primary)" }}>{calculation.actualRate.toFixed(4)} TWD/USDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: "var(--text-secondary)" }}>價差:</span>
                        <span style={{ color: "#ff6b6b" }}>+{((calculation.actualRate - calculation.marketRate) / calculation.marketRate * 100).toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default OTCExchange;