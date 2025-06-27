// ✅ 卡片邏輯 + 餘額限制 + 正確賠付加成算法（賠付 = 下注金額 * 0.88 * 加成倍率 + 本金）

import { useState, useEffect, useRef } from 'react';
import sha256 from 'crypto-js/sha256';
import Layout from '@/components/Layout';

const options = ['剪刀', '石頭', '布'];

const cardBonuses = [
  { cardName: '120% 加成卡', multiplier: 1.2, chance: 0.5 },
  { cardName: '150% 加成卡', multiplier: 1.5, chance: 0.4 },
  { cardName: '2000% 加成卡', multiplier: 20.0, chance: 0.1 },
];

function getResult(player, system) {
  if (player === system) return 'draw';
  if (
    (player === '剪刀' && system === '布') ||
    (player === '石頭' && system === '剪刀') ||
    (player === '布' && system === '石頭')
  ) return 'win';
  return 'lose';
}

function getSystemChoice(serverSeed, clientSeed, nonce) {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = sha256(combined).toString();
  const index = parseInt(hash.substring(0, 8), 16) % 3;
  return { choice: options[index], hash };
}

function getCardBonus() {
  const r = Math.random();
  let acc = 0;
  for (const card of cardBonuses) {
    acc += card.chance;
    if (r < acc) return card;
  }
  return cardBonuses[0];
}

function App() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [systemChoice, setSystemChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [balance, setBalance] = useState(10000);
  const [history, setHistory] = useState([]);
  const [clientSeed, setClientSeed] = useState('');
  const [serverSeed, setServerSeed] = useState('');
  const [betAmount, setBetAmount] = useState(100);
  const [cardInventory, setCardInventory] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [currentSessionBet, setCurrentSessionBet] = useState(0);
  const thresholdRef = useRef(10000);

  useEffect(() => {
    setClientSeed(Math.random().toString(36).substring(2, 10));
    setServerSeed(Math.random().toString(36).substring(2, 10));
  }, []);

  const updateThreshold = () => {
    const last100 = history.slice(-100);
    if (last100.length < 1) {
      thresholdRef.current = 100 * 100;
    } else {
      const avg = last100.reduce((sum, h) => sum + h.bet, 0) / last100.length;
      thresholdRef.current = avg * 100;
    }
  };

  useEffect(() => {
    if (currentSessionBet >= thresholdRef.current) {
      const newCard = getCardBonus();
      setCardInventory((prev) => [...prev, newCard]);
      setCurrentSessionBet(0);
      updateThreshold();
    }
  }, [currentSessionBet]);

  const handlePlay = (choice) => {
    if (betAmount > balance) return;

    const nonce = history.length;
    const { choice: system, hash } = getSystemChoice(serverSeed, clientSeed, nonce);
    const outcome = getResult(choice, system);
    let bonusMultiplier = 0;
    let usedCard = null;

    if (activeCardIndex !== null && cardInventory[activeCardIndex]) {
      bonusMultiplier = cardInventory[activeCardIndex].multiplier;
      usedCard = cardInventory[activeCardIndex];
      setCardInventory((prev) => prev.filter((_, i) => i !== activeCardIndex));
      setActiveCardIndex(null);
    }

    let payout = 0;
    const baseWin = betAmount * 0.88;
    if (outcome === 'win') {
      payout = baseWin * bonusMultiplier + betAmount;
    } else if (outcome === 'draw') {
      payout = betAmount;
    } else {
      payout = 0;
    }

    setPlayerChoice(choice);
    setSystemChoice(system);
    setResult(outcome);
    setBalance((prev) => prev - betAmount + payout);
    setHistory((prev) => [
      ...prev,
      {
        round: prev.length + 1,
        player: choice,
        system,
        bet: betAmount,
        outcome,
        payout: payout.toFixed(2),
        bonus: bonusMultiplier ? `${usedCard?.cardName}` : '-',
        hash,
      },
    ]);
    setCurrentSessionBet((prev) => prev + betAmount);
  };

  const handleReset = () => {
    window.location.reload();
  };

  if (balance <= 0) {
    return (
      <Layout>
        <div className="p-12 text-center max-w-xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">小賭怡情，大賭郭台銘</h1>
          <p className="mb-6 text-gray-700">但你只能下輩子再當了 🪦</p>
          <button
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            onClick={handleReset}
          >
            重新來過
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">剪刀石頭布 🎮</h1>

        <div className="mb-6 p-4 bg-gray-50 border rounded text-sm">
          <h2 className="font-semibold mb-2">🔍 本遊戲學習目標與設計原理</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>理解 RNG（隨機數生成）+ Hash 機制如何實現 provably fair 的博弈設計</li>
            <li>學習如何動態追蹤下注行為並計算 RTP</li>
            <li>了解賠付設計與加成卡機制如何結合遊戲機率模型</li>
          </ul>
        </div>

        <p>目前餘額：${balance.toFixed(2)}</p>
        <p>目前累積下注額（本輪運氣值）：{currentSessionBet} / 門檻：{thresholdRef.current.toFixed(0)}</p>

        {cardInventory.length > 0 && (
          <div className="bg-yellow-50 border p-3 rounded my-4">
            <p className="font-semibold">🎴 你持有的卡片：</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {cardInventory.map((card, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded border text-sm ${activeCardIndex === i ? 'bg-green-500 text-white' : 'bg-white'}`}
                  onClick={() =>
                    setActiveCardIndex((prev) => (prev === i ? null : i))
                  }
                >
                  {card.cardName} {activeCardIndex === i ? '（使用中）' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 my-4">
          <input
            type="number"
            min="1"
            max={balance}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.min(Number(e.target.value), balance))}
            className="border p-1 w-24"
          />
          {options.map((opt) => (
            <button
              key={opt}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handlePlay(opt)}
            >
              出{opt}
            </button>
          ))}
        </div>

        {result && (
          <p>
            結果：你出了 {playerChoice}，系統出了 {systemChoice} →{' '}
            {result === 'win' ? '你贏了！' : result === 'draw' ? '平手' : '你輸了！'}
          </p>
        )}

        <h2 className="mt-6 mb-2 text-lg font-semibold">歷史紀錄</h2>
        <table className="w-full text-sm table-auto border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">局數</th>
              <th className="border px-2 py-1">玩家選擇</th>
              <th className="border px-2 py-1">電腦選擇</th>
              <th className="border px-2 py-1">下注額</th>
              <th className="border px-2 py-1">結果</th>
              <th className="border px-2 py-1">加成</th>
              <th className="border px-2 py-1">賠付</th>
              <th className="border px-2 py-1">Hash</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(-10).reverse().map((h, i) => (
              <tr key={i} className="text-center">
                <td className="border px-2 py-1">{h.round}</td>
                <td className="border px-2 py-1">{h.player}</td>
                <td className="border px-2 py-1">{h.system}</td>
                <td className="border px-2 py-1">${h.bet}</td>
                <td className="border px-2 py-1">{h.outcome === 'win' ? '贏' : h.outcome === 'draw' ? '和局' : '輸'}</td>
                <td className="border px-2 py-1">{h.bonus}</td>
                <td className="border px-2 py-1">${h.payout}</td>
                <td className="border px-2 py-1 break-all text-left">{h.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default App;