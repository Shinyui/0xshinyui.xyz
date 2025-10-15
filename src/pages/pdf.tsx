import { useState, useRef } from 'react';
import Layout from '@/components/Layout';

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('請上傳PDF檔案');
        return;
      }
      
      if (selectedFile.size > 300 * 1024 * 1024) { // 300MB限制
        setError('檔案大小不能超過300MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setCompressedFile(null);
    }
  };

  const compressPDF = async () => {
    if (!file) return;
    
    setIsCompressing(true);
    setProgress(0);
    setError(null);
    
    try {
      console.log('開始壓縮PDF:', file.name, file.type, file.size);
      
      // 創建FormData對象
      const formData = new FormData();
      formData.append('pdf', file);
      
      console.log('FormData已創建，準備發送請求');
      
      // 發送到API端點
      const response = await fetch('/api/compress-pdf', {
        method: 'POST',
        body: formData,
      });
      
      console.log('收到響應:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API錯誤響應:', errorText);
        throw new Error(`PDF壓縮失敗: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('壓縮成功，結果:', data);
      setCompressedFile(data.url);
    } catch (err) {
      console.error('壓縮過程中發生錯誤:', err);
      setError('壓縮過程中發生錯誤: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsCompressing(false);
      setProgress(100);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCompressedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
          PDF檔案壓縮工具
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8" style={{ 
          backgroundColor: 'var(--card-background)', 
          borderColor: 'var(--border-color)',
          boxShadow: '0 4px 6px var(--shadow-color)'
        }}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              選擇PDF檔案 (最大300MB)
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
              style={{ borderColor: 'var(--border-color)' }}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          {file && (
            <div className="mb-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                已選擇: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={compressPDF}
              disabled={!file || isCompressing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              style={{ 
                backgroundColor: !file || isCompressing ? 'var(--disabled-button)' : 'var(--accent-blue)',
                color: 'white'
              }}
            >
              {isCompressing ? '壓縮中...' : '壓縮PDF'}
            </button>
            
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
              style={{ 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              重置
            </button>
          </div>
          
          {isCompressing && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%`, backgroundColor: 'var(--accent-blue)' }}
                ></div>
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                壓縮中，請稍候...
              </p>
            </div>
          )}
          
          {compressedFile && (
            <div className="mt-6 p-4 border border-green-300 rounded-lg bg-green-50" style={{
              borderColor: 'var(--success-border)',
              backgroundColor: 'var(--success-background)'
            }}>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                PDF已成功壓縮！
              </p>
              <a
                href={compressedFile}
                download
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ backgroundColor: 'var(--accent-green)' }}
              >
                下載壓縮後的PDF
              </a>
            </div>
          )}
        </div>
        
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          <h2 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>關於此工具</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>此工具可將大型PDF檔案壓縮至較小的檔案大小</li>
            <li>支援最大300MB的PDF檔案</li>
            <li>壓縮後的檔案大小約為原始檔案的25%</li>
            <li>所有檔案處理在伺服器端完成，不會儲存您的檔案</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}