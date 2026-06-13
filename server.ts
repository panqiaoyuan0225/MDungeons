/**
 * High-performance full-stack Express + Vite Node server
 * Integrated with Google GenAI SDK for server-side AI Narrations.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Shared Gemini SDK client initialization
// Guarded lazy initialization handles missing keys gracefully
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ [Gemini API] GEMINI_API_KEY is not defined. AI Narrator will run in offline fallback mode.");
    return null;
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  
  const PORT = 3000;

  // 1. Live health API endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. Gemini-driven gothic story narrator endpoint
  app.post('/api/narrate', async (req, res) => {
    try {
      const ai = getAiClient();
      if (!ai) {
        return res.status(503).json({ 
          error: "API key missing", 
          message: "GEMINI_API_KEY environment variable is not defined for this server." 
        });
      }

      const { nodeType, nodeName, floor, playerStats } = req.body;
      
      const pClass = playerStats?.classType || 'WARRIOR';
      const pLevel = playerStats?.level || 1;
      const pHp = playerStats?.hp || 100;
      const pMaxHp = playerStats?.maxHp || 100;
      const pGold = playerStats?.gold || 0;

      // Immersive background prompt based on class type
      const prompt = `你是一位黑暗奇幻风格的地牢主持人 (Dungeon Master)。
玩家正在进行一场古墓深渊爬塔探险：
职业: ${pClass}
级别: ${pLevel}级
当前HP: ${pHp}/${pMaxHp}
金币: ${pGold}
当前所处层数: 第 ${floor} 层
触发节点类型: ${nodeType} (节点名称: "${nodeName}")

请以此背景创作一个充满克苏鲁/黑暗哥特文字魅力的奇遇事件，包含剧情描述和3个不同维度的命运选择。选择必须有数值上的得失。
请返回符合 JSON 模式的数据：
- title: 场景一句话副标题 (e.g. "浸血的古老祭坛", "空虚的沉睡石棺")
- story: 100-150字，极其生动、阴郁且神秘的哥特暗黑场景描写，呼应该职业和层级的代入感
- choices: 刚好 3 个选项的数组。
  每个选项对象包含：
  - id: 选项标识 (必须是 "opt_1", "opt_2", "opt_3")
  - text: 决策名字 (e.g. "痛饮血魂古泉", "接受符文洗礼")
  - desc: 选项效果文本 (e.g. "消耗15点HP，永久获得攻击力+5", "抢夺财宝，获得80金币，但生命受损5%")
  - limit_desc: 额外限制说明或剧情台词
  - cost: 消耗对象, 属性包含 hp, gold (数值应该合理)
  - gain: 获得对象, 属性包含 hp, gold, atk, def, item (item为布尔值，代表是否获得极品装备)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an immersive dark-fantasy RPG Dungeon Master. You always speak in Chinese with a dark, high-contrast gothic and poetic tone. You strictly output structurally valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Atmospheric title of the scene" },
              story: { type: Type.STRING, description: "Poetic gothic story narration of the event" },
              choices: {
                type: Type.ARRAY,
                description: "Exactly three choice options",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING, description: "Short title/name of the option" },
                    desc: { type: Type.STRING, description: "Detailed summary of what happens mechanically" },
                    limit_desc: { type: Type.STRING, description: "Atmospheric dialog snippet or limitation" },
                    cost: {
                      type: Type.OBJECT,
                      properties: {
                        hp: { type: Type.INTEGER, description: "HP lost, 0 if none" },
                        gold: { type: Type.INTEGER, description: "Gold lost, 0 if none" }
                      }
                    },
                    gain: {
                      type: Type.OBJECT,
                      properties: {
                        hp: { type: Type.INTEGER, description: "HP healed, 0 if none" },
                        gold: { type: Type.INTEGER, description: "Gold gained, 0 if none" },
                        atk: { type: Type.INTEGER, description: "Permanent ATK gained, 0 if none" },
                        def: { type: Type.INTEGER, description: "Permanent DEF gained, 0 if none" },
                        item: { type: Type.BOOLEAN, description: "Whether player gets a loot item" }
                      }
                    }
                  },
                  required: ["id", "text", "desc", "cost", "gain"]
                }
              }
            },
            required: ["title", "story", "choices"]
          }
        }
      });

      const responseText = response.text || '';
      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("🔴 [Gemini Narrator Error]:", error);
      res.status(500).json({ 
        error: "Generation Failed", 
        message: error.message || "Internal Server Error"
      });
    }
  });

  // 3. Vite development vs production compiler modes
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serves Vite compiled assets recursively
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Deep Dungeon Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
