const express = require('express');
const https = require('https');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 静态托管前端页面
app.use(express.static(path.join(__dirname)));

// 内存存储心跳与提醒任务数据
const activeUsers = {};      // discordUserId -> lastActiveTime
const userTasks = {};        // discordUserId -> Array of { id, event, targetTimestamp }
const userPrefs = {};        // discordUserId -> { notifyMode }
const notifiedTasks = new Set(); // 存储已通知的任务主键：`${userId}_${taskId}`
const userNotifiedTaskIds = {}; // discordUserId -> Set of taskId (供前端获取并更新本地 notifySent 状态)

// 二、分场景专属 Prompt 定义（所有生成文本格式严格符合通用全局规则）
const SYSTEM_RULE = `【通用全局规则（所有场景共用）】
语言：标准简体中文，语气亲切温柔、口语化，像贴心助手，风格参考豆包日常对话
格式：仅输出最终文案，禁止额外解释、注释、Markdown、多余符号、引导语，直接给出最终文案
表情：仅使用基础通用 Emoji（⏰ ✨ 💧 😊 💡 📝），少量点缀，不堆砌
字数：单条文案严格精简，短句为主`;

const SCENE_PROMPTS = {
    'discord_alert': (event) => `${SYSTEM_RULE}
【分场景任务】
根据待办事件，生成推送文案，风格轻松日常、语气亲切，字数控制在15字以内。
待办事件：${event}
仅输出最终文案。`,

    'web_alert': (event) => `${SYSTEM_RULE}
【分场景任务】
根据待办事件，生成浏览器推送文案，风格轻松日常、语气亲切，字数控制在15字以内。
待办事件：${event}
仅输出最终文案。`,

    'todo_summary': (list) => `${SYSTEM_RULE}
【分场景任务】
结合下方待办列表，写一段温暖的开场白，再逐条列出待办事项。整体语气友好治愈，排版简洁清晰。
待办列表：${list}
只输出展示文本。`,

    'save_success': () => `${SYSTEM_RULE}
【分场景任务】
生成一句简短友好的提示语，告知用户便签已保存，搭配一个可爱小表情，风格治愈轻松。
只输出文案。`,

    'delete_success': () => `${SYSTEM_RULE}
【分场景任务】
生成一句口语化短句，告知用户便签已移除，语气轻松自然。
只输出文案。`,

    'low_quota': () => `${SYSTEM_RULE}
【分场景任务】
温馨提醒用户剩余便签页数不多了，语气柔和简短。
只输出文案。`,

    'quota_reset': () => `${SYSTEM_RULE}
【分场景任务】
生成一句治愈积极的文案，告知用户所有便签已用完，全新空白页已就绪。
只输出文案。`,

    'ai_busy': () => `${SYSTEM_RULE}
【分场景任务】
委婉告知用户智能助手暂时忙碌，当前内容会转为普通笔记保存，语气友好。
只输出文案。`,

    'network_error': () => `${SYSTEM_RULE}
【分场景任务】
简短提醒用户网络出现波动，同时告知内容已在本地安全保存，让人放心。
只输出文案。`
};

const SCENE_FALLBACKS = {
    'discord_alert': (event) => `记得 ${event} 哦😊`,
    'web_alert': (event) => `记得 ${event} 哦😊`,
    'todo_summary': (list) => `哈喽，这里是你的近期待办： ${list}`,
    'save_success': () => `记录完成✨`,
    'delete_success': () => `已移除这条记录啦`,
    'low_quota': () => `剩余页数不多咯，请珍惜使用~`,
    'quota_reset': () => `新的空白页已准备好，继续记录吧！`,
    'ai_busy': () => `助手暂时忙碌，已正常保存笔记`,
    'network_error': () => `网络有点小波动，内容已本地保存😊`
};


/**
 * 核心：支持多模型重试与退避的 Gemini AI 请求中转
 */
async function callGemini(model, prompt, isJson = true) {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const config = isJson ? { responseMimeType: "application/json" } : {};
    
    const payload = JSON.stringify({
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: config
    });

    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 10000 // 10秒超时
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: data
                });
            });
        });

        req.on('error', err => reject(err));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error("Request Timeout"));
        });

        req.write(payload);
        req.end();
    });
}

// 接口 1: AI 任务特征识别 (JSON 输出模式)
app.post('/api/analyze-task', async (req, res) => {
    const { text, clientTime, clientTimestamp, timezone } = req.body;
    if (!text || !text.trim()) {
        return res.json({ isTask: false });
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    // 提供服务器备用时间，兜底确保稳定性
    const fallbackRefTime = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} : ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const refTime = clientTime || fallbackRefTime;
    const refTimestamp = clientTimestamp || Date.now();
    const refTimezone = timezone || 'Asia/Kuala_Lumpur';

    const systemPrompt = `你是一个精确的便签任务提醒时间解析器与温暖提醒文案生成器。只输出JSON，不解释、不闲聊、不扩展、不要包含任何 markdown。
你需要从文本中解析出用户设定的提醒内容、时间，并顺便预生成治愈推送文案。
输入文本请进行如下解析：
- isTask: 是否为具体的任务/需要定时提醒的待办（true/false）
- event: 精简后的待办事件内容
- relativeTime: 原始的提醒时间点描述
- offsetMinutes: 目标提醒时刻相对当前系统时间的分钟差（正整数或0）
- targetTimestamp: 目标提醒时刻对应的精确 13 位毫秒 Unix 时间戳（数字）。你必须使用当前参考时间和偏移，计算出正确的最终目标时间戳。
- aiAlertText: 如果 isTask 为 true，根据待办事件，生成一句语气温柔亲切、像贴心小助手、字数控制在15字以内的治愈系提醒文案（点缀少量基础通用表情⏰✨😊等，风格轻松口语化）；如果 isTask 为 false 则输出 null。
 
当前系统参考时间是：${refTime} (对应的当前毫秒戳是 ${refTimestamp})，当前用户时区为 ${refTimezone}。
输入文本：
"${text}"`;

    const models =  ["gemini-3.1-flash-lite", "gemini-3-flash-preview"];
    let lastError = null;

    for (const model of models) {
        try {
            console.log(`[AI Engine] Attempting analysis using model: ${model}`);
            const result = await callGemini(model, systemPrompt, true);
            if (result.statusCode === 200) {
                const responseJSON = JSON.parse(result.body);
                if (responseJSON.candidates && responseJSON.candidates[0] && responseJSON.candidates[0].content) {
                    const aiText = responseJSON.candidates[0].content.parts[0].text;
                    const parsed = JSON.parse(aiText);
                    console.log(`[AI Engine] Analysis successful with ${model}:`, parsed);
                    return res.json(parsed);
                } else {
                    throw new Error("Invalid response format from Gemini API");
                }
            } else {
                console.warn(`[AI Engine] Model ${model} returned status code: ${result.statusCode}`);
                lastError = new Error(`Gemini API responded with status ${result.statusCode}: ${result.body}`);
            }
        } catch (err) {
            console.error(`[AI Engine] Model ${model} failed:`, err.message);
            lastError = err;
        }
    }

    res.status(500).json({ error: lastError ? lastError.message : "Failed to parse task" });
});

// 辅助函数：统一的 AI 文本生成服务
async function generateAIPresets(scene, event, todoList) {
    const promptFn = SCENE_PROMPTS[scene];
    const fallbackFn = SCENE_FALLBACKS[scene];
    
    if (!promptFn || !fallbackFn) {
        throw new Error("Invalid scene");
    }

    const inputArg = scene === 'todo_summary' ? todoList : (scene.includes('alert') ? event : undefined);
    const fallbackText = fallbackFn(inputArg);

    const models = ["gemini-3.1-flash-lite", "gemini-3-flash-preview"];
    
    for (const model of models) {
        try {
            console.log(`[AI Text Generator] Generating scene: ${scene} using model: ${model}`);
            const prompt = promptFn(inputArg);
            const result = await callGemini(model, prompt, false);
            
            if (result.statusCode === 200) {
                const responseJSON = JSON.parse(result.body);
                if (responseJSON.candidates && responseJSON.candidates[0] && responseJSON.candidates[0].content) {
                    let aiText = responseJSON.candidates[0].content.parts[0].text.trim();
                    // 清理 markdown 引号等符号，严格仅保留纯文案
                    aiText = aiText.replace(/[\*\`\"\']/g, '');
                    console.log(`[AI Text Generator] Successful generation: "${aiText}"`);
                    return aiText;
                }
            }
        } catch (err) {
            console.warn(`[AI Text Generator] Model ${model} failed for scene ${scene}:`, err.message);
        }
    }

    console.warn(`[AI Text Generator] Fallback used for scene: ${scene} ➜ "${fallbackText}"`);
    return fallbackText;
}

// 接口 4: 实时生成治愈文案的端点
app.post('/api/generate-notify', async (req, res) => {
    const { scene, event, todoList } = req.body;
    try {
        const text = await generateAIPresets(scene, event, todoList);
        res.json({ text });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 接口 5: 无状态端点，由客户端按需触发，安全实现 Serverless 架构下的在线 Discord 私信提醒代发
app.post('/api/send-discord-alert', async (req, res) => {
    const { discordUserId, event, taskId, message } = req.body;
    if (!discordUserId || !event) {
        return res.status(400).json({ error: "Missing discordUserId or event" });
    }

    console.log(`[API Alert Dispatcher] Client triggered Discord DM push for user ${discordUserId}: "${event}"`);

    try {
        // 优先使用客户端传入的预生成/缓存 AI 文案，实现真正的零延迟（跳过 Gemini 实时调用）
        let alertMessage = message;
        if (!alertMessage) {
            alertMessage = `记得 ${event} 哦😊`;
            try {
                alertMessage = await generateAIPresets('discord_alert', event);
            } catch (e) {
                console.warn("[API Alert Dispatcher] AI text generation failed, using fallback.");
            }
        }

        await sendDiscordDM(discordUserId, alertMessage);
        console.log(`[API Alert Dispatcher] DM successfully sent to user ${discordUserId}`);
        
        // 记录在已成功通知的 taskId 集合中，供客户端心跳/同步对齐
        if (!userNotifiedTaskIds[discordUserId]) {
            userNotifiedTaskIds[discordUserId] = new Set();
        }
        if (taskId) {
            userNotifiedTaskIds[discordUserId].add(taskId);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(`[API Alert Dispatcher] DM dispatch failed for ${discordUserId}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// 接口 2: 接收在线心跳
app.post('/api/heartbeat', (req, res) => {
    const { discordUserId, notifyMode } = req.body;
    let notifiedIds = [];
    if (discordUserId) {
        activeUsers[discordUserId] = Date.now();
        if (notifyMode) {
            userPrefs[discordUserId] = { notifyMode };
        }
        if (userNotifiedTaskIds[discordUserId]) {
            notifiedIds = Array.from(userNotifiedTaskIds[discordUserId]);
        }
    }
    res.json({ success: true, notifiedTaskIds: notifiedIds });
});

// 接口 3: 同步提醒任务快照
app.post('/api/sync-tasks', (req, res) => {
    const { discordUserId, notifyMode, tasks } = req.body;
    let notifiedIds = [];
    if (discordUserId) {
        // 直接覆盖现有任务快照（客户端 localStorage 是唯一数据源，任务删除或已通知后会被移出）
        userTasks[discordUserId] = tasks || [];
        if (notifyMode) {
            userPrefs[discordUserId] = { notifyMode };
        }
        if (userNotifiedTaskIds[discordUserId]) {
            notifiedIds = Array.from(userNotifiedTaskIds[discordUserId]);
        }
    }
    res.json({ success: true, notifiedTaskIds: notifiedIds });
});

/**
 * 辅助函数: Discord Bot 私信通道建立
 */
async function createDMChannel(userId) {
    const token = process.env.DISCORD_BOT_TOKEN;
    const url = 'https://discord.com/api/v10/users/@me/channels';
    const payload = JSON.stringify({ recipient_id: userId });

    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const req = https.request({
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(JSON.parse(data).id);
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', err => reject(err));
        req.write(payload);
        req.end();
    });
}

/**
 * 辅助函数: Discord Bot 发送私信
 */
async function sendDiscordDM(userId, message) {
    const channelId = await createDMChannel(userId);
    const token = process.env.DISCORD_BOT_TOKEN;
    const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
    const payload = JSON.stringify({ content: message });

    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const req = https.request({
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'POST',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', err => reject(err));
        req.write(payload);
        req.end();
    });
}

/**
 * AI-driven 智能多模式分发定时扫描服务 (支持并行 await 并与 Vercel Cron/Local 定时器共用)
 */
async function scanAndDispatchReminders() {
    const now = Date.now();
    const promises = [];

    for (const [userId, tasks] of Object.entries(userTasks)) {
        const mode = userPrefs[userId]?.notifyMode || 'default';
 
        // 如果是 'web' 模式，绝对不发送 Discord 消息
        if (mode === 'web') continue;
 
        // 判定分发条件
        const shouldSend = (mode === 'discord') || (mode === 'default');
 
        if (shouldSend) {
            for (const task of tasks) {
                // 增加 3 分钟时效窗口过滤，防止服务器/Vercel容器重启或内存丢失时，将历史已过期陈年任务瞬间一次性狂轰滥炸发送出去！
                if (task.targetTimestamp && now >= task.targetTimestamp && (now - task.targetTimestamp) <= 180000) {
                    const notifiedKey = `${userId}_${task.id}`;
                    if (!notifiedTasks.has(notifiedKey)) {
                        notifiedTasks.add(notifiedKey);
                        console.log(`[Alert Dispatcher] Dispatching task "${task.event}" to user ${userId} under mode: ${mode}`);
                        
                        const sendPromise = (async () => {
                            try {
                                // 优先使用客户端预存的缓存文案，实现真正的零延时与单次 AI 生成！
                                let alertMessage = task.aiAlertText || `记得 ${task.event} 哦😊`;
                                if (!task.aiAlertText) {
                                    try {
                                        alertMessage = await generateAIPresets('discord_alert', task.event);
                                    } catch (e) {
                                        console.warn("[Alert Dispatcher] Local text generation function failed, using fallback.");
                                    }
                                }
     
                                await sendDiscordDM(userId, alertMessage);
                                console.log(`[Alert Dispatcher] DM successfully sent to ${userId}`);

                                // 记录已成功发送通知的任务ID，供前端心跳/同步拉取对齐
                                if (!userNotifiedTaskIds[userId]) {
                                    userNotifiedTaskIds[userId] = new Set();
                                }
                                userNotifiedTaskIds[userId].add(task.id);
                            } catch (err) {
                                console.error(`[Alert Dispatcher] DM dispatch failed for ${userId}:`, err.message);
                            }
                        })();
                        promises.push(sendPromise);
                    }
                }
            }
        }
    }

    // 并行等待所有异步 Discord DM 发送任务彻底完成，保障在 Serverless 容器被冻结前彻底完成连接！
    await Promise.all(promises);
}

// 接口 6: Vercel Cron 定时触发扫描端点，实现真正的无状态 Serverless 定时离线提醒
app.get('/api/cron-scan', async (req, res) => {
    console.log("[Cron Engine] Vercel Cron triggered scanning...");
    try {
        await scanAndDispatchReminders();
        res.json({ success: true, message: "Scan and dispatch completed successfully." });
    } catch (err) {
        console.error("[Cron Engine] Error during scan:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// 仅在非 Vercel 环境（如本地 Localhost）下才启动背景定时器，避免云端产生无意义的 Socket 中断报错
if (!process.env.VERCEL) {
    setInterval(async () => {
        try {
            await scanAndDispatchReminders();
        } catch (e) {}
    }, 10000);
    console.log("[Server Started] Local background scanner active (10s intervals).");
} else {
    console.log("[Server Started] Running on Vercel. Background setInterval scanner disabled (using Vercel Cron instead).");
}

app.listen(PORT, () => {
    console.log(`[Server Started] StickyFlow middleware server is running on http://localhost:${PORT}`);
});

module.exports = app;
