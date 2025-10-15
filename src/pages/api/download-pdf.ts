import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '只支持GET請求' });
  }

  try {
    const { file } = req.query;
    
    if (!file || Array.isArray(file)) {
      return res.status(400).json({ error: '無效的檔案名稱' });
    }

    // 安全檢查：確保檔案名稱不包含路徑操作符
    if (file.includes('..') || file.includes('/') || file.includes('\\')) {
      return res.status(400).json({ error: '無效的檔案名稱' });
    }

    // 確保temp目錄存在
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 檢查檔案是否存在
    const filePath = path.join(tempDir, file);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '檔案不存在' });
    }

    // 設置檔案下載的標頭
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${file}`);

    // 創建檔案讀取流並傳送給客戶端
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // 設置一個定時器，在一段時間後刪除臨時檔案
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`臨時檔案已刪除: ${filePath}`);
        }
      } catch (err) {
        console.error(`刪除臨時檔案時出錯: ${err}`);
      }
    }, 5 * 60 * 1000); // 5分鐘後刪除
  } catch (error) {
    console.error('下載PDF時出錯:', error);
    return res.status(500).json({ error: '處理下載請求時發生錯誤' });
  }
}