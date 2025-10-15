import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

// 禁用默認的bodyParser，因為我們使用formidable處理文件上傳
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST請求' });
  }

  try {
    console.log('開始處理PDF壓縮請求');
    
    // 確保temp目錄存在
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      console.log('創建temp目錄:', tempDir);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 使用formidable解析上傳的文件
    const form = formidable({
      maxFileSize: 300 * 1024 * 1024, // 300MB
      keepExtensions: true,
      multiples: false, // 確保只處理單個文件
      uploadDir: tempDir, // 設置上傳目錄
    });

    console.log('解析上傳文件...');
    
    // 正確處理formidable的類型
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('解析文件錯誤:', err);
          reject(err);
          return;
        }
        console.log('文件解析成功, 文件對象:', Object.keys(files));
        resolve([fields, files]);
      });
    });

    // 獲取上傳的PDF文件
    console.log('files對象:', JSON.stringify(files));
    
    if (!files.pdf) {
      console.error('未找到PDF文件, files對象:', files);
      return res.status(400).json({ error: '請上傳一個PDF文件', debug: '未找到名為pdf的文件' });
    }
    
    // 處理 files.pdf 可能是數組的情況
    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf as unknown as File;
    
    if (!pdfFile) {
      console.error('PDF文件無效');
      return res.status(400).json({ error: '上傳的PDF文件無效' });
    }
    
    console.log('PDF文件信息:', {
      name: pdfFile.originalFilename,
      size: pdfFile.size,
      type: pdfFile.mimetype,
      path: pdfFile.filepath
    });
    
    // 檢查文件類型
    if (pdfFile.mimetype !== 'application/pdf') {
      console.error('文件類型錯誤:', pdfFile.mimetype);
      return res.status(400).json({ error: '只接受PDF文件' });
    }

    // 使用已經創建的臨時目錄

    // 生成唯一的文件名
    const timestamp = Date.now();
    const originalFilePath = pdfFile.filepath;
    const outputFilename = `compressed_${timestamp}.pdf`;
    const outputFilePath = path.join(tempDir, outputFilename);

    try {
      console.log('開始讀取原始PDF文件');
      // 讀取原始PDF文件
      const pdfBytes = fs.readFileSync(originalFilePath);
      console.log('原始PDF文件大小:', pdfBytes.length, '字節');
      
      // 使用pdf-lib加載PDF文檔
      console.log('使用pdf-lib加載PDF文檔');
      const pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
      });
      
      console.log('PDF文檔加載成功，頁數:', pdfDoc.getPageCount());
      
      // 壓縮PDF的圖像質量
      console.log('開始壓縮PDF');
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      console.log('PDF壓縮成功，壓縮後大小:', compressedPdfBytes.length, '字節');
      
      // 將壓縮後的PDF寫入文件
      console.log('寫入壓縮後的PDF文件:', outputFilePath);
      fs.writeFileSync(outputFilePath, compressedPdfBytes);
      console.log('文件寫入成功');
    } catch (pdfError) {
      console.error('PDF處理過程中發生錯誤:', pdfError);
      throw pdfError;
    }

    // 檢查壓縮後的文件是否存在
    if (!fs.existsSync(outputFilePath)) {
      throw new Error('PDF壓縮失敗');
    }

    // 獲取壓縮前後的文件大小
    const originalSize = fs.statSync(originalFilePath).size;
    const compressedSize = fs.statSync(outputFilePath).size;
    
    // 創建下載URL
    const downloadUrl = `/api/download-pdf?file=${outputFilename}`;

    // 返回結果
    return res.status(200).json({
      url: downloadUrl,
      originalSize,
      compressedSize,
      compressionRatio: Math.round((compressedSize / originalSize) * 100),
    });
  } catch (error) {
    console.error('PDF壓縮錯誤:', error);
    return res.status(500).json({ error: '處理PDF時發生錯誤' });
  }
}