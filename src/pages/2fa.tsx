import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import crypto from "crypto";

function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0;
  let value = 0;
  let output = [];
  
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i].toUpperCase();
    if (char === "=") break;
    
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    
    value = (value << 5) | index;
    bits += 5;
    
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return Buffer.from(output);
}

function generateTOTP(secret: string, timeStep: number = 30): string {
  try {
    // 移除空格和轉換為大寫
    const cleanSecret = secret.replace(/\s/g, "").toUpperCase();
    
    // Base32 解碼
    const key = base32Decode(cleanSecret);
    
    // 計算時間步數
    const time = Math.floor(Date.now() / 1000 / timeStep);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(time, 4);
    
    // HMAC-SHA1
    const hmac = crypto.createHmac("sha1", key);
    hmac.update(timeBuffer);
    const hash = hmac.digest();
    
    // 動態截取
    const offset = hash[hash.length - 1] & 0xf;
    const code = (
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff)
    ) % 1000000;
    
    return code.toString().padStart(6, "0");
  } catch (error) {
    return "錯誤";
  }
}

export default function TwoFAPage() {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTimeLeft(remaining);
      
      // 自動更新驗證碼
      if (secret.trim()) {
        const newCode = generateTOTP(secret);
        setCode(newCode);
        setIsValid(newCode !== "錯誤");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [secret]);

  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSecret = e.target.value;
    setSecret(newSecret);
    
    if (newSecret.trim()) {
      const newCode = generateTOTP(newSecret);
      setCode(newCode);
      setIsValid(newCode !== "錯誤");
    } else {
      setCode("");
      setIsValid(true);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          2FA 驗證碼生成器
        </h1>

        <div className="space-y-6">
          {/* 輸入區域 */}
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              boxShadow: "0 4px 6px var(--shadow-color)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--accent-gold)" }}
            >
              輸入 2FA 密鑰
            </h2>
            <input
              type="text"
              value={secret}
              onChange={handleSecretChange}
              placeholder="請輸入您的 2FA 密鑰 (Base32 格式)"
              className="w-full p-3 rounded-lg border font-mono text-sm"
              style={{
                backgroundColor: "var(--background)",
                borderColor: isValid ? "var(--border-color)" : "#ef4444",
                color: "var(--text-primary)",
              }}
            />
            {!isValid && (
              <p className="mt-2 text-sm text-red-500">
                ❌ 無效的密鑰格式，請檢查您的輸入
              </p>
            )}
          </div>

          {/* 驗證碼顯示區域 */}
          {code && isValid && (
            <div
              className="p-6 rounded-lg border transition-all duration-300"
              style={{
                backgroundColor: "var(--card-background)",
                borderColor: "var(--border-color)",
                boxShadow: "0 4px 6px var(--shadow-color)",
              }}
            >
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--accent-gold)" }}
              >
                當前驗證碼
              </h2>
              <div className="text-center">
                <div
                  className="text-4xl font-mono font-bold mb-2 tracking-wider"
                  style={{ color: "var(--text-primary)" }}
                >
                  {code}
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    剩餘時間：{timeLeft} 秒
                  </div>
                  <div
                    className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--border-color)" }}
                  >
                    <div
                      className="h-full transition-all duration-1000 ease-linear"
                      style={{
                        backgroundColor: timeLeft > 10 ? "var(--accent-gold)" : "#ef4444",
                        width: `${(timeLeft / 30) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 說明文字 */}
          <div
            className="p-4 rounded-lg border-l-4 bg-opacity-50"
            style={{
              backgroundColor: "var(--card-background)",
              borderLeftColor: "var(--accent-gold)",
            }}
          >
            <h3
              className="font-semibold mb-2"
              style={{ color: "var(--accent-gold)" }}
            >
              使用說明
            </h3>
            <ul
              className="text-sm space-y-1"
              style={{ color: "var(--text-secondary)" }}
            >
              <li>• 輸入您從應用程式（如 Google Authenticator、Authy）獲得的 2FA 密鑰</li>
              <li>• 密鑰通常是 Base32 格式的字串，包含字母 A-Z 和數字 2-7</li>
              <li>• 驗證碼每 30 秒自動更新一次</li>
              <li>• 此工具完全在瀏覽器本地運行，不會將您的密鑰發送到任何服務器</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}