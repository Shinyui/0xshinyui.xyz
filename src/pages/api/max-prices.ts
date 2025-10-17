import type { NextApiRequest, NextApiResponse } from 'next';

interface MaxPricesResponse {
  ethbtc: string;
  ethusdt: string;
  btcusdt: string;
  dogeusdt: string;
  linkusdt: string;
  ltcusdt: string;
  usdttwd: string;
  dogetwd: string;
  linktwd: string;
  btctwd: string;
  ethtwd: string;
  ltctwd: string;
  twdusdt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MaxPricesResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://max-api.maicoin.com/api/v3/wallet/m/index_prices');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MaxPricesResponse = await response.json();
    
    // 設置 CORS 標頭
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 設置快取標頭（快取 30 秒）
    res.setHeader('Cache-Control', 'public, max-age=30');
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching Max prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}