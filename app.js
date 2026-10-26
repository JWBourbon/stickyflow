/* ============================================================
   Sticky365 · 纸岁365  —  Core Application
   ============================================================
   状态机 · Canvas 涂鸦 · PointerEvent 手势引擎
   Web Audio 音效合成器 · LocalStorage 持久化
   ============================================================ */
(() => {
'use strict';

// ── Constants ──────────────────────────────────────────
const DRAG_THRESHOLD  = 120;
const MAX_NOTES       = 365;
const NOTES_KEY       = 'sticky365_notes';
const PREFS_KEY       = 'sticky365_prefs';
const DPR             = Math.min(window.devicePixelRatio || 1, 2);
const SPRING          = 'cubic-bezier(0.16, 1, 0.3, 1)';

// ── i18n 多语言字典 ────────────────────────────────────
const I18N = {
    zh: {
        pageTitle: 'StickyFlow · 流笺',
        boardTitle: 'FlowBoard · 流笺贴板',
        boardEmpty: '暂无流笺记录',
        boardCloseTitle: '收起贴板',
        boardToggleTitle: '查看流笺贴板',
        textPlaceholder: '点击这里开始打字...',
        exitBtnLabel: '退出编辑',
        dragUp: '↑ 上拉保存到贴板',
        dragDown: '↓ 下拉撕毁销毁',
        sidebarEditMode: '编辑模式',
        modeBrush: '画笔',
        modeText: '打字',
        brushSizeLabel: '笔刷粗细',
        colorLabel: '颜色',
        customColorLabel: '自定义',
        paperStyleLabel: '纸张样式',
        paperBlank: '空白',
        paperRuled: '横线',
        paperGrid: '网格',
        snapLabel: '辅助对齐',
        snapOn: '磁吸对齐: 开',
        snapOff: '磁吸对齐: 关',
        soundLabel: '音效',
        soundOn: '开启',
        soundOff: '静音',
        themeMenuHeader: '选择时光壁纸',
        themeBtnTitle: '切换背景',
        musicBtnPlayTitle: '播放背景音乐',
        musicBtnPauseTitle: '暂停背景音乐',
        themeIceInspiration: '冰扉灵感',
        themeWarmOat: '燕麦暖白',
        themeFogBlue: '莫兰迪蓝',
        themeSpringGreen: '春日奶绿',
        themeMinimalWhite: '极简纯白',
        themeDeepDrift: '经典深邃',
        themeCustomGlass: '自定义玻璃',
        customBackBtn: '返回',
        customSubTitle: '自定义玻璃气象',
        customUpload: '上传图片',
        glassFrosted: '毛玻璃',
        glassTranslucent: '通透玻璃',
        glassLiquid: '液态玻璃',
        weatherTitle: '窗外环境模拟',
        timeAuto: '自动时间',
        timeSunrise: '柔和日出',
        timeMorning: '清晨明亮',
        timeNoon: '烈日当空',
        timeSunset: '绝美日落',
        timeNight: '幽蓝深夜',
        weatherAuto: '自动天气',
        weatherClear: '晴空万里',
        weatherCloudy: '烟雨微阴',
        weatherRainy: '细雨微滑',
        weatherHeavyRain: '暴雨倾盆',
        weatherThunderstorm: '电闪雷鸣',
        weatherSunShower: '太阳金雨',
        toastLimit: '⚠️ 年度配额已满',
        toastStorageFull: '存储空间已满',
        toastImageFail: '图片缓存失败，请尝试其他尺寸图片',
        langBtnLabel: '切换语言',
        notifyLabel: '流笺提醒',
        notifyModeDefault: '通知: 双渠道',
        notifyModeWeb: '通知: 仅浏览器',
        notifyModeDiscord: '通知: 仅 Discord',
        notifyAuthBtn: '授权浏览器通知',
        discordInputPlaceholder: 'Discord UserID 绑定',
        discordInputTitle: '用于网页离线时的 Discord 私信提醒',
        notifyToggleTitle: '切换通知总开关',
        pushPermissionBtnTitle: '请求浏览器通知权限',
        weatherSoundOn: '窗外环境音：开启',
        weatherSoundOff: '窗外环境音：关闭',
    },
    en: {
        pageTitle: 'StickyFlow',
        boardTitle: 'Flow Board',
        boardEmpty: 'No flow notes yet',
        boardCloseTitle: 'Collapse board',
        boardToggleTitle: 'View flow board',
        textPlaceholder: 'Tap here to start typing...',
        exitBtnLabel: 'Exit editing',
        dragUp: '↑ Swipe up to save',
        dragDown: '↓ Swipe down to discard',
        sidebarEditMode: 'Edit Mode',
        modeBrush: 'Brush',
        modeText: 'Type',
        brushSizeLabel: 'Brush Size',
        colorLabel: 'Color',
        customColorLabel: 'Custom',
        paperStyleLabel: 'Paper Style',
        paperBlank: 'Blank',
        paperRuled: 'Ruled',
        paperGrid: 'Grid',
        snapLabel: 'Snap Align',
        snapOn: 'Snap: On',
        snapOff: 'Snap: Off',
        soundLabel: 'Sound',
        soundOn: 'On',
        soundOff: 'Mute',
        themeMenuHeader: 'Choose Wallpaper',
        themeBtnTitle: 'Switch theme',
        musicBtnPlayTitle: 'Play background music',
        musicBtnPauseTitle: 'Pause background music',
        themeIceInspiration: 'Ice Door Inspiration',
        themeWarmOat: 'Warm Oat',
        themeFogBlue: 'Misty Blue',
        themeSpringGreen: 'Spring Green',
        themeMinimalWhite: 'Pure White',
        themeDeepDrift: 'Deep Drift',
        themeCustomGlass: 'Custom Glass',
        customBackBtn: 'Back',
        customSubTitle: 'Custom Glass Weather',
        customUpload: 'Upload Image',
        glassFrosted: 'Frosted',
        glassTranslucent: 'Clear Glass',
        glassLiquid: 'Liquid Glass',
        weatherTitle: 'Window Weather',
        timeAuto: 'Auto Time',
        timeSunrise: 'Sunrise',
        timeMorning: 'Morning',
        timeNoon: 'Noon',
        timeSunset: 'Sunset',
        timeNight: 'Night',
        weatherAuto: 'Auto Weather',
        weatherClear: 'Clear Sky',
        weatherCloudy: 'Cloudy',
        weatherRainy: 'Light Rain',
        weatherHeavyRain: 'Heavy Rain',
        weatherThunderstorm: 'Thunderstorm',
        weatherSunShower: 'Sun Shower',
        toastLimit: '⚠️ Quota limit reached',
        toastStorageFull: 'Storage full',
        toastImageFail: 'Image cache failed. Try a smaller image.',
        langBtnLabel: 'Switch Language',
        notifyLabel: 'Flow Reminders',
        notifyModeDefault: 'Notify: Both',
        notifyModeWeb: 'Notify: Web Only',
        notifyModeDiscord: 'Notify: Discord Only',
        notifyAuthBtn: 'Authorize Browser Push',
        discordInputPlaceholder: 'Bind Discord UserID',
        discordInputTitle: 'For offline Discord push notifications',
        notifyToggleTitle: 'Switch notification mode',
        pushPermissionBtnTitle: 'Request browser notification permission',
        weatherSoundOn: 'Environment Sound: On',
        weatherSoundOff: 'Environment Sound: Mute',
    }
};

// ── Sound Engine (Web Audio API 合成器) ────────────────
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.weatherSoundEnabled = true;

        this.rainSource = null;
        this.rainFilter = null;
        this.rainGain = null;
    }

    _ensure() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    /** 飞纸音效：极速上扬的高通-带通滤波白噪滑音 (完美的 "咻" 声) */
    playFly() {
        if (!this.enabled) return;
        this._ensure();
        const dur = 0.4;
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            const t = i / d.length;
            const env = Math.pow(1 - t, 1.5);
            d[i] = (Math.random() * 2 - 1) * env;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;

        // 带通滤波器扫频，Q 值降至 2.2 拓宽通带宽度，让声能更丰满、更厚实
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.setValueAtTime(2.2, this.ctx.currentTime);
        bp.frequency.setValueAtTime(400, this.ctx.currentTime);
        bp.frequency.exponentialRampToValueAtTime(5800, this.ctx.currentTime + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.48, this.ctx.currentTime + dur * 0.18); // 极大提升音量峰值至 0.48
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);   // 呈指数衰减消音

        src.connect(bp).connect(gain).connect(this.ctx.destination);
        src.start();
    }

    /** 撕纸音效：高频随机爆音突裂调制 + 扫频带通 (高度还原真实的 “撕拉” 撕纸声) */
    playTear() {
        if (!this.enabled) return;
        this._ensure();
        const dur = 0.52; // 撕纸时间稍微延长一点，更加爽快
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            const t = i / d.length;
            
            // 1. 正弦波超低频调制，模拟手撕纸张时阻力引起的不规则抖动与断层
            const ripWobble = Math.sin(t * Math.PI * 16) * 0.45 + 0.55;
            
            // 2. 模拟纸张纤维在拉力下瞬间绷断（Crack 爆音）的高频随机脉冲信号
            const fiberSnap = Math.random() > 0.15 ? (Math.random() * 2 - 1) : (Math.random() > 0.4 ? 0.95 : -0.95);
            
            // 3. 经典的指数包络，控制撕纸声音末尾渐隐
            const env = Math.pow(1 - t, 0.45);
            
            d[i] = fiberSnap * env * ripWobble;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;

        // 撕纸时由于速度由快变慢，声调/谐振频点应呈现从 3200Hz 快速下滑到 1100Hz 的趋势
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.setValueAtTime(1.8, this.ctx.currentTime);
        bp.frequency.setValueAtTime(3200, this.ctx.currentTime);
        bp.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + dur * 0.08); // 极速起音
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);   // 指数级自然消音

        src.connect(bp).connect(gain).connect(this.ctx.destination);
        src.start();
    }

    /** 落墨音效：柔和正弦衰减 */
    playInk() {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.07);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
    }

    /** 打字机音效：温润木质拟物敲击（机械键盘红轴感） */
    playTypewriter() {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        
        // 1. 温润的纸质敲击声 (Click) - 极短白噪声配合低频带通滤波
        const clickDur = 0.035;
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr * clickDur, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass'; // 改用带通滤波，过滤尖锐高频与干瘪低频，只留温润木质中频
        filter.frequency.setValueAtTime(450 + Math.random() * 150, t);
        filter.Q.setValueAtTime(1.2, t);
        
        // 2. 润感木鱼腔体共鸣 (Tack) - 温暖正弦波低频衰减，极具弹力
        const osc = this.ctx.createOscillator();
        osc.type = 'sine'; // 改用纯正弦波，杜绝尖锐锯齿/三角波谐波
        osc.frequency.setValueAtTime(320 + Math.random() * 80, t); // 降频至 320Hz-400Hz 治愈区间
        
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.012, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        
        const mainGain = this.ctx.createGain();
        mainGain.gain.setValueAtTime(0.12 + Math.random() * 0.02, t); // 音量下调至 1/4，(0.6)内敛克制，久听不累
        mainGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        
        src.connect(filter).connect(mainGain);
        osc.connect(oscGain).connect(mainGain);
        mainGain.connect(this.ctx.destination);
        
        src.start(t);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    /** 打字机换行/Tab完成铃声：清脆的叮当金属声 */
    playBell() {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2200, t);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2750, t);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.3);
        osc2.stop(t + 0.3);
    }

    /** 
     * 换背景时的平滑“唰唰”音效
     * 提供了四种截然不同的高定声学美感设计，可通过修改下面代码中的 style 参数或在外部调用时传入
     * style 1: 极致轻盈·清风拂过 (Airy Whispering Wind) - 默认推荐，清亮通透
     * style 2: 拟物美学·纸张摩擦 (Soft Paper Rustle) - 带有纸张滑过的磨砂沙沙感
     * style 3: 疗愈宇宙·极光潮汐 (Ambient Auroral Wave) - 温暖开阔，深海低频共鸣
     * style 4: 空灵水晶·微芒闪烁 (Crystal Shimmer) - 星光划过的清冷闪烁声
     */
    playSwoosh(style = 1) {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        
        // 1. 生成高纯度白噪声 Buffer 作为基础音源
        const dur = 0.45; // 450ms 舒适的滑过时长
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = Math.random() * 2 - 1;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        
        // 2. 核心滤波器与增益控制器
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        
        if (style === 1) {
            // style 1: 极致轻盈·清风拂过
            // 采用带通滤波器扫频，模拟清风拂动舒展的质感，通透内敛
            filter.type = 'bandpass';
            filter.Q.setValueAtTime(2.0, t);
            filter.frequency.setValueAtTime(3500, t);
            filter.frequency.exponentialRampToValueAtTime(800, t + dur);
            
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.28, t + dur * 0.2); // 20% 时间达到峰值
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        } else if (style === 2) {
            // style 2: 拟物美学·纸张摩擦
            // 低 Q 值宽频沙沙声，高度拟真高级手作宣纸或棉麻布料滑过的“唰唰”阻尼感
            filter.type = 'bandpass';
            filter.Q.setValueAtTime(1.0, t);
            filter.frequency.setValueAtTime(1800, t);
            filter.frequency.linearRampToValueAtTime(1200, t + dur);
            
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.35, t + dur * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        } else if (style === 3) {
            // style 3: 疗愈宇宙·极光潮汐
            // 低通滤波器大范围平滑呼吸，辅以极低频正弦温润共鸣，听感极其开阔温暖
            filter.type = 'lowpass';
            filter.Q.setValueAtTime(1.2, t);
            filter.frequency.setValueAtTime(300, t);
            filter.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.4);
            filter.frequency.exponentialRampToValueAtTime(400, t + dur);
            
            // 叠加一个深海温暖正弦共振波 (120Hz)
            const osc = this.ctx.createOscillator();
            const oscGain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, t);
            oscGain.gain.setValueAtTime(0.08, t);
            oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
            
            osc.connect(oscGain).connect(gain);
            osc.start(t);
            osc.stop(t + dur);
            
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.22, t + dur * 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        } else if (style === 4) {
            // style 4: 空灵水晶·微芒闪烁
            // 高通+高Q值带通，高频带状振荡，模拟星光划过夜空的清冽回音
            filter.type = 'bandpass';
            filter.Q.setValueAtTime(6.0, t);
            filter.frequency.setValueAtTime(7500, t);
            filter.frequency.exponentialRampToValueAtTime(3200, t + dur);
            
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.12, t + dur * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        }
        
        src.connect(filter).connect(gain).connect(this.ctx.destination);
        src.start(t);
    }

    /** 持续雨声环境合成器 */
    startRain(intensity = 'light') {
        if (!this.enabled || !this.weatherSoundEnabled) return;
        this._ensure();
        
        // 如果已经有雨声在播放，先停止
        this.stopRain();
        
        const sr = this.ctx.sampleRate;
        const dur = 2.0; // 2秒粉红噪声循环缓冲
        const buf = this.ctx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < d.length; i++) {
            const white = Math.random() * 2 - 1;
            // Voss-McCartney 算法生成粉红噪声，基频饱满
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            b6 = white * 0.115926;
            
            // 混合少量白噪声，增加高频沙沙感
            d[i] = (pink * 0.12 + white * 0.04);
        }
        
        this.rainSource = this.ctx.createBufferSource();
        this.rainSource.buffer = buf;
        this.rainSource.loop = true;
        
        this.rainFilter = this.ctx.createBiquadFilter();
        this.rainGain = this.ctx.createGain();
        
        if (intensity === 'light') {
            // 细雨微滑：中频带通，声压克制 (调低音量至 0.045，极度温和)
            this.rainFilter.type = 'bandpass';
            this.rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
            this.rainFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);
            this.rainGain.gain.setValueAtTime(0.045, this.ctx.currentTime);
        } else {
            // 暴雨倾盆/雷雨：深沉低通，声量微降至 0.08，温和舒适
            this.rainFilter.type = 'lowpass';
            this.rainFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
            this.rainGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        }
        
        this.rainSource.connect(this.rainFilter).connect(this.rainGain).connect(this.ctx.destination);
        this.rainSource.start();
    }
    
    stopRain() {
        if (this.rainSource) {
            try {
                this.rainSource.stop();
            } catch (e) {}
            this.rainSource.disconnect();
            this.rainSource = null;
        }
        if (this.rainFilter) {
            this.rainFilter.disconnect();
            this.rainFilter = null;
        }
        if (this.rainGain) {
            this.rainGain.disconnect();
            this.rainGain = null;
        }
    }

    /** 早晨拟真鸟叫啁啾（2-3声连续发声） */
    playBirdChirp() {
        if (!this.enabled || !this.weatherSoundEnabled) return;
        this._ensure();
        const now = this.ctx.currentTime;
        
        const count = Math.floor(Math.random() * 2) + 2; 
        let delay = 0;
        for (let j = 0; j < count; j++) {
            const t = now + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            const baseFreq = 2200 + Math.random() * 300;
            const peakFreq = 3600 + Math.random() * 400;
            const duration = 0.12 + Math.random() * 0.04;
            
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(peakFreq, t + duration * 0.4);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, t + duration);
            
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.05, t + duration * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
            
            osc.connect(gain).connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + duration + 0.02);
            
            delay += duration + 0.08 + Math.random() * 0.05;
        }
    }

    /** 傍晚拟真沙哑乌鸦叫（Vibrato 颤音调制） */
    playCrowCaw() {
        if (!this.enabled || !this.weatherSoundEnabled) return;
        this._ensure();
        const now = this.ctx.currentTime;
        
        const count = Math.floor(Math.random() * 2) + 2;
        let delay = 0;
        for (let j = 0; j < count; j++) {
            const t = now + delay;
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            
            const baseFreq = 580 + Math.random() * 60;
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.linearRampToValueAtTime(baseFreq * 0.85, t + 0.35);
            
            const mod = this.ctx.createOscillator();
            mod.frequency.setValueAtTime(45, t); // 45Hz 颤振
            const modGain = this.ctx.createGain();
            modGain.gain.setValueAtTime(60, t);
            
            mod.connect(modGain).connect(osc.frequency);
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(750, t);
            filter.Q.setValueAtTime(1.2, t);
            
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.032, t + 0.06);
            gain.gain.linearRampToValueAtTime(0.02, t + 0.22);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
            
            osc.connect(filter).connect(gain).connect(this.ctx.destination);
            
            mod.start(t);
            osc.start(t);
            mod.stop(t + 0.4);
            osc.stop(t + 0.4);
            
            delay += 0.48 + Math.random() * 0.1;
        }
    }

    /** 拟真低频雷声合成器（复用全局解锁的 AudioContext 保证在后台定时器中稳定播放） */
    playThunder() {
        if (!this.enabled || !this.weatherSoundEnabled) return;
        this._ensure();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        // 1. 生成 3.2秒的深度滚雷噪波 (Distant rolling thunder)
        const bufferSize = ctx.sampleRate * 3.2; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // 经典的布朗噪波过滤公式，使其本身充满温暖低沉的共振
            data[i] = (lastOut + (0.04 * white)) / 1.018;
            lastOut = data[i];
            data[i] *= 3.8; 
        }
        
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        // 2. 沉浸式滚雷扫频：频率在 1.8秒内从 220Hz 缓缓降落到 80Hz，模拟滚雷滚滚而去的远逝质感！
        const filter1 = ctx.createBiquadFilter();
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(220, now);
        filter1.frequency.exponentialRampToValueAtTime(80, now + 1.8);
        filter1.Q.setValueAtTime(1.5, now);
        
        const filter2 = ctx.createBiquadFilter();
        filter2.type = 'lowpass';
        filter2.frequency.setValueAtTime(140, now);
        filter2.frequency.exponentialRampToValueAtTime(60, now + 2.0);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        // 缓慢起音 (Attack: 0.22s) 模拟声音在云层中扩散的“闷雷”声，彻底消除任何尖锐的“啪”声！
        gain.gain.linearRampToValueAtTime(0.42, now + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.06, now + 1.6);
        gain.gain.linearRampToValueAtTime(0.001, now + 3.2);
        
        noiseNode.connect(filter1).connect(filter2).connect(gain).connect(ctx.destination);
        noiseNode.start(now);
    }

    /** 开启时光流笺贴板声：纸板摩擦清脆滑出与风琴板扣合的物理拟真声 */
    playBoardOpen() {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        
        // 1. 低频摩擦滑出声 (Swoosh)
        const dur1 = 0.35;
        const sr = this.ctx.sampleRate;
        const buf1 = this.ctx.createBuffer(1, sr * dur1, sr);
        const d1 = buf1.getChannelData(0);
        for (let i = 0; i < d1.length; i++) {
            d1[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d1.length, 1.8);
        }
        const src1 = this.ctx.createBufferSource();
        src1.buffer = buf1;
        
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(120, t);
        lp.frequency.exponentialRampToValueAtTime(320, t + dur1);
        
        const gain1 = this.ctx.createGain();
        gain1.gain.setValueAtTime(0.001, t);
        gain1.gain.linearRampToValueAtTime(0.35, t + dur1 * 0.2);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + dur1);
        
        src1.connect(lp).connect(gain1).connect(this.ctx.destination);
        src1.start(t);
        
        // 2. 扣合声：清脆的中高频轻质木盒/卡扣敲击微弱共振
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t + dur1 * 0.45);
        osc.frequency.exponentialRampToValueAtTime(120, t + dur1 * 0.45 + 0.1);
        
        oscGain.gain.setValueAtTime(0.001, t);
        oscGain.gain.setValueAtTime(0.12, t + dur1 * 0.45);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur1 * 0.45 + 0.1);
        
        osc.connect(oscGain).connect(this.ctx.destination);
        osc.start(t + dur1 * 0.45);
        osc.stop(t + dur1 * 0.45 + 0.11);
    }

    /** 翻纸声：掀开便签的轻柔纸页声 */
    playPageFlip() {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        const dur = 0.2;
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.Q.setValueAtTime(1.5, t);
        bp.frequency.setValueAtTime(800, t);
        bp.frequency.exponentialRampToValueAtTime(2200, t + dur);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + dur * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(bp).connect(gain).connect(this.ctx.destination);
        src.start(t);
    }

    /** 落纸声：新纸片落在纸堆上的声响 */
    playPaperDrop() {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        const dur = 0.08;
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(300, t);
        bp.Q.setValueAtTime(1.0, t);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(bp).connect(gain).connect(this.ctx.destination);
        src.start(t);
    }

    /** 粘性剥离声：胶水从桌面撕开的粘滞声 */
    playPeel() {
        if (!this.enabled) return;
        this._ensure();
        const t = this.ctx.currentTime;
        const dur = 0.25;
        const sr = this.ctx.sampleRate;
        const buf = this.ctx.createBuffer(1, sr * dur, sr);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            const env = Math.pow(1 - i / d.length, 0.8);
            d[i] = (Math.random() * 2 - 1) * env;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(30, t);
        lp.frequency.exponentialRampToValueAtTime(400, t + dur);
        lp.Q.setValueAtTime(2.0, t);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.22, t + dur * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(lp).connect(gain).connect(this.ctx.destination);
        src.start(t);
    }
}

// ── Helpers ─────────────────────────────────────────────
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function evaluateMath(expr) {
    let jsExpr = expr.replace(/\^/g, '**');
    // 只允许数字、小数点、括号、基本算术运算符以及空格
    if (!/^[0-9\.\+\-\*\/\%\*\*\(\)\s]+$/.test(jsExpr)) {
        return null;
    }
    try {
        const fn = new Function(`return (${jsExpr})`);
        const res = fn();
        if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
            // 限制最多保留6位有效小数，避免 js 浮点数运算精度偏移 (例如 0.1 + 0.2)
            return Number(res.toFixed(6)).toString();
        }
    } catch (e) {}
    return null;
}

function focusAndPlaceCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

// ── Local ML Engine ─────────────────────────────────────
class LocalMLEngine {
    constructor(storageKey) {
        this.storageKey = storageKey;
        this.wordFreq = {}; // word -> count
        this.bigrams = {};  // word -> { nextWord -> count }
        this.loadModel();
    }

    loadModel() {
        this.wordFreq = {};
        this.bigrams = {};
        try {
            const notes = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            notes.forEach(note => {
                if (note.textData) {
                    this.train(note.textData);
                }
            });
        } catch (e) {
            console.error("Failed to train LocalMLEngine:", e);
        }
    }

    tokenize(text) {
        if (!text) return [];
        const tokens = [];
        // 匹配连续的英文字符/数字/单引号，或者单个中/日/韩非空白非标点字符
        const regex = /[a-zA-Z0-9']+|[\u4e00-\u9fa5]/g;
        let match;
        const lowerText = text.toLowerCase();
        while ((match = regex.exec(lowerText)) !== null) {
            tokens.push(match[0]);
        }
        return tokens;
    }

    train(text) {
        const tokens = this.tokenize(text);
        for (let i = 0; i < tokens.length; i++) {
            const w = tokens[i];
            this.wordFreq[w] = (this.wordFreq[w] || 0) + 1;

            if (i < tokens.length - 1) {
                const nextW = tokens[i + 1];
                if (!this.bigrams[w]) this.bigrams[w] = {};
                this.bigrams[w][nextW] = (this.bigrams[w][nextW] || 0) + 1;
            }
        }
    }

    predict(fullText) {
        if (!fullText) return '';
        
        // 判定是否以空格/换行/中文标点结尾，决定是进行 Word-Level 预测还是 Prefix-Level 预测
        const isSpaceEnding = /[\s\u3002\uff0c\uff01\uff1f\uff1b\uff1a\u3001]$/.test(fullText);
        const tokens = this.tokenize(fullText);
        if (tokens.length === 0) return '';
        
        const lastToken = tokens[tokens.length - 1];
        
        if (isSpaceEnding) {
            // 词尾输入完毕，预测下一个最可能的词 (Markov Bigram)
            const nextWords = this.bigrams[lastToken];
            if (nextWords) {
                let bestWord = '';
                let maxCount = 0;
                for (const nw in nextWords) {
                    if (nextWords[nw] > maxCount) {
                        maxCount = nextWords[nw];
                        bestWord = nw;
                    }
                }
                if (bestWord) return bestWord;
            }
            return '';
        } else {
            // 正在输入一个词的部首前缀
            // 1. 如果存在前一个词，看看在该词后续词中以 lastToken 开头最频繁的词
            if (tokens.length > 1) {
                const prevToken = tokens[tokens.length - 2];
                const nextWords = this.bigrams[prevToken];
                if (nextWords) {
                    let bestWord = '';
                    let maxCount = 0;
                    for (const nw in nextWords) {
                        if (nw.startsWith(lastToken) && nw !== lastToken) {
                            if (nextWords[nw] > maxCount) {
                                maxCount = nextWords[nw];
                                bestWord = nw;
                            }
                        }
                    }
                    if (bestWord) {
                        return bestWord.slice(lastToken.length);
                    }
                }
            }
            
            // 2. 否则，在全局词频库中查找以 lastToken 开头且频率最高者
            let bestWord = '';
            let maxCount = 0;
            for (const w in this.wordFreq) {
                if (w.startsWith(lastToken) && w !== lastToken) {
                    if (this.wordFreq[w] > maxCount) {
                        maxCount = this.wordFreq[w];
                        bestWord = w;
                    }
                }
            }
            if (bestWord) {
                return bestWord.slice(lastToken.length);
            }
            return '';
        }
    }
}

// ── Main Application ───────────────────────────────────
class StickyApp {
    constructor() {
        // 状态
        this.state       = 'idle'; // 'idle' | 'editing'
        this.locked      = false;
        this.sound       = new SoundEngine();
        this.currentNoteId = null;

        // 涂鸦与打字状态
        this.isDrawing   = false;
        this.lastPt      = null;
        this.brushColor  = '#1f2937';
        this.brushSize   = 3;
        this.paperType   = 'blank';
        this.toolMode    = 'text'; // 'brush' | 'text'
        this.activePrediction = '';
        this.ml          = new LocalMLEngine(NOTES_KEY);
        this.snapEnabled = false; // 磁吸对齐默认关闭
        this.inkDryTimer = null;  // 墨水扩散干涸延时器
        this.lastDrawTime = 0; // 墨水压感：上次绘制时间戳

        // 提醒与通知状态
        this.currentIndex = 1;
        this.discordUserId = '';
        this.notifyMode = 'default';

        // 拖拽状态
        this.isDragging  = false;
        this.dragStartY  = 0;
        this.dragStartX  = 0;
        this.dragStartRelX = 0.5; // 拖拽起点相对 X 坐标 (用于拟真物理撕纸角度)
        this.dragDelta   = 0;
        this.dragDeltaX  = 0;
        this.dragPointerId = null;
        this.dragLastTime = 0;
        this.dragSpeed   = 0;
        this.peelTriggered = false; // 粘性剥离音效是否已触发

        // 贴板
        this.boardOpen   = false;

        // 主题背景
        this.theme       = 'ice-inspiration';
        this.bgAnimFrameId = null;

        // 语言
        this.lang        = 'en'; // 默认英文

        // 窗外实时天气与时间模拟引擎属性
        this.weatherTime  = 'auto'; // 'auto' | 'sunrise' | 'morning' | 'noon' | 'sunset' | 'night'
        this.weatherState = 'auto'; // 'auto' | 'clear' | 'cloudy' | 'rainy' | 'heavy-rain' | 'thunderstorm' | 'sun-shower'
        this.realWeatherState = null; // 真实世界物理天气缓存 (用于无感 API 实时定位同步)
        
        // 雨丝与玻璃表面流体水滴粒子系统
        this.weatherRaindrops = [];
        this.weatherGlassDrops = [];
        this.weatherAnimFrame = null;
        this.thunderTimer = null;

        // 陀螺仪惯性低通平滑跟进变量
        this.tiltX = 0;
        this.tiltY = 0;
        this.targetTiltX = 0;
        this.targetTiltY = 0;
        this.shadowDx = 0;
        this.shadowDy = 4;
        this.targetShadowDx = 0;
        this.targetShadowDy = 4;
        this.isSensorListening = false;

        this.init();
    }

    // ━━ 初始化 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    init() {
        // 注册 Service Worker (启用 PWA 支持，并完美适配苹果 iOS Safari 与 Windows 系统的桌面 Web Notification)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[Service Worker] Scope:', reg.scope))
                .catch(err => console.warn('[Service Worker] Registration failed:', err));
        }

        this._cacheDOM();
        this._initCanvas();
        this._loadPrefs();
        this._updateCounter();
        this._renderBoard();
        this._bindEvents();
        this._setToolMode(this.toolMode); // 强制刷新初始编辑状态为默认打字模式
        this._initWeather(); // 启动窗外气象与时间微气候模拟系统
        this._startNotifyTimers(); // 启动心跳与在线通知检查
        this._syncTasksWithBackend(); // 启动时即刻同步本地存量未完成任务
        // 入场动画 (仅在配额未满时播放，满额时进入物理留空态)
        if (this.currentIndex <= 365) {
            this.activeSheet.style.animation = `padEntrance 600ms ${SPRING} forwards`;
            setTimeout(() => { this.activeSheet.style.animation = ''; }, 650);
        } else {
            this.activeSheet.style.display = 'none'; // 彻底从渲染树中剔除，阻绝任何误触与事件穿透
            this.activeSheet.style.opacity = '0';
            this.activeSheet.style.pointerEvents = 'none';
            this.currentNoteId = null;
        }
        
        // 触发网页启动·待办汇总弹窗
        setTimeout(() => {
            this._triggerStartupTodoSummary();
        }, 1200);

        // 播放光遇风疗愈入场音效 (声画物理级完美同步，彻底解决现代浏览器 Autoplay 拦截导致声画割裂痛点)
        const splashSound = document.getElementById('splash-sound');
        const splashScreen = document.getElementById('splash-screen');
        if (splashSound && splashScreen) {
            splashSound.volume = 0.35;
            
            // 尝试在入场 240ms 时静默拉起
            setTimeout(() => {
                const playPromise = splashSound.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // 1. 无感放行：如果浏览器没有拦截 Autoplay，则声画直接同步自动起航入场！
                        console.log("[Audio Engine] Autoplay success! Starting splash synchronized immediately.");
                        splashScreen.classList.add('start');
                    }).catch(() => {
                        // 2. 拦截处理：被浏览器强制拦截，展示“请轻触屏幕”等待词，开启高级静置仪式
                        console.log("[Audio Engine] Autoplay blocked. Showing click-to-unlock splash hint...");
                        splashScreen.classList.add('waiting');
                        
                        const unlock = () => {
                            // 手势触发的同一微秒，百分之百无阻碍地拉起极光疗愈音乐！
                            splashSound.play().then(() => {
                                console.log("[Audio Engine] Splash music successfully unlocked by gesture!");
                            }).catch(() => {});
                            
                            // 同步：瞬间移除等待提示，激活闪屏遮罩毛笔字渐现淡出动画！
                            splashScreen.classList.remove('waiting');
                            splashScreen.classList.add('start');
                            
                            // 播放成功后，立即自我卸载，绝不残留多余监听
                            document.removeEventListener('pointerdown', unlock);
                            document.removeEventListener('keydown', unlock);
                        };
                        document.addEventListener('pointerdown', unlock);
                        document.addEventListener('keydown', unlock);
                    });
                }
            }, 240);
        }
    }

    _cacheDOM() {
        const $ = id => document.getElementById(id);
        this.pad           = $('sticky-pad');
        this.activeSheet   = $('active-sheet');
        this.canvas        = $('draw-canvas');
        this.ctx2d         = this.canvas.getContext('2d');
        this.padPaper      = $('pad-paper');
        this.overlay       = $('overlay');
        this.exitBtn       = $('exit-btn');
        this.sidebar       = $('sidebar');
        this.board         = $('sticky-board');
        this.boardScroll   = $('board-scroll');
        this.boardToggle   = $('board-toggle');
        this.boardClose    = $('board-close-handle');
        this.counter       = $('counter-display');
        this.toast         = null;
        this.brushSlider   = $('brush-size-slider');
        this.brushPreview  = $('brush-preview');
        this.brushSizeSection = $('brush-size-section');
        this.colorPalette  = $('color-palette');
        this.paperBtns     = $('paper-type-btns');
        this.soundBtn      = $('sound-toggle');
        this.weatherSoundBtn = $('weather-sound-toggle');
        this.customColor   = $('custom-color');
        this.hintUp        = $('drag-hint-up');
        this.hintDown      = $('drag-hint-down');
        this.themeBtn      = $('theme-btn');
        this.musicBtn      = $('music-btn');
        this.bgMusic       = $('bg-music');
        if (this.bgMusic) {
            this.bgMusic.volume = 0.15; // 👈 调谐到黄金温润背景音量（15%），极致惬意不喧宾夺主
        }
        this.musicParticlesInterval = null;
        this.themeMenu     = $('theme-menu');
        this.themeOpts     = document.querySelectorAll('.theme-opt');
        this.fluidBg       = $('fluid-bg');
        this.fluidBgStrip  = $('fluid-bg-strip');
        this.customBgBackBtn = $('custom-bg-back-btn');
        this.themeHeader   = this.themeMenu ? this.themeMenu.querySelector('.theme-menu-header') : null;
        this.themeTitle    = $('theme-menu-title');
        this.themeOptionsContainer = this.themeMenu ? this.themeMenu.querySelector('.theme-options') : null;
        
        // 打字模式与 Local ML
        this.textGhost     = $('pad-text-ghost');
        this.textEditor    = $('pad-text-editor');
        this.modeBtns      = $('tool-mode-btns');
        this.snapBtn       = $('snap-toggle');

        // 自定义玻璃背景相关 DOM
        this.customBgImage = $('custom-bg-image');
        this.customBgGlass = $('custom-bg-glass');
        this.customBgControls = $('custom-bg-controls');
        this.customBgUploadBtn = $('custom-bg-upload-btn');
        this.customBgUpload = $('custom-bg-upload');
        this.glassStyleBtns = document.querySelectorAll('.glass-style-btn');
        this.langBtn       = $('lang-btn');

        // 提醒通知 DOM
        this.notifyToggleBtn   = $('notify-toggle');
        this.pushPermissionBtn = $('push-permission-btn');
        this.discordInput      = $('discord-userid-input');

        // 治愈系新加入 DOM
        this.healingToast      = null;
        this.appTitle          = document.querySelector('.app-title');
        this.todoModal         = $('todo-summary-modal');
        this.todoModalBody     = $('todo-summary-body-text');
        this.todoModalClose    = $('todo-summary-close-btn');
        this.todoModalAck      = $('todo-summary-ack-btn');
    }

    _initCanvas() {
        const w = parseInt(getComputedStyle(this.pad).width);
        const h = parseInt(getComputedStyle(this.pad).height);
        this.canvas.width  = w * DPR;
        this.canvas.height = h * DPR;
        this.ctx2d.scale(DPR, DPR);
        this.ctx2d.lineCap   = 'round';
        this.ctx2d.lineJoin  = 'round';
        this._canvasW = w;
        this._canvasH = h;
    }

    _bindEvents() {
        // ── Pad 拖拽 (闲置态) ──
        this.activeSheet.addEventListener('pointerdown', e => this._onPadDown(e));
        document.addEventListener('pointermove', e => this._onPadMove(e));
        document.addEventListener('pointerup',   e => this._onPadUp(e));
        this.activeSheet.addEventListener('pointermove', e => this._onPadHover(e));
        this.activeSheet.addEventListener('pointerleave',e => this._onPadLeave(e));

        // ── Canvas 涂鸦 (编辑态) ──
        this.canvas.addEventListener('pointerdown',  e => this._onDrawStart(e));
        this.canvas.addEventListener('pointermove',  e => this._onDrawMove(e));
        this.canvas.addEventListener('pointerup',    e => this._onDrawEnd(e));
        this.canvas.addEventListener('pointerleave', e => this._onDrawEnd(e));

        // ── Typewriter 打字机事件 ──
        this.textEditor.addEventListener('input', e => this._onTextInput(e));
        this.textEditor.addEventListener('keydown', e => this._onTextKeydown(e));
        this.textEditor.addEventListener('focus', () => {
            if (this.toolMode !== 'text') {
                this._setToolMode('text');
            }
        });
        
        // 阻止 Tab 键在编辑框内默认失去焦点
        this.textEditor.addEventListener('keydown', e => {
            if (e.key === 'Tab') e.preventDefault();
        });

        // ── 退出编辑 ──
        this.overlay.addEventListener('click', () => this._exitEdit());
        if (this.exitBtn) this.exitBtn.addEventListener('click', () => this._exitEdit());

        // 防止侧边栏点击穿透到 overlay
        this.sidebar.addEventListener('click', e => e.stopPropagation());

        // ── 贴板 ──
        this.boardToggle.addEventListener('click', () => this._toggleBoard());
        this.boardClose.addEventListener('click',  () => this._toggleBoard());

        // ── 模式切换 ──
        if (this.modeBtns) {
            this.modeBtns.addEventListener('click', e => {
                const btn = e.target.closest('.mode-btn');
                if (btn) {
                    this._setToolMode(btn.dataset.mode);
                }
            });
        }

        // ── 侧边栏工具 ──
        this.brushSlider.addEventListener('input', e => {
            this._setBrushSize(parseInt(e.target.value));
        });

        this.colorPalette.addEventListener('click', e => {
            const btn = e.target.closest('.color-btn');
            if (btn) this._setBrushColor(btn.dataset.color);
        });

        this.customColor.addEventListener('input', e => {
            this._setBrushColor(e.target.value);
        });

        this.paperBtns.addEventListener('click', e => {
            const btn = e.target.closest('.paper-btn');
            if (btn) this._setPaperType(btn.dataset.type);
        });

        this.soundBtn.addEventListener('click', () => this._toggleSound());
        if (this.weatherSoundBtn) {
            this.weatherSoundBtn.addEventListener('click', () => this._toggleWeatherSound());
        }

        // ── 语言切换 ──
        if (this.langBtn) {
            this.langBtn.addEventListener('click', e => {
                e.stopPropagation();
                this._toggleLang();
            });
        }

        // ── 背景音乐切换 ──
        if (this.musicBtn) {
            this.musicBtn.addEventListener('click', e => {
                e.stopPropagation();
                this._toggleMusic();
            });
        }

        // ── 背景墙壁纸切换 ──
        this.themeBtn.addEventListener('click', e => {
            e.stopPropagation();
            const isOpen = this.themeMenu.classList.toggle('open');
            if (isOpen) {
                if (this.theme === 'custom-glass') {
                    this._showSubMenu(true);
                } else {
                    this._showSubMenu(false);
                }
            }
        });

        this.themeOpts.forEach(opt => {
            opt.addEventListener('click', e => {
                e.stopPropagation();
                const selected = e.currentTarget.dataset.theme;
                this._setTheme(selected);
                if (selected === 'custom-glass') {
                    this._showSubMenu(true);
                } else {
                    this._showSubMenu(false);
                }
            });
        });

        if (this.customBgBackBtn) {
            this.customBgBackBtn.addEventListener('click', e => {
                e.stopPropagation();
                this._showSubMenu(false);
            });
        }

        // 点击空白收回背景菜单与气象下拉弹窗
        document.addEventListener('click', () => {
            if (this.themeMenu) this.themeMenu.classList.remove('open');
            document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                w.classList.remove('active-open');
            });
        });

        // 智能手绘磁吸开关
        if (this.snapBtn) {
            this.snapBtn.addEventListener('click', () => {
                this.snapEnabled = !this.snapEnabled;
                this.snapBtn.classList.toggle('snap-active', this.snapEnabled);
                const text = this.snapBtn.querySelector('.snap-text');
                if (text) {
                    text.textContent = this.snapEnabled ? this._t('snapOn') : this._t('snapOff');
                }
                this.sound.playInk(); // 播放落笔确认声效
            });
        }

        // ── 陀螺仪与鼠标环境投影追踪 ──
        document.addEventListener('mousemove', e => {
            // 在编辑态或拖拽态下，让临近拟物视觉动作（聚焦拉平、跟手位移）接管
            if (this.state === 'editing' || this.isDragging) return;
            
            // 计算坐标偏差比例 (-1.0 -> 1.0)
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            
            // 环境光投影与微量 3D 偏转
            const shX = -x * 12;
            const shY = -y * 12 + 4;
            const tiltX = -y * 8;
            const tiltY = x * 8;
            
            this.pad.style.setProperty('--shadow-dx', `${shX}px`);
            this.pad.style.setProperty('--shadow-dy', `${shY}px`);
            this.pad.style.setProperty('--pad-tilt-x', `${tiltX}deg`);
            this.pad.style.setProperty('--pad-tilt-y', `${tiltY}deg`);
        });

        // ── 移动端重力感应陀螺仪视差 (iOS 13+ 授权避让 + 0.06 果冻惯性低通滤波回路) ──
        const requestOrientation = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    // 使用 iOS 绝对无法挑剔的 click/touchend 完整手势安全上下文进行 async 请求
                    const permissionState = await DeviceOrientationEvent.requestPermission();
                    if (permissionState === 'granted') {
                        console.log("[Sensor Engine] iOS device orientation permission granted!");
                        this._initOrientationListener();
                    } else {
                        console.log("[Sensor Engine] iOS device orientation permission denied.");
                    }
                } catch (err) {
                    console.error("[Sensor Engine] iOS device orientation error:", err);
                }
            } else {
                // 非 iOS (Android等设备无需手势授权直接挂载)
                this._initOrientationListener();
            }
            // 只执行一次，自我卸载
            document.removeEventListener('click', requestOrientation);
            document.removeEventListener('touchend', requestOrientation);
        };
        document.addEventListener('click', requestOrientation);
        document.addEventListener('touchend', requestOrientation);

        // ── 自定义玻璃背景事件 ──
        if (this.customBgUploadBtn) {
            this.customBgUploadBtn.addEventListener('click', e => {
                e.stopPropagation();
                if (this.customBgUpload) {
                    this.customBgUpload.value = ''; // 允许重复上传相同文件
                    this.customBgUpload.click();
                }
            });
        }

        if (this.customBgUpload) {
            this.customBgUpload.addEventListener('change', e => {
                const file = e.target.files[0];
                if (file) {
                    this._compressAndSaveImage(file);
                }
            });
        }

        this.glassStyleBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this._setGlassStyle(e.currentTarget.dataset.style);
            });
        });

        // ── 提醒与通知设置绑定 ──
        if (this.notifyToggleBtn) {
            this.notifyToggleBtn.addEventListener('click', () => this._toggleNotify());
        }
        if (this.pushPermissionBtn) {
            this.pushPermissionBtn.addEventListener('click', () => this._requestPushPermission());
        }
        if (this.discordInput) {
            this.discordInput.addEventListener('change', e => this._onDiscordInput(e));
        }

        // 待办汇总弹窗事件绑定
        if (this.todoModalClose) {
            this.todoModalClose.addEventListener('click', () => this._closeTodoModal());
        }
        if (this.todoModalAck) {
            this.todoModalAck.addEventListener('click', () => this._closeTodoModal());
        }

        // 绑定对底座 #sticky-pad 的点击，用于在留空态下抽纸或重置
        this.pad.addEventListener('click', e => {
            if (this.state === 'idle' && this.activeSheet.style.opacity === '0') {
                e.stopPropagation();
                this._onPadClick();
            }
        });

        // 👈 完美修复 Bug：给重置按钮绑定事件，全面阻断冒泡并触发拆开全新流笺贴重置配额
        const newPadBtn = document.getElementById('new-pad-btn');
        if (newPadBtn) {
            newPadBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                this._onPadClick();
            });
            newPadBtn.addEventListener('pointerdown', e => {
                e.stopPropagation();
            });
            newPadBtn.addEventListener('mousedown', e => {
                e.stopPropagation();
            });
        }

        // ── 窗口尺寸 ──
        window.addEventListener('resize', () => {
            this._resizeCanvas();
        });
    }

    // ━━ 状态机 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _enterEdit() {
        if (this.locked || this.state === 'editing') return;
        this._lock();
        this.sound.playPageFlip();
        this.state = 'editing';

        // 必须清空 inline 样式，以防 hover/drag 状态的 3D 属性阻塞了 CSS 中的 .editing 变形
        this.pad.style.transform  = '';
        this.pad.style.boxShadow  = '';
        this.pad.style.transition = '';
        this.activeSheet.style.transform  = '';
        this.activeSheet.style.boxShadow  = '';
        this.activeSheet.style.transition = '';

        this.pad.classList.add('editing');
        this.activeSheet.classList.add('editing');
        this.overlay.classList.add('active');
        if (this.exitBtn) this.exitBtn.classList.add('visible');
        this.sidebar.classList.add('open');
        this.boardToggle.classList.add('hidden');

        if (this.boardOpen) {
            this.board.classList.remove('open');
            this.boardOpen = false;
            this._updateAppTitle();
        }

        // 智能刷新活动纸张的时光氧化泛黄渲染状态 (以适应编辑状态的投影)
        this._updateActiveSheetStyle();

        // 打字模式自动聚焦
        if (this.toolMode === 'text') {
            setTimeout(() => {
                focusAndPlaceCaretAtEnd(this.textEditor);
            }, 100);
        }

        setTimeout(() => this._unlock(), 420);
    }

    _exitEdit() {
        if (this.locked || this.state !== 'editing') return;
        this._lock();
        this.state = 'idle';

        this.pad.classList.remove('editing');
        this.activeSheet.classList.remove('editing');
        this.overlay.classList.remove('active');
        if (this.exitBtn) this.exitBtn.classList.remove('visible');
        this.sidebar.classList.remove('open');
        this.boardToggle.classList.remove('hidden');

        this.textEditor.blur();

        // 👈 完美修复 Bug：退出编辑/查看存量便签时，自适应复位主界面显示状态
        const isNewNote = (this.currentNoteId === null);
        
        if (!isNewNote) {
            // 如果是在回看历史旧纸，退出回看时：
            if (this.currentIndex <= 365) {
                // 配额未满：清空画布和文字，自动补出一张全新的当前空白待写便签
                this._spawnNew();
            } else {
                // 配额已满：退出回看，底座无纸，进入极致物理留空态，彻底 display: none 避开穿透
                this.activeSheet.style.display = 'none';
                this.activeSheet.style.opacity = '0';
                this.activeSheet.style.pointerEvents = 'none';
                this.currentNoteId = null;
                this._updateCounter(); // 同步触发空底座与徽章显隐
            }
        } else {
            // 如果是正在写的新便签，保持悬浮，仅刷新氧化度和阴影
            this._updateActiveSheetStyle();
        }

        setTimeout(() => this._unlock(), 420);
    }

    _setToolMode(mode) {
        this.toolMode = mode;
        
        // 更新侧边栏编辑模式选项卡高亮
        if (this.modeBtns) {
            this.modeBtns.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === mode);
            });
        }
        
        if (mode === 'text') {
            // 打字模式：允许文字输入层接收事件，穿透 Canvas 涂鸦层
            this.canvas.style.pointerEvents = 'none';
            this.textEditor.style.pointerEvents = 'auto';
            if (this.state === 'editing') {
                focusAndPlaceCaretAtEnd(this.textEditor);
            }
            
            // 降噪笔刷粗细滑块：平滑折叠收起
            if (this.brushSizeSection) {
                this.brushSizeSection.classList.add('collapsed');
            }
            this.brushSlider.disabled = true;
            this.brushSlider.style.opacity = '0.5';
        } else {
            // 画笔模式：文字层不可编辑，Canvas 接收绘图事件
            this.canvas.style.pointerEvents = 'auto';
            this.textEditor.style.pointerEvents = 'none';
            this.textEditor.blur();
            
            // 恢复并平滑展开笔刷滑块
            if (this.brushSizeSection) {
                this.brushSizeSection.classList.remove('collapsed');
            }
            this.brushSlider.disabled = false;
            this.brushSlider.style.opacity = '';
        }
    }

    // ━━ Canvas 涂鸦 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _getPoint(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this._canvasW / rect.width),
            y: (e.clientY - rect.top)  * (this._canvasH / rect.height)
        };
    }

    _applySnap(pt) {
        if (!this.snapEnabled) return pt;
        
        if (this.paperType === 'ruled') {
            // 对齐横线线心 (公式基准: y = 18 + K * 27)
            const nearestY = 18 + Math.round((pt.y - 18) / 27) * 27;
            if (Math.abs(pt.y - nearestY) < 6.8) {
                pt.y = nearestY;
            }
        } else if (this.paperType === 'grid') {
            // 对齐网格十字 (公式基准: 12 + K * 24)
            const nearestX = 12 + Math.round((pt.x - 12) / 24) * 24;
            const nearestY = 12 + Math.round((pt.y - 12) / 24) * 24;
            if (Math.abs(pt.x - nearestX) < 6.8) pt.x = nearestX;
            if (Math.abs(pt.y - nearestY) < 6.8) pt.y = nearestY;
        }
        return pt;
    }

    _onDrawStart(e) {
        if (this.state !== 'editing') return;
        e.preventDefault();
        e.stopPropagation();

        // 1. 恢复“湿墨”状态：清除干墨定时器与 CSS 类，露出光润的原始色彩
        this.canvas.classList.remove('ink-dried');
        if (this.inkDryTimer) {
            clearTimeout(this.inkDryTimer);
            this.inkDryTimer = null;
        }

        this.isDrawing = true;
        this.lastDrawTime = Date.now();
        let pt = this._getPoint(e);
        pt = this._applySnap(pt); // 磁吸对齐过滤
        this.lastPt = pt;

        this.ctx2d.strokeStyle = this.brushColor;
        this.ctx2d.lineWidth   = this.brushSize;
        this.ctx2d.beginPath();
        this.ctx2d.moveTo(pt.x, pt.y);

        // 落点小圆点
        this.ctx2d.fillStyle = this.brushColor;
        this.ctx2d.beginPath();
        this.ctx2d.arc(pt.x, pt.y, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx2d.fill();

        this.ctx2d.beginPath();
        this.ctx2d.moveTo(pt.x, pt.y);

        this.sound.playInk();
    }

    _onDrawMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();

        let pt = this._getPoint(e);
        pt = this._applySnap(pt); // 磁吸对齐过滤
        const mid = {
            x: (this.lastPt.x + pt.x) / 2,
            y: (this.lastPt.y + pt.y) / 2
        };

        // 墨水压感：速度快→笔触细，速度慢→笔触粗
        const dist = Math.hypot(pt.x - this.lastPt.x, pt.y - this.lastPt.y);
        const now = Date.now();
        const dt = Math.max(1, now - this.lastDrawTime);
        const speed = dist / dt;
        this.lastDrawTime = now;
        const pressure = Math.max(0.3, Math.min(1.3, 1.15 - speed * 0.12));
        const dynamicWidth = this.brushSize * pressure;

        this.ctx2d.strokeStyle = this.brushColor;
        this.ctx2d.lineWidth   = dynamicWidth;
        this.ctx2d.quadraticCurveTo(this.lastPt.x, this.lastPt.y, mid.x, mid.y);
        this.ctx2d.stroke();
        this.ctx2d.beginPath();
        this.ctx2d.moveTo(mid.x, mid.y);

        this.lastPt = pt;
    }

    _onDrawEnd(_e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.ctx2d.stroke();
        this.lastPt = null;

        // 2. 笔尖抬起 1.5 秒后，自动触发“水气干涸扩散”物理过程
        if (this.inkDryTimer) clearTimeout(this.inkDryTimer);
        this.inkDryTimer = setTimeout(() => {
            this.canvas.classList.add('ink-dried');
        }, 1500);
    }

    _clearCanvas() {
        this.ctx2d.clearRect(0, 0, this._canvasW, this._canvasH);
        this.canvas.classList.remove('ink-dried');
        if (this.inkDryTimer) {
            clearTimeout(this.inkDryTimer);
            this.inkDryTimer = null;
        }
    }

    _getCanvasData() {
        // 缩放存储以节省 localStorage 空间
        const scale = 0.5;
        const sw = this._canvasW * scale;
        const sh = this._canvasH * scale;
        const off = document.createElement('canvas');
        off.width = sw;
        off.height = sh;
        const octx = off.getContext('2d');
        octx.drawImage(this.canvas, 0, 0, sw, sh);
        return off.toDataURL('image/png');
    }

    _getMergedCanvasData() {
        // 缩放存储以节省 localStorage 空间
        const scale = 0.5;
        const sw = this._canvasW * scale;
        const sh = this._canvasH * scale;
        
        const off = document.createElement('canvas');
        off.width = sw;
        off.height = sh;
        const octx = off.getContext('2d');
        
        // 1. 绘制手笔涂鸦 (缩放比例下绘制)
        octx.drawImage(this.canvas, 0, 0, sw, sh);
        
        // 2. 绘制打字文本
        const text = this.textEditor.innerText || '';
        if (text.trim()) {
            octx.save();
            octx.scale(scale, scale);
            
            octx.font = "500 20px 'Caveat', 'Ma Shan Zheng', 'Courier New', Courier, cursive";
            octx.fillStyle = this.brushColor;
            octx.textBaseline = "top";
            
            const startX = 24;
            const startY = 20; // 适配 style.css 中的 top
            const lineHeight = 27; // 适配 line-height
            const maxWidth = this._canvasW - 48; // padding left + right = 48
            
            const paragraphs = text.split('\n');
            let currentY = startY;
            
            paragraphs.forEach(para => {
                if (para.length === 0) {
                    currentY += lineHeight;
                    return;
                }
                
                let line = '';
                // 逐字拆分以满足 word-break: break-all
                for (let n = 0; n < para.length; n++) {
                    const char = para[n];
                    const testLine = line + char;
                    const metrics = octx.measureText(testLine);
                    
                    if (metrics.width > maxWidth && n > 0) {
                        octx.fillText(line, startX, currentY);
                        line = char;
                        currentY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                if (line) {
                    octx.fillText(line, startX, currentY);
                    currentY += lineHeight;
                }
            });
            
            octx.restore();
        }
        
        return off.toDataURL('image/png');
    }

    _loadCanvasData(dataUrl) {
        return new Promise(resolve => {
            if (!dataUrl) { resolve(); return; }
            const img = new Image();
            img.onload = () => {
                this.ctx2d.drawImage(img, 0, 0, this._canvasW, this._canvasH);
                resolve();
            };
            img.onerror = () => resolve();
            img.src = dataUrl;
        });
    }

    _resizeCanvas() {
        const data = this.canvas.toDataURL();
        const w = parseInt(getComputedStyle(this.pad).width);
        const h = parseInt(getComputedStyle(this.pad).height);
        this.canvas.width  = w * DPR;
        this.canvas.height = h * DPR;
        this.ctx2d.scale(DPR, DPR);
        this.ctx2d.lineCap  = 'round';
        this.ctx2d.lineJoin = 'round';
        this._canvasW = w;
        this._canvasH = h;

        if (data && data !== 'data:,') {
            const img = new Image();
            img.onload = () => {
                this.ctx2d.drawImage(img, 0, 0, w, h);
            };
            img.src = data;
        }
    }

    // ── Typewriter & Local ML Handlers ──────────────────────
    _onTextInput(e) {
        // 播放打字声，带有些微随机性
        this.sound.playTypewriter();
        this._updatePrediction();
    }

    _onTextKeydown(e) {
        if (e.key === 'Tab' && this.activePrediction) {
            e.preventDefault();
            
            const currentText = this.textEditor.innerText || '';
            const pred = this.activePrediction;
            
            // 将预测出的后缀或计算结果拼接到编辑器文本中
            this.textEditor.innerText = currentText + pred;
            
            // 播放清脆的叮当金属铃声，庆祝智能补全/计算成功！
            this.sound.playBell();
            
            // 重置预测值，聚焦并移到末尾
            this.activePrediction = '';
            focusAndPlaceCaretAtEnd(this.textEditor);
            
            // 重新运行预测以适应新的当前文本
            this._updatePrediction();
        }
    }

    _updatePrediction() {
        const text = this.textEditor.innerText || '';
        if (!text) {
            this.activePrediction = '';
            this.textGhost.innerText = '';
            return;
        }

        // 1. 优先进行自动算术公式检测与求值 (Auto-Arithmetic Calculator)
        const mathRegex = /([\d\.\+\-\*\/\%\^\(\)\s]+)=\s*$/;
        const mathMatch = text.match(mathRegex);
        if (mathMatch) {
            const expr = mathMatch[1].trim();
            // 确保不是无意义的纯数字，并且必须含有算术运算符，例如 "100+10 ="
            if (/[\+\-\*\/\%\^]/.test(expr) && !/^\d+$/.test(expr)) {
                const res = evaluateMath(expr);
                if (res !== null) {
                    this.activePrediction = res;
                    const escText = escapeHTML(text);
                    const cleanEscText = escText.endsWith('\n') ? escText.slice(0, -1) : escText;
                    
                    this.textGhost.innerHTML = `${cleanEscText}<span class="predict-text" style="color:${this.brushColor}">${res}<span class="tab-badge">Tab ⇥</span></span>`;
                    return;
                }
            }
        }

        // 2. 否则，降级到 Local ML 文本联想预测
        const pred = this.ml.predict(text);
        
        if (pred) {
            this.activePrediction = pred;
            const escText = escapeHTML(text);
            // 剔除 contenteditable 可能会在最末尾产生的一个多余换行符
            const cleanEscText = escText.endsWith('\n') ? escText.slice(0, -1) : escText;
            
            this.textGhost.innerHTML = `${cleanEscText}<span class="predict-text" style="color:${this.brushColor}">${pred}<span class="tab-badge">Tab ⇥</span></span>`;
        } else {
            this.activePrediction = '';
            this.textGhost.innerText = text;
        }
    }

    // ━━ Pad 拖拽手势 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _onPadDown(e) {
        if (this.locked || this.state === 'editing') return;
        e.preventDefault();
        this.isDragging    = true;
        this.dragStartY    = e.clientY;
        this.dragStartX    = e.clientX;
        const rect = this.activeSheet.getBoundingClientRect();
        this.dragStartRelX = (e.clientX - rect.left) / (rect.width || 320);
        this.dragDelta     = 0;
        this.dragDeltaX    = 0;
        this.dragLastTime  = Date.now();
        this.dragSpeed     = 0;
        this.peelTriggered = false;
        this.dragPointerId = e.pointerId;
        this.activeSheet.classList.add('dragging');
        this.activeSheet.classList.add('lifting'); // 启动弹性拉起过渡类
        this.activeSheet.setPointerCapture(e.pointerId);

        // press 瞬间平滑升起卡片并放大，阴影拉远
        this.activeSheet.style.transform = `translate3d(0, 0, 50px) scale(1.03)`;
        this.activeSheet.style.boxShadow = `
            0 25px 50px -12px rgba(0, 0, 0, 0.22),
            0 8px 24px -8px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
        `;
    }

    _onPadMove(e) {
        if (!this.isDragging || e.pointerId !== this.dragPointerId) return;
        const dy = e.clientY - this.dragStartY;
        const dx = e.clientX - this.dragStartX;
        this.dragDelta = dy;
        this.dragDeltaX = dx;

        // 速度追踪
        const now = Date.now();
        const elapsed = Math.max(1, now - this.dragLastTime);
        this.dragSpeed = Math.sqrt(dx * dx + dy * dy) / elapsed;
        this.dragLastTime = now;

        // 开始滑动时立即移除 lifting 的过渡时间，确保 100% 跟手
        if (this.activeSheet.classList.contains('lifting')) {
            this.activeSheet.classList.remove('lifting');
        }

        // 粘性剥离阻力：向上拖拽前 40px 使用指数阻力（胶水粘滞感）
        let damped;
        const absDy = Math.abs(dy);
        if (dy < 0 && absDy < 40) {
            // 指数阻力区间：越拉越重，模拟胶水正在被撕开
            damped = -Math.pow(absDy * 0.025, 0.55) * 40;
        } else if (dy < 0 && absDy >= 40 && !this.peelTriggered) {
            // 跨越粘性阈值！啪地脱开
            this.peelTriggered = true;
            this.sound.playPeel();
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
            damped = dy * 0.55;
        } else {
            damped = dy * 0.55;
        }

        // 3D 阻尼扭曲与缩放
        const rotateXVal = -(damped / DRAG_THRESHOLD) * 16;
        const scale = 1.03 - Math.min(0.08, Math.abs(damped) / 800);

        // 柔度纸张模拟：加入随位移变化的扭曲与轻微旋转
        const rotateZ = (damped / DRAG_THRESHOLD) * -2.5 + (dx / 200) * 1.5;
        const skewX = (damped / DRAG_THRESHOLD) * 1.5;

        // Paper Curl 弯曲形变：向上拖底边翘、向下拖顶边翘
        const curlAngle = (damped / DRAG_THRESHOLD) * 6;

        this.activeSheet.style.transform = `perspective(800px) translate3d(${dx * 0.08}px, ${damped}px, 60px) rotateX(${rotateXVal + curlAngle}deg) rotateZ(${rotateZ}deg) skewX(${skewX}deg) scale(${scale})`;

        // 动态投影：随拉伸距离进一步拉远，使空间深度更真切
        const lift = Math.min(30, Math.abs(damped) * 0.2);
        
        let ageInset = '';
        if (this.currentNoteId) {
             const note = this._getNote(this.currentNoteId);
             if (note) {
                 const ageMinutes = (Date.now() - note.createTime) / (1000 * 60);
                 const ageDays = ageMinutes / 1.0;
                 const ageFactor = Math.min(1.0, ageDays / 12);
                 if (ageFactor > 0.02) {
                     const vigBlur = ageFactor * 12 + 4;
                     const vigAlpha = ageFactor * 0.22;
                     ageInset = `inset 0 0 ${vigBlur}px rgba(139, 90, 43, ${vigAlpha}), `;
                 }
             }
        }

        this.activeSheet.style.boxShadow = `
            ${ageInset}0 ${25 + lift}px ${50 + lift}px -12px rgba(0, 0, 0, ${0.18 + lift * 0.004}),
            0 ${8 + lift}px ${24 + lift}px -8px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
        `;

        // 方向提示 & 实时纸张裂口物理反馈 (手指受力裂痕 / 撕裂一半 / 撕口斜率 / 精准接触点追踪)
        if (dy < -35) {
            this.hintUp.classList.add('visible');
            this.hintDown.classList.remove('visible');
            this.activeSheet.style.clipPath = '';
        } else if (dy > 15) {
            if (dy > 35) {
                this.hintDown.classList.add('visible');
                this.hintUp.classList.remove('visible');
            } else {
                this.hintUp.classList.remove('visible');
                this.hintDown.classList.remove('visible');
            }
            
            const startX = this.dragStartRelX !== undefined ? this.dragStartRelX : 0.5;
            // 实时受力裂口深度：随拉伸距离线性变深，最深 75%
            const ripDepth = Math.min(75, ((dy - 15) / (DRAG_THRESHOLD - 15)) * 45);
            
            if (ripDepth > 0.5) {
                const steps = 20;
                const leftPoints = [];
                const rightPoints = [];
                
                // 撕裂斜率 (斜着撕开效果)：由拉力横向偏移 dx/dy 决定，动态计算裂痕走向！
                const slope = (dx / Math.max(15, dy)) * 0.35;
                // 精细裂口宽度：随拉深变宽
                const gapHalfWidth = 0.015 * (ripDepth / 45) + 0.002;
                
                // 纸张纤维质感低频波动
                const waveFreq = 2.5;
                const waveAmp = 0.012;
                
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const yPct = t * ripDepth;
                    
                    // 波动 + 倾斜中心线
                    const wave = Math.sin(t * Math.PI * waveFreq) * waveAmp;
                    const fiber = (Math.random() * 2 - 1) * 0.003;
                    const centerX = startX + slope * (yPct / 100) + wave;
                    
                    const xl = Math.max(0, Math.min(1, centerX - gapHalfWidth * (1 - t * 0.6) + fiber));
                    leftPoints.push(`${(xl * 100).toFixed(2)}% ${yPct.toFixed(2)}%`);
                    
                    const xr = Math.max(0, Math.min(1, centerX + gapHalfWidth * (1 - t * 0.6) + fiber));
                    rightPoints.push(`${(xr * 100).toFixed(2)}% ${yPct.toFixed(2)}%`);
                }
                
                const poly = ["0% 0%"];
                poly.push(...leftPoints);
                poly.push(...rightPoints.reverse());
                poly.push("100% 0%", "100% 100%", "0% 100%");
                
                this.activeSheet.style.clipPath = `polygon(${poly.join(', ')})`;
            } else {
                this.activeSheet.style.clipPath = '';
            }
        } else {
            this.hintUp.classList.remove('visible');
            this.hintDown.classList.remove('visible');
            this.activeSheet.style.clipPath = '';
        }
    }

    _onPadUp(e) {
        if (!this.isDragging || e.pointerId !== this.dragPointerId) return;
        this.isDragging = false;
        this.activeSheet.classList.remove('dragging');
        this.activeSheet.classList.remove('lifting');
        this.hintUp.classList.remove('visible');
        this.hintDown.classList.remove('visible');

        const abs = Math.abs(this.dragDelta);

        if (abs < 8) {
            // 核心修复：如果是时光贴板取回的历史旧便签，点击不进入编辑模式，而是弹性回弹
            if (this.currentNoteId !== null) {
                this._springBack();
            } else {
                // 点击新便签 → 进入编辑
                this.activeSheet.style.transform = '';
                this.activeSheet.style.boxShadow = '';
                this._enterEdit();
            }
        } else if (this.dragDelta < -DRAG_THRESHOLD) {
            // 上拉 → 飞纸保存
            this._flyToBoard();
        } else if (this.dragDelta > DRAG_THRESHOLD) {
            // 下拉 → 撕纸销毁
            this._tearDown();
        } else {
            // 未达阈值 → 弹簧回弹
            this._springBack();
        }
    }

    _onPadHover(e) {
        if (this.locked || this.state === 'editing' || this.isDragging) return;

        const rect = this.pad.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // 限制最大倾斜角度为 12 度，让交互柔和但可见
        const rotateX = -(y / (rect.height / 2)) * 12;
        const rotateY = (x / (rect.width / 2)) * 12;

        // 阴影根据倾斜角度发生逆向偏移，增强光源定位与物理厚度感
        const shadowX = -rotateY * 0.9;
        const shadowY = rotateX * 0.9 + 4;
        const shadowBlur = 14 + Math.abs(rotateX) + Math.abs(rotateY);

        this.pad.style.transition = 'transform 100ms ease-out, box-shadow 100ms ease-out';
        this.pad.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
        this.pad.style.boxShadow = `
            ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.08),
            0 4px 12px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(0, 0, 0, 0.03),
            inset 0 1px 0 rgba(255, 255, 255, 0.5)
        `;
    }

    _onPadLeave(_e) {
        if (this.locked || this.state === 'editing' || this.isDragging) return;
        this._resetPadTransform();
    }

    _resetPadTransform() {
        // 使用弹簧曲线平滑归位
        this.pad.style.transition = `transform 450ms ${SPRING}, box-shadow 450ms ${SPRING}`;
        this.pad.style.transform = '';
        this.pad.style.boxShadow = '';
        setTimeout(() => {
            if (this.state !== 'editing' && !this.isDragging) {
                this.pad.style.transition = '';
            }
        }, 470);
    }

    // ━━ 动画 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _flyToBoard() {
        if (this.locked) return;
        this._lock();
        this.sound.playFly();
        if (navigator.vibrate) navigator.vibrate(15);

        const isNewNote = (this.currentNoteId === null);
        const noteId = this.currentNoteId || this._genId();
        
        // 确定物理页码
        let pageNum = this.currentIndex;
        if (!isNewNote) {
            const oldNote = this._getNote(this.currentNoteId);
            pageNum = oldNote ? (oldNote.pageNumber || 1) : 1;
        }

        const note = {
            id:         noteId,
            createTime: this.currentNoteId
                ? (this._getNote(this.currentNoteId)?.createTime || Date.now())
                : Date.now(),
            pageNumber: pageNum,
            canvasData: this._getMergedCanvasData(),
            strokeData: this._getCanvasData(),
            textData:   this.textEditor.innerText || '',
            toolMode:   this.toolMode,
            paperType:  this.paperType,
            brushColor: this.brushColor,
            brushSize:  this.brushSize
        };

        // 异步调用 AI 识别任务
        this._analyzeTaskAndSave(note);

        // 飞纸动画
        this.activeSheet.style.transition = 'none';
        this.activeSheet.style.animation  = `flyUp 700ms ${SPRING} forwards`;

        setTimeout(() => {
            this.activeSheet.style.animation = '';
            this.activeSheet.style.transition = '';
            
            // 全新便签保存，页码进度递增
            if (isNewNote) {
                this.currentIndex++;
                this._savePrefs();
            }

            if (this.currentIndex <= 365) {
                this._spawnNew();
            } else {
                // 365 配额已满 (currentIndex = 366)，进入留空态，彻底 display: none
                this.activeSheet.style.display = 'none';
                this.activeSheet.style.opacity = '0';
                this.activeSheet.style.pointerEvents = 'none';
                this.currentNoteId = null;
            }

            this._renderBoard();
            this._updateCounter();
            this._unlock();

            // 触发 AI 保存成功温馨提示
            this._showAIToast('save_success');
            if (isNewNote) {
                this._triggerQuotaWarningIfNeeded();
            }
        }, 720);
    }

    _generateTearClipPaths() {
        const steps = 80; // 采样步长极细腻，表现生动的纸张毛边
        const activePoints = [];
        const stubPoints = [];

        // 基于拖拽向量和精准接触点追踪计算撕裂斜率 (斜着撕开效果)
        const startX = this.dragStartRelX !== undefined ? this.dragStartRelX : 0.5;
        const dx = this.dragDeltaX || 0;
        const pullAngleFactor = Math.max(-1.5, Math.min(1.5, dx / DRAG_THRESHOLD)); // -1.5 到 1.5
        
        const baseCenter = 12; // 粘胶带高度大约 12%
        // 如果往右拉 (pullAngleFactor > 0)，撕裂线向右倾斜 (即左边撕裂得更深更低，右边更高)
        const slantDiff = pullAngleFactor * 10; 
        const contactOffset = (startX - 0.5) * 6; // 接触点偏左则左边偏低
        
        const startHeight = Math.max(3, Math.min(23, baseCenter - slantDiff + contactOffset));
        const endHeight   = Math.max(3, Math.min(23, baseCenter + slantDiff - contactOffset));

        // 👈 低频波动：决定整体撕口大方向的波纹 (0-2个大波动)
        const waveFreq1 = 1 + Math.random() * 1.8;
        const waveAmp1  = 3 + Math.random() * 4.5; // 起伏幅度为纸张高度 of 3% ~ 7.5%

        // 👈 中频波动：中等小颠簸，增加起伏的细节
        const waveFreq2 = 4 + Math.random() * 4;
        const waveAmp2  = 1.2 + Math.random() * 2; // 起伏幅度 1.2% ~ 3.2%

        // 预生成撕裂线的 Y 百分比数组
        const tearY = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const baseHeight = startHeight * t + endHeight * (1 - t);
            
            const wave1 = Math.sin(t * Math.PI * waveFreq1) * waveAmp1;
            const wave2 = Math.cos(t * Math.PI * waveFreq2) * waveAmp2;
            
            // 👈 极高频随机毛边与纤维碎屑噪声
            const fiber = (Math.random() * 2 - 1) * 0.9;
            
            // 安全限制在顶部 3% ~ 23% 高度内，绝不截断便签核心写字区
            const y = Math.min(23, Math.max(3, baseHeight + wave1 + wave2 + fiber));
            tearY.push(y);
        }

        // 1. 被撕下的主体（activeSheet） clip-path
        // 从左上角 (0% tearY[0]) 开始起伏到右上角 (100% tearY[steps])，然后右下 (100% 100%) -> 左下 (0% 100%) -> 闭合
        for (let i = 0; i <= steps; i++) {
            const x = (i / steps) * 100;
            activePoints.push(`${x.toFixed(2)}% ${tearY[i].toFixed(2)}%`);
        }
        activePoints.push("100% 100%");
        activePoints.push("0% 100%");

        // 2. 留在底座的顶部残片（stub） clip-path
        // 从左上角 (0% 0%) -> 右上角 (100% 0%) -> 沿撕口从右到左返回到左上 -> 闭合
        stubPoints.push("0% 0%");
        stubPoints.push("100% 0%");
        for (let i = steps; i >= 0; i--) {
            const x = (i / steps) * 100;
            stubPoints.push(`${x.toFixed(2)}% ${tearY[i].toFixed(2)}%`);
        }

        return {
            active: `polygon(${activePoints.join(', ')})`,
            stub: `polygon(${stubPoints.join(', ')})`
        };
    }

    _tearDown() {
        if (this.locked) return;
        this._lock();
        this.sound.playTear();
        if (navigator.vibrate) navigator.vibrate(30);

        const isNewNote = (this.currentNoteId === null);

        // 如果是已存的历史旧纸，从 LocalStorage 彻底抹去
        if (!isNewNote) {
            this._deleteNote(this.currentNoteId);
        }

        const startX = this.dragStartRelX !== undefined ? this.dragStartRelX : 0.5;
        const dx = this.dragDeltaX || 0;
        const dy = this.dragDelta || DRAG_THRESHOLD;
        const slope = (dx / Math.max(15, dy)) * 0.35;

        let leftClone = null;
        let rightClone = null;
        let stub = null; // 为保持后面 cleanup 逻辑兼容，留空即可

        // 👈 完美统一：不论角度如何，撕开效果全部沿着用户拖拽开裂的物理斜率切分成左/右两瓣并独立偏飞坠落！
        const isMobile = window.innerWidth <= 640;

        if (isMobile) {
            this.activeSheet.style.display = 'none';
        }
        this.activeSheet.style.opacity = '0';
        this.activeSheet.style.pointerEvents = 'none';

        leftClone = this.activeSheet.cloneNode(true);
        rightClone = this.activeSheet.cloneNode(true);

        // 👈 物理除根：仅在手机移动端彻底移去无关子层，彻底终结 iOS WebKit 硬件加速合成卡顿；电脑端保留笔迹和印章，实现原汁原味拟真
        if (isMobile) {
            [leftClone, rightClone].forEach(clone => {
                const canvas = clone.querySelector('#draw-canvas');
                const ghost  = clone.querySelector('#pad-text-ghost');
                const editor = clone.querySelector('#pad-text-editor');
                const pageNum = clone.querySelector('#pad-page-number');
                if (canvas) canvas.remove();
                if (ghost) ghost.remove();
                if (editor) editor.remove();
                if (pageNum) pageNum.remove();
            });
        }

        leftClone.removeAttribute('id');
        rightClone.removeAttribute('id');
        leftClone.classList.add('cloned-rip-piece');
        rightClone.classList.add('cloned-rip-piece');

        leftClone.style.display = '';
        leftClone.style.opacity = '1';
        leftClone.style.pointerEvents = 'none';
        rightClone.style.display = '';
        rightClone.style.opacity = '1';
        rightClone.style.pointerEvents = 'none';

        const steps = 30;
        const leftPoints = ["0% 0%"];
        const rightPoints = [];

        leftPoints.push(`${(startX * 100).toFixed(2)}% 0%`);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const yPct = t * 100;
            const centerX = startX + slope * t;
            const fiber = (Math.random() * 2 - 1) * 0.004; // 纸纹毛边
            const ripX = Math.max(0, Math.min(1, centerX + fiber)) * 100;
            leftPoints.push(`${ripX.toFixed(2)}% ${yPct.toFixed(2)}%`);
        }
        leftPoints.push(`0% 100%`);

        rightPoints.push(`${(startX * 100).toFixed(2)}% 0%`);
        rightPoints.push("100% 0%");
        rightPoints.push("100% 100%");
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const yPct = t * 100;
            const centerX = startX + slope * t;
            const fiber = (Math.random() * 2 - 1) * 0.004;
            const ripX = Math.max(0, Math.min(1, centerX + fiber)) * 100;
            rightPoints.push(`${ripX.toFixed(2)}% ${yPct.toFixed(2)}%`);
        }

        leftClone.style.clipPath = `polygon(${leftPoints.join(', ')})`;
        rightClone.style.clipPath = `polygon(${rightPoints.join(', ')})`;

        // 依据最终的拉力横向偏移，动态计算左右碎片的物理偏飞轨迹，实现手势物理力的完美传递
        const forceX = dx * 1.2;
        
        let l_x1 = -60 + forceX * 0.35;
        let l_x2 = -240 + forceX * 1.3;
        let l_rz1 = -12 + (dx / 8);
        let l_rz2 = -45 + (dx / 4);

        let r_x1 = 60 + forceX * 0.35;
        let r_x2 = 240 + forceX * 1.3;
        let r_rz1 = 12 + (dx / 8);
        let r_rz2 = 45 + (dx / 4);

        leftClone.style.setProperty('--rip-l-x1', `${l_x1.toFixed(1)}px`);
        leftClone.style.setProperty('--rip-l-x2', `${l_x2.toFixed(1)}px`);
        leftClone.style.setProperty('--rip-l-rz1', `${l_rz1.toFixed(1)}deg`);
        leftClone.style.setProperty('--rip-l-rz2', `${l_rz2.toFixed(1)}deg`);

        rightClone.style.setProperty('--rip-r-x1', `${r_x1.toFixed(1)}px`);
        rightClone.style.setProperty('--rip-r-x2', `${r_x2.toFixed(1)}px`);
        rightClone.style.setProperty('--rip-r-rz1', `${r_rz1.toFixed(1)}deg`);
        rightClone.style.setProperty('--rip-r-rz2', `${r_rz2.toFixed(1)}deg`);

        this.pad.appendChild(leftClone);
        this.pad.appendChild(rightClone);

        leftClone.style.transition = 'none';
        leftClone.style.animation = `ripTearFallLeft 750ms ${SPRING} forwards`;

        rightClone.style.transition = 'none';
        rightClone.style.animation = `ripTearFallRight 750ms ${SPRING} forwards`;

        // 物理拟物：底座加上过渡 class 并同步变薄，展现余量缩进微动画
        const nextIndex = isNewNote ? this.currentIndex + 1 : this.currentIndex;

        const sheets = this.pad.querySelectorAll('.stack-sheet');
        sheets.forEach(sheet => sheet.classList.add('stack-sheet-transition'));
        this._updateStackThickness(nextIndex - 1);

        setTimeout(() => {
            if (stub) stub.remove();
            if (leftClone) leftClone.remove();
            if (rightClone) rightClone.remove();

            sheets.forEach(sheet => sheet.classList.remove('stack-sheet-transition'));
            this.activeSheet.style.animation = '';
            this.activeSheet.style.transition = '';
            this.activeSheet.style.clipPath = '';
            if (isMobile) {
                this.activeSheet.style.display = '';
            }
            this.activeSheet.style.opacity = '';
            this.activeSheet.style.pointerEvents = '';

            // 全新便签撕毁，页码进度递增
            if (isNewNote) {
                this.currentIndex++;
                this._savePrefs();
            }

            // 核心修复 Bug3：撕毁便签后自动补纸，切换展示下一张空白便签！
            if (this.currentIndex <= 365) {
                this._spawnNew();
            } else {
                // 365 配额已满 (currentIndex = 366)，进入留空态，彻底 display: none
                this.activeSheet.style.display = 'none';
                this.activeSheet.style.opacity = '0';
                this.activeSheet.style.pointerEvents = 'none';
                this.currentNoteId = null;
            }

            this._renderBoard();
            this._updateCounter();
            this._unlock();

            // 触发 AI 撕毁移除温馨提示
            this._showAIToast('delete_success');
            if (isNewNote) {
                this._triggerQuotaWarningIfNeeded();
            }
        }, 720);
    }

    _springBack() {
        const startDy = this.dragDelta * 0.55;
        const startDx = (this.dragDeltaX || 0) * 0.08;
        const amplitude = Math.sqrt(startDy * startDy + startDx * startDx);
        
        // 振幅太小则直接归位，避免无意义抖动
        if (amplitude < 5) {
            this.activeSheet.style.transition = `transform 400ms ${SPRING}, box-shadow 400ms ${SPRING}`;
            this.activeSheet.style.transform = '';
            this.activeSheet.style.clipPath = ''; // 👈 重置并闭合实时垂直裂缝
            this._updateActiveSheetStyle();
            setTimeout(() => { this.activeSheet.style.transition = ''; }, 420);
            return;
        }

        // 阻尼振荡回弹 (Damped Oscillation)
        const omega = 18;     // 角频率
        const decay = 8;      // 衰减系数
        const duration = 450; // 总时长 ms
        const startTime = performance.now();
        const dirY = startDy / amplitude;
        const dirX = startDx / amplitude;
        
        const startX = this.dragStartRelX !== undefined ? this.dragStartRelX : 0.5;

        this.activeSheet.style.transition = 'none';
        
        const wobble = (now) => {
            const elapsed = (now - startTime) / 1000; // 秒
            if (elapsed >= duration / 1000) {
                this.activeSheet.style.transform = '';
                this.activeSheet.style.transition = '';
                this.activeSheet.style.clipPath = ''; // 👈 重置并闭合实时垂直裂缝
                this._updateActiveSheetStyle();
                return;
            }
            const val = amplitude * Math.sin(omega * elapsed) * Math.exp(-decay * elapsed);
            const dy = val * dirY;
            const dx = val * dirX;
            const rz = (dy / DRAG_THRESHOLD) * -1.5;
            
            this.activeSheet.style.transform = `translate3d(${dx * 0.3}px, ${dy}px, 0) rotateZ(${rz}deg)`;
            
            // 👈 回弹振荡中，裂缝也随摆动振幅及拉伸距离快速啪啪啪收缩合拢！
            const ripDepth = Math.min(75, ((dy - 15) / (DRAG_THRESHOLD - 15)) * 45);
            if (ripDepth > 0.5) {
                const steps = 20;
                const leftPoints = [];
                const rightPoints = [];
                const slope = (dx / Math.max(15, dy)) * 0.35;
                const gapHalfWidth = (0.015 * (ripDepth / 45) + 0.002) * (ripDepth / 45); // 随回弹收缩变窄
                
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const yPct = t * ripDepth;
                    const centerX = startX + slope * (yPct / 100);
                    const fiber = (Math.random() * 2 - 1) * 0.002;
                    const xl = Math.max(0, Math.min(1, centerX - gapHalfWidth * (1 - t * 0.6) + fiber));
                    leftPoints.push(`${(xl * 100).toFixed(2)}% ${yPct.toFixed(2)}%`);
                    
                    const xr = Math.max(0, Math.min(1, centerX + gapHalfWidth * (1 - t * 0.6) + fiber));
                    rightPoints.push(`${(xr * 100).toFixed(2)}% ${yPct.toFixed(2)}%`);
                }
                const poly = ["0% 0%"];
                poly.push(...leftPoints);
                poly.push(...rightPoints.reverse());
                poly.push("100% 0%", "100% 100%", "0% 100%");
                this.activeSheet.style.clipPath = `polygon(${poly.join(', ')})`;
            } else {
                this.activeSheet.style.clipPath = '';
            }

            requestAnimationFrame(wobble);
        };
        requestAnimationFrame(wobble);
    }

    _spawnNew() {
        this.currentNoteId = null;
        this.sound.playPaperDrop();
        if (navigator.vibrate) navigator.vibrate(8);
        this.activeSheet.style.display = ''; // 👈 完美修复 Bug：补纸或重置配额时，重新激活 activeSheet 显示！
        this._updateActiveSheetStyle(); // 即刻还原为新便签白净质感
        this._updatePageNumber(this._count()); // 核心修复：即刻刷新并还原为全新递增页码
        this._clearCanvas();
        
        // 清空打字框文字与机器学习预测状态，并确保重新允许编辑
        if (this.textEditor) {
            this.textEditor.innerText = '';
            this.textEditor.contentEditable = 'true';
            this.textEditor.style.pointerEvents = '';
        }
        this.activePrediction = '';
        this._updatePrediction();
        
        // 默认恢复打字输入模式
        this._setToolMode('text');

        this.activeSheet.style.transform = '';
        this.activeSheet.style.opacity   = '0';
        this.activeSheet.style.transform = 'translateY(35px) scale(0.88)';

        requestAnimationFrame(() => {
            this.activeSheet.style.transition = `transform 450ms ${SPRING}, opacity 450ms ${SPRING}`;
            this.activeSheet.style.opacity   = '1';
            this.activeSheet.style.transform = '';
            setTimeout(() => { this.activeSheet.style.transition = ''; }, 470);
        });
    }

    // ━━ 贴板 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _toggleBoard() {
        if (this.locked || this.state === 'editing') return;
        this.boardOpen = !this.boardOpen;
        this.board.classList.toggle('open', this.boardOpen);
        document.body.classList.toggle('board-open', this.boardOpen); // 联动 body 类，用于 UI 展开动画
        this._updateAppTitle();
        
        // 触发物理声效与 Haptic 震动
        if (this.boardOpen) {
            this.sound.playBoardOpen();
            if (navigator.vibrate) navigator.vibrate(12); // 轻柔的 12ms 阻尼微震
        } else {
            this.sound.playSwoosh(1);
        }
    }

    _renderBoard() {
        const notes = this._allNotes();
        this.boardScroll.innerHTML = '';

        if (notes.length === 0) {
            this.boardScroll.innerHTML = `<div class="board-empty">${this._t('boardEmpty')}</div>`;
            return;
        }

        // 时间倒序
        notes.sort((a, b) => b.createTime - a.createTime);

        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'board-note';
            card.style.setProperty('--note-rot', `${(-3 + Math.random() * 6).toFixed(1)}deg`);
            card.dataset.id = note.id;

            // 新增半透明彩色胶带条
            const tape = document.createElement('div');
            tape.className = 'note-tape';
            if (note.isTask) {
                tape.style.backgroundColor = 'rgba(74, 222, 128, 0.72)'; // 半透明翠绿
                tape.title = '任务提醒';
            } else {
                tape.style.backgroundColor = 'rgba(96, 165, 250, 0.72)'; // 半透明靛蓝
                tape.title = '普通便签';
            }
            card.appendChild(tape);

            // 计算时光老化因子
            const ageMinutes = (Date.now() - note.createTime) / (1000 * 60);
            const ageDays = ageMinutes / 1.0;
            const ageFactor = Math.min(1.0, ageDays / 12); // 0.0 -> 1.0

            if (ageFactor > 0.02) {
                const sep = ageFactor * 0.22;
                const sat = 1.0 - ageFactor * 0.15;
                const con = 1.0 - ageFactor * 0.05;
                card.style.filter = `sepia(${sep}) saturate(${sat}) contrast(${con})`;
                
                const vigBlur = ageFactor * 8 + 2;
                const vigAlpha = ageFactor * 0.25;
                card.style.boxShadow = `
                    inset 0 0 ${vigBlur}px rgba(139, 90, 43, ${vigAlpha}),
                    0 2px 10px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(0, 0, 0, 0.04)
                `;
            }

            const img = document.createElement('img');
            img.src = note.canvasData;
            img.alt = '';
            img.draggable = false;
            card.appendChild(img);

            const dateEl = document.createElement('div');
            dateEl.className = 'note-date';
            const d = new Date(note.createTime);
            dateEl.textContent = `${d.getMonth() + 1}/${d.getDate()}`;
            card.appendChild(dateEl);

            // ── 贴板便签手势 ──
            let startY = 0, dragging = false, delta = 0;

            card.addEventListener('pointerdown', e => {
                e.stopPropagation();
                startY   = e.clientY;
                dragging = true;
                delta    = 0;
                card.setPointerCapture(e.pointerId);
            });

            card.addEventListener('pointermove', e => {
                if (!dragging) return;
                delta = e.clientY - startY;
                if (delta > 0) {
                    card.style.transform = `translateY(${delta * 0.45}px) rotateX(${delta * 0.35}deg)`;
                    card.style.opacity   = String(Math.max(0.15, 1 - delta / 180));
                }
            });

            card.addEventListener('pointerup', e => {
                if (!dragging) return;
                dragging = false;

                if (delta > 80) {
                    // 向下拖拽删除
                    card.style.animation = `boardNoteFall 500ms ${SPRING} forwards`;
                    this.sound.playTear();
                    setTimeout(() => {
                        this._deleteNote(note.id);
                        this._renderBoard();
                        this._updateCounter();
                        this._syncTasksWithBackend(); // 彻底抹去提醒的同步
                    }, 500);
                } else if (Math.abs(delta) < 8) {
                    // 点击 → 取回编辑
                    this._loadNoteBack(note);
                } else {
                    card.style.transition = `transform 300ms ${SPRING}, opacity 300ms ease`;
                    card.style.transform  = '';
                    card.style.opacity    = '1';
                    setTimeout(() => { card.style.transition = ''; }, 320);
                }
            });

            this.boardScroll.appendChild(card);
        });
    }

    /** 从贴板取回便签到中央 Pad 继续编辑 */
    _loadNoteBack(note) {
        if (this.locked) return;
        this._lock();

        // 核心修复：还原中央活动便签的可视化和交互，打破 display: none 留空态
        this.activeSheet.style.display = '';
        this.activeSheet.style.opacity = '1';
        this.activeSheet.style.pointerEvents = 'auto';

        // 收起贴板
        this.boardOpen = false;
        this.board.classList.remove('open');
        this._updateAppTitle();

        // 设置状态
        this.currentNoteId = note.id;
        this._updateActiveSheetStyle(); // 即刻刷时光氧化质感
        this._updatePageNumber(); // 即刻刷新纸张物理页码
        this.brushColor = note.brushColor || '#1f2937';
        this.brushSize  = note.brushSize  || 3;
        this._setPaperType(note.paperType || 'blank');

        // 更新打字框文字与颜色
        this.textEditor.innerText = note.textData || '';
        this.textEditor.style.color = this.brushColor;
        this._updatePrediction();

        // 更新侧边栏 UI
        this.brushSlider.value = this.brushSize;
        this._updateBrushDot();
        this._updateColorUI();

        // 恢复编辑模式
        this._setToolMode(note.toolMode || 'text');

        // 核心修复：时光贴板拉回的历史旧纸只读挂起，强制设为不可编辑和交互，防止键盘弹出或获得焦点
        this.textEditor.contentEditable = 'false';
        this.textEditor.style.pointerEvents = 'none';

        // 加载画布 (兼容旧便签数据，优先载入纯画笔图，否则降级载入 canvasData)
        this._clearCanvas();
        this._loadCanvasData(note.strokeData || note.canvasData).then(() => {
            // 核心修复：只做挂起观赏，保持 idle 闲置态，绝对禁止自动进入编辑模式
            setTimeout(() => {
                this._unlock();
            }, 350);
        });
    }

    // ━━ Storage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _allNotes() {
        try { return JSON.parse(localStorage.getItem(NOTES_KEY)) || []; }
        catch { return []; }
    }

    _getNote(id) {
        return this._allNotes().find(n => n.id === id);
    }

    _count() {
        return this._allNotes().length;
    }

    _saveNote(note) {
        const notes = this._allNotes();
        const idx = notes.findIndex(n => n.id === note.id);
        if (idx >= 0) notes[idx] = note;
        else notes.push(note);
        try {
            localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
            // 即时重新训练本地机器学习词频模型
            this.ml.loadModel();
        } catch (e) {
            // QuotaExceededError
            this._showToast(this._t('toastStorageFull'));
        }
    }

    _deleteNote(id) {
        const notes = this._allNotes().filter(n => n.id !== id);
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
        // 重新训练本地模型
        this.ml.loadModel();
    }

    _updateCounter() {
        let currentNum = this.currentIndex;
        if (this.currentNoteId) {
            const note = this._getNote(this.currentNoteId);
            if (note && note.pageNumber) {
                currentNum = note.pageNumber;
            }
        }
        
        const displayPage = Math.min(365, currentNum);
        if (this.counter) {
            this.counter.textContent = `${displayPage} / 365`;
        }
        this._updateStackThickness(this.currentIndex - 1);
        this._updatePageNumber();
    }

    _updateStackThickness(consumedCount) {
        const remaining = Math.max(0, 365 - consumedCount);
        
        // 👈 天才拟物视觉设计：每用18张就少一层纸，共21层静止叠纸，厚重感拉满并随用随减
        let visibleSheets = 21;
        if (consumedCount < 360) {
            visibleSheets = 21 - Math.floor(consumedCount / 18);
        } else if (consumedCount < 365) {
            visibleSheets = 1;
        } else {
            visibleSheets = 0;
        }
        
        const sheets = this.pad.querySelectorAll('.stack-sheet');
        sheets.forEach((sheet, idx) => {
            const sheetNum = 21 - idx; // 从上到下对应 sheet-21 -> sheet-1
            if (sheetNum > visibleSheets) {
                sheet.style.opacity = '0';
                sheet.style.pointerEvents = 'none';
            } else {
                sheet.style.opacity = '';
                sheet.style.pointerEvents = '';
            }
        });
        
        // 👈 完美修复 Bug：当 365 张全用完时 (visibleSheets === 0)，控制重置按钮显隐，并隐藏底座阴影以防“隐形空盒投影”
        const newPadBtn = document.getElementById('new-pad-btn');
        if (visibleSheets === 0) {
            if (newPadBtn) newPadBtn.classList.remove('hidden');
            this.pad.classList.add('pad-empty');
        } else {
            if (newPadBtn) newPadBtn.classList.add('hidden');
            this.pad.classList.remove('pad-empty');
        }

        // 另外更新 --stack-factor 控制每层厚度偏移缩微比例
        const remainingRatio = Math.max(0, remaining / 365);
        this.pad.style.setProperty('--stack-factor', remainingRatio);
    }

    _updatePageNumber() {
        let displayNum = this.currentIndex;
        
        // 核心修复：如果是回看或正在编辑的历史便签，则呈现这张便签原本的唯一页码！
        if (this.currentNoteId) {
            const note = this._getNote(this.currentNoteId);
            if (note && note.pageNumber) {
                displayNum = note.pageNumber;
            }
        }
        
        const formatted = String(Math.min(365, displayNum)).padStart(3, '0');
        const el = document.getElementById('pad-page-number');
        if (el) {
            el.textContent = `NO. ${formatted}`;
        }
    }

    // ━━ Preferences ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _loadPrefs() {
        this.glassStyle = 'frosted';
        this.currentIndex = 1;
        try {
            const p = JSON.parse(localStorage.getItem(PREFS_KEY));
            if (p) {
                this.paperType  = p.paperType  || 'blank';
                this.brushColor = p.brushColor || '#1f2937';
                this.brushSize  = p.brushSize  || 3;
                this.sound.enabled = p.soundEnabled !== false;
                this.sound.weatherSoundEnabled = p.weatherSoundEnabled !== false;
                this.theme      = p.theme || 'ice-inspiration';
                this.glassStyle = p.glassStyle || 'frosted';
                this.lang       = p.lang || 'en';
                this.currentIndex = typeof p.currentIndex === 'number' ? p.currentIndex : 1;
                this.discordUserId = p.discordUserId || '';
                this.notifyMode = p.notifyMode || 'default';
            }
        } catch {}

        // 从独立 LocalStorage 键值中载入自定义壁纸数据
        const customBg = localStorage.getItem('sticky365_custom_bg');
        if (customBg && this.customBgImage) {
            this.customBgImage.style.backgroundImage = `url(${customBg})`;
        }

        this._applyPaper();
        this.brushSlider.value = this.brushSize;
        this._updateBrushDot();
        this._updateColorUI();
        this._updateSoundUI();
        this._updateWeatherSoundUI();
        this._updatePaperUI();
        this._setGlassStyle(this.glassStyle); // 应用持久化的玻璃效果
        this._applyTheme(this.theme, true);
        this._applyLanguage(); // 应用持久化的语言选择

        // 刷新提醒通知 UI 状态
        this._updateNotifyUI();
    }

    _savePrefs() {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
            paperType:    this.paperType,
            brushColor:   this.brushColor,
            brushSize:    this.brushSize,
            soundEnabled: this.sound.enabled,
            weatherSoundEnabled: this.sound.weatherSoundEnabled,
            theme:        this.theme,
            glassStyle:   this.glassStyle,
            lang:         this.lang,
            currentIndex: this.currentIndex,
            discordUserId: this.discordUserId,
            notifyMode:    this.notifyMode
        }));
    }

    _setTheme(themeName) {
        this.theme = themeName;
        this._applyTheme(themeName, false);
        if (themeName === 'custom-glass') {
            this._updateWeatherVisuals();
        }
        this._savePrefs();
    }

    _applyTheme(themeName, isInit = false) {
        // 定位对应的主题卡片在卷轴中的索引位置 (支持第 6 款自定义双层玻璃背景)
        const themesList = ['ice-inspiration', 'warm-oat', 'fog-blue', 'spring-green', 'minimal-white', 'deep-drift', 'custom-glass'];
        const targetIndex = themesList.indexOf(themeName);
        if (targetIndex === -1) return;

        // 显示/隐藏自定义壁纸的子控制版面 (点击瞬间响应，给用户清晰操作反馈)
        if (this.customBgControls) {
            this.customBgControls.classList.toggle('hidden', themeName !== 'custom-glass');
        }

        // 同步主题选择列表菜单的 active 高亮状态 (点击瞬间高亮)
        this.themeOpts.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === themeName);
        });

        // 依据背景智能翻转前景明暗模式的逻辑封装
        const updateThemeUI = (currIndex) => {
            const currTheme = themesList[Math.round(currIndex)]; // 四舍五入，滑过一半时自动切换明暗
            
            // 1. 全局其它组件的自适应明暗
            if (currTheme === 'deep-drift') {
                document.body.classList.remove('theme-light');
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.remove('theme-dark');
                document.body.classList.add('theme-light');
            }

            // 2. 右下角按钮与面板背景局部亮度采样对比度引擎驱动
            if (currTheme === 'custom-glass') {
                let bgUrl = '';
                if (this.customBgImage) {
                    const bgStyle = this.customBgImage.style.backgroundImage;
                    if (bgStyle) {
                        const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
                        if (match && match[1]) {
                            bgUrl = match[1];
                        }
                    }
                }
                this._analyzeLocalBackground(bgUrl);
            } else {
                const brightnessPreset = {
                    'ice-inspiration': 120, // 强制定级为暗色底范畴，呈现白水晶字
                    'warm-oat': 220,
                    'fog-blue': 195,
                    'spring-green': 215,
                    'minimal-white': 240,
                    'deep-drift': 25
                };
                const val = brightnessPreset[currTheme] || 128;
                this._applyIconContrast(val > 165 ? 'black' : 'white');
            }
        };

        if (isInit || this.currentBgIndex === undefined) {
            // 初始化阶段：直接跳转到目标位置，不放音效，瞬间定位
            this.currentBgIndex = targetIndex;
            this.fluidBgStrip.style.transition = 'none';
            this.fluidBgStrip.style.transform = `translateY(${-targetIndex * 100}vh)`;
            updateThemeUI(targetIndex);
        } else {
            // 丝滑火车滑行设计 (rAF物理滑行引擎)
            // 取消已有的 rAF 动画，确保在连续快速点击时无缝接轨，极其跟手且平滑
            if (this.bgAnimFrameId) {
                cancelAnimationFrame(this.bgAnimFrameId);
                this.bgAnimFrameId = null;
            }

            const startIdx = this.currentBgIndex; // 允许从上一次滑动的中途无缝开始滑行！
            const distance = targetIndex - startIdx;
            if (Math.abs(distance) < 0.001) return; // 已经在终点

            // 动态滑行时间公式：短距离灵动清脆，长距离沉稳丝滑像火车掠过
            const duration = 500 + Math.abs(distance) * 200; 
            const startTime = performance.now();
            let lastIdx = startIdx;

            // Ease-In-Out Cubic 缓动：起步平滑加速，中段飞驰，入站优雅平滑减速
            const ease = (t) => {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            };

            // 记录已经播放过声音的整数层，防止由于单精度微小抖动重复播放
            const playedSwooshInts = new Set();

            const animate = (now) => {
                let progress = (now - startTime) / duration;
                if (progress > 1) progress = 1;

                const currIdx = startIdx + distance * ease(progress);
                this.currentBgIndex = currIdx;

                // 取消原本 CSS 上的 transition，转由 rAF 帧级精确驱动以保障绝对丝滑度
                this.fluidBgStrip.style.transition = 'none';
                this.fluidBgStrip.style.transform = `translateY(${-currIdx * 100}vh)`;

                // 在滑行中根据当前四舍五入层级实时刷新对比度，实现视觉上划过不同底色的高保真拟物体验
                updateThemeUI(currIdx);

                // 核心：在滑行过程中，检测是否跨越了每一层的正中间点（半整数点 k+0.5）并触发相应的唰唰声！
                const totalDist = Math.abs(distance);
                const playLevelSwoosh = (k) => {
                    if (totalDist <= 2) {
                        // 短程切换 (1-2层)：为了手感干脆紧凑，在跨层中点触发 style 2 (纸张摩擦)
                        this.sound.playSwoosh(2);
                    } else {
                        // 长程奔袭 (>=3层)：全程在每个中点处触发 style 1 (清风掠过)，最后到达终点时也不触发 style 2
                        this.sound.playSwoosh(1);
                    }
                };

                // 将当前帧和上一帧的索引进行 -0.5 偏移，使半整数点转化为偏移后的整数层检测，天生具备完美闭合特性
                const lastIdxShifted = lastIdx - 0.5;
                const currIdxShifted = currIdx - 0.5;

                // 向下移动 (索引增大)：检测偏移后跨越的整数层
                if (distance > 0) {
                    const low = Math.ceil(lastIdxShifted);
                    const high = Math.floor(currIdxShifted);
                    for (let k = low; k <= high; k++) {
                        if (!playedSwooshInts.has(k)) {
                            playLevelSwoosh(k);
                            playedSwooshInts.add(k);
                        }
                    }
                } else {
                    // 向上移动 (索引减小)：检测偏移后跨越的整数层
                    const low = Math.ceil(currIdxShifted);
                    const high = Math.floor(lastIdxShifted);
                    for (let k = low; k <= high; k++) {
                        if (!playedSwooshInts.has(k)) {
                            playLevelSwoosh(k);
                            playedSwooshInts.add(k);
                        }
                    }
                }

                lastIdx = currIdx;

                if (progress < 1) {
                    this.bgAnimFrameId = requestAnimationFrame(animate);
                } else {
                    this.currentBgIndex = targetIndex;
                    this.bgAnimFrameId = null;
                }
            };

            this.bgAnimFrameId = requestAnimationFrame(animate);
        }
    }

    _analyzeLocalBackground(bgUrl) {
        if (!bgUrl) {
            this._applyIconContrast('white');
            return;
        }

        const img = new Image();
        if (bgUrl && !bgUrl.startsWith('data:')) {
            img.crossOrigin = 'anonymous'; // 只有是网络图片链接时，才启用 crossOrigin；Base64 本地图片绝对不要设置，规避 Safari/Chromium 的 tainted 异常！
        }
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = 16;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // 因为两个按钮长驻在屏幕右下角，我们截取壁纸图片右下角最后 15% × 15% 面积的一小块区域进行精确图像采样
                const sx = Math.floor(img.width * 0.85);
                const sy = Math.floor(img.height * 0.85);
                const sWidth = Math.floor(img.width * 0.15);
                const sHeight = Math.floor(img.height * 0.15);

                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 16, 16);
                const imgData = ctx.getImageData(0, 0, 16, 16).data;

                let totalLuminance = 0;
                let count = 0;
                
                for (let i = 0; i < imgData.length; i += 4) {
                    const r = imgData[i];
                    const g = imgData[i+1];
                    const b = imgData[i+2];
                    const a = imgData[i+3];
                    
                    if (a > 30) { // 过滤高度透明的无效像素
                        // 采用 WCAG 2.0 国际标准相对亮度 (Relative Luminance) 计算 Y
                        const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                        totalLuminance += Y;
                        count++;
                    }
                }

                const avgLuminance = count > 0 ? (totalLuminance / count) : 128;
                console.log(`[Luminance Analyzer] Custom local bg average luminance: ${avgLuminance.toFixed(1)}`);
                
                // 亮度判定阈值设为 165
                this._applyIconContrast(avgLuminance > 165 ? 'black' : 'white');
            } catch (e) {
                console.warn("Failed to parse background image luminance:", e);
                this._applyIconContrast('white');
            }
        };
        img.onerror = () => {
            this._applyIconContrast('white');
        };
        img.src = bgUrl;
    }

    _applyIconContrast(mode) {
        if (mode === 'black') {
            document.body.classList.add('local-light-bg');
        } else {
            document.body.classList.remove('local-light-bg');
        }
    }

    _showSubMenu(show) {
        if (show) {
            if (this.themeHeader) this.themeHeader.classList.add('hidden');
            if (this.themeOptionsContainer) this.themeOptionsContainer.classList.add('hidden');
            if (this.customBgControls) this.customBgControls.classList.remove('hidden');
        } else {
            if (this.themeHeader) this.themeHeader.classList.remove('hidden');
            if (this.themeOptionsContainer) this.themeOptionsContainer.classList.remove('hidden');
            if (this.customBgControls) this.customBgControls.classList.add('hidden');
        }
    }

    // ━━ Sidebar 工具交互 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _setBrushSize(size) {
        this.brushSize = size;
        this._updateBrushDot();
        this._savePrefs();
    }

    _updateBrushDot() {
        const dot = this.brushPreview.querySelector('.brush-dot');
        if (dot) {
            dot.style.width      = `${Math.max(2, this.brushSize)}px`;
            dot.style.height     = `${Math.max(2, this.brushSize)}px`;
            dot.style.background = this.brushColor;
        }
    }

    _setBrushColor(color) {
        this.brushColor = color;
        this._updateColorUI();
        this._updateBrushDot();
        this._savePrefs();
    }

    _updateColorUI() {
        this.colorPalette.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === this.brushColor);
        });
        this.customColor.value = this.brushColor;
        
        // 同步打字层文字颜色，更新预测文字
        if (this.textEditor) {
            this.textEditor.style.color = this.brushColor;
        }
        this._updatePrediction();
    }

    _setPaperType(type) {
        this.paperType = type;
        this._applyPaper();
        this._updatePaperUI();
        this._savePrefs();
    }

    _applyPaper() {
        this.padPaper.className = '';
        if (this.paperType !== 'blank') {
            this.padPaper.classList.add(this.paperType);
        }
    }

    _updatePaperUI() {
        this.paperBtns.querySelectorAll('.paper-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === this.paperType);
        });
    }

    _toggleSound() {
        this.sound.enabled = !this.sound.enabled;
        this._updateSoundUI();
        this._updateWeatherSoundUI();
        this._updateWeatherSounds();
        this._savePrefs();
    }

    _updateSoundUI() {
        const icon = this.soundBtn.querySelector('.sound-icon');
        const text = this.soundBtn.querySelector('.sound-text');
        icon.textContent = this.sound.enabled ? '🔊' : '🔇';
        text.textContent = this.sound.enabled ? this._t('soundOn') : this._t('soundOff');
    }

    _toggleWeatherSound() {
        this.sound.weatherSoundEnabled = !this.sound.weatherSoundEnabled;
        this._updateWeatherSoundUI();
        this._updateWeatherSounds();
        this._savePrefs();
    }

    _updateWeatherSoundUI() {
        if (!this.weatherSoundBtn) return;
        const icon = this.weatherSoundBtn.querySelector('.btn-icon');
        const text = this.weatherSoundBtn.querySelector('.btn-text');
        
        const enabled = this.sound.weatherSoundEnabled;
        if (icon) {
            icon.textContent = enabled ? 'volume_up' : 'volume_off';
        }
        if (text) {
            text.textContent = enabled ? this._t('weatherSoundOn') : this._t('weatherSoundOff');
        }
        this.weatherSoundBtn.classList.toggle('mute', !enabled);
    }

    _toggleMusic() {
        if (!this.bgMusic) return;
        
        const isPlaying = !this.bgMusic.paused;
        const icon = this.musicBtn ? this.musicBtn.querySelector('.music-icon') : null;

        if (isPlaying) {
            // 暂停播放音乐
            this.bgMusic.pause();
            
            if (this.musicBtn) {
                this.musicBtn.classList.remove('playing');
                this.musicBtn.title = this._t('musicBtnPlayTitle');
            }

            if (icon) {
                // 1. 捕获当前无缝旋转中的实时角度
                const style = window.getComputedStyle(icon);
                const transform = style.transform || style.webkitTransform;
                let currentAngle = 0;
                
                if (transform && transform !== 'none') {
                    const values = transform.split('(')[1].split(')')[0].split(',');
                    const a = parseFloat(values[0]);
                    const b = parseFloat(values[1]);
                    // 解算角度并归一化到 0 ~ 360 度
                    let angle = Math.atan2(b, a) * (180 / Math.PI);
                    if (angle < 0) angle += 360;
                    currentAngle = angle;
                }

                // 2. 强力锚定：先用行内样式锁死在当前旋转度数，并暂时剥离所有 transition 避免跳变
                icon.style.transition = 'none';
                icon.style.transform = `rotate(${currentAngle}deg)`;
                
                // 3. 强刷 offsetHeight 促使浏览器主线程同步该状态
                icon.offsetHeight; 

                // 4. 施加高级物理缓动：用极其平滑的减速曲线，顺势自然转满至正角度 360deg
                icon.style.transition = 'transform 950ms cubic-bezier(0.25, 1, 0.5, 1)';
                icon.style.transform = 'rotate(360deg)';

                // 5. 动画结束后，完美清除痕迹，无缝回归 CSS 默认状态
                const onTransitionEnd = (e) => {
                    if (e.propertyName === 'transform') {
                        icon.style.transition = 'none';
                        icon.style.transform = '';
                        icon.offsetHeight; // 强刷确保瞬间归零后不会在移除 'none' 时产生反向过渡
                        icon.style.transition = '';
                        icon.removeEventListener('transitionend', onTransitionEnd);
                    }
                };
                icon.addEventListener('transitionend', onTransitionEnd);
            }

            if (this.musicParticlesInterval) {
                clearInterval(this.musicParticlesInterval);
                this.musicParticlesInterval = null;
            }
        } else {
            // 开始播放音乐 (调谐到 15% 黄金 BGM 音量，极致惬意)
            this.bgMusic.volume = 0.15;
            
            // 如果 icon 有行内样式，必须立刻清除，让 CSS keyframes 接管
            if (icon) {
                icon.style.transition = '';
                icon.style.transform = '';
            }

            this.bgMusic.play().then(() => {
                if (this.musicBtn) {
                    this.musicBtn.classList.add('playing');
                    this.musicBtn.title = this._t('musicBtnPauseTitle');
                }
                this._startMusicParticles();
            }).catch(err => {
                console.warn("Failed to play bg music (requires user interaction first):", err);
            });
        }
    }

    _startMusicParticles() {
        if (this.musicParticlesInterval) clearInterval(this.musicParticlesInterval);
        
        this.musicParticlesInterval = setInterval(() => {
            if (!this.musicBtn || !this.bgMusic || this.bgMusic.paused) {
                clearInterval(this.musicParticlesInterval);
                this.musicParticlesInterval = null;
                return;
            }
            
            const symbols = ['♪', '♫', '♬', '♩', '🎶'];
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            
            const part = document.createElement('span');
            part.className = 'music-particle';
            part.innerText = sym;
            
            // 漂移方向：向左上漂移（避开右下屏幕边缘）
            const tx = -15 - Math.random() * 45;
            const ty = -60 - Math.random() * 60;
            const rot = (Math.random() * 2 - 1) * 45;
            
            part.style.setProperty('--mp-tx', `${tx}px`);
            part.style.setProperty('--mp-ty', `${ty}px`);
            part.style.setProperty('--mp-rot', `${rot}deg`);
            
            part.style.left = '50%';
            part.style.top = '50%';
            part.style.transform = 'translate(-50%, -50%)';
            
            this.musicBtn.appendChild(part);
            
            setTimeout(() => {
                part.remove();
            }, 2000);
        }, 700);
    }

    // ━━ UI 辅助 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ━━ UI 辅助 (全新垂直排队防叠加 Toast 系统) ━━━━━━━━━━━━━━━━
    _createQueuedToast(text, type = 'healing') {
        const container = document.getElementById('toast-container');
        if (!container) return null;

        const toastEl = document.createElement('div');
        toastEl.className = `toast-item ${type}`;
        
        const span = document.createElement('span');
        span.textContent = text;
        toastEl.appendChild(span);

        container.appendChild(toastEl);

        const duration = type === 'warning' ? 3200 : 3600;
        toastEl._timer = setTimeout(() => {
            this._removeQueuedToast(toastEl);
        }, duration);

        return toastEl;
    }

    _removeQueuedToast(toastEl) {
        if (!toastEl || toastEl.classList.contains('leaving')) return;
        toastEl.classList.add('leaving');
        if (toastEl._timer) clearTimeout(toastEl._timer);
        setTimeout(() => {
            if (toastEl.parentNode) {
                toastEl.parentNode.removeChild(toastEl);
            }
        }, 400);
    }

    _updateHealingToastText(toastEl, text) {
        if (!toastEl || toastEl.classList.contains('leaving')) return;
        const span = toastEl.querySelector('span');
        if (!span || span.textContent === text) return;

        span.style.transition = 'opacity 200ms ease';
        span.style.opacity = '0';
        setTimeout(() => {
            span.textContent = text;
            span.style.opacity = '1';
        }, 220);
    }

    _showToast(msg) {
        if (!msg) return;
        // 如果已经自带了表情符号前缀，不重复添加 ⚠️
        const prefix = (msg.startsWith('⚠️') || msg.startsWith('🌓') || msg.startsWith('💻') || msg.startsWith('👾') || msg.startsWith('🎉') || msg.startsWith('⏰') || msg.startsWith('🔗') || msg.startsWith('🔓')) ? '' : '⚠️ ';
        this._createQueuedToast(`${prefix}${msg}`, 'warning');
    }

    _showHealingToast(text) {
        return this._createQueuedToast(text, 'healing');
    }

    _showAIToast(scene, inputArg = null) {
        const localFallbacks = {
            'save_success': () => `记录完成✨`,
            'delete_success': () => `已移除这条记录啦`,
            'low_quota': () => `剩余页数不多咯，请珍惜使用~`,
            'quota_reset': () => `新的空白页已准备好，继续记录吧！`,
            'ai_busy': () => `助手暂时忙碌，已正常保存笔记`,
            'network_error': () => `网络有点小波动，内容已本地保存😊`
        };

        const fallbackFn = localFallbacks[scene];
        if (!fallbackFn) return;
        const fallbackText = fallbackFn();

        // 只有 ai notify 的 task (如浏览器通知/Discord消息) 才需要 AI generate 生成个性化文案，
        // 其他普通的系统状态提示一律使用预设 (pre-set) 的本地文案，避免重复请求 AI 生成。
        this._showHealingToast(fallbackText);
    }

    // ━━ APP Title 智能状态重载 ━━━━━━━━━━━━━━━━━━━━━━━━
    _updateAppTitle() {
        if (!this.appTitle) return;
        this.appTitle.textContent = this.boardOpen ? this._t('boardTitle') : this._t('pageTitle');
    }

    get remainCount() {
        return Math.max(0, 365 - (this.currentIndex - 1));
    }

    _triggerQuotaWarningIfNeeded() {
        const remaining = this.remainCount;
        if (remaining <= 10 && remaining > 0) {
            setTimeout(() => {
                this._showAIToast('low_quota');
            }, 1800);
        }
    }

    _triggerStartupTodoSummary() {
        const now = Date.now();
        const unfulfilledTasks = this._allNotes()
            .filter(n => n.isTask && !n.notifySent && n.targetTimestamp && n.targetTimestamp > now);

        if (unfulfilledTasks.length === 0) return;

        const listText = unfulfilledTasks
            .map((n, i) => `${i + 1}. ${n.event || n.textData.trim().substring(0, 15)}`)
            .join('\n');

        const fallbackText = `哈喽，这里是你的近期待办：\n\n${listText}`;

        if (this.todoModalBody) {
            this.todoModalBody.textContent = fallbackText;
        }
        if (this.todoModal) {
            this.todoModal.classList.remove('hidden');
        }
    }

    _closeTodoModal() {
        if (this.todoModal) {
            this.todoModal.classList.add('hidden');
        }
    }

    _lock()   { this.locked = true; }
    _unlock() { this.locked = false; }

    // ━━ i18n 语言切换 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    _t(key) {
        return (I18N[this.lang] || I18N.en)[key] || key;
    }

    _toggleLang() {
        this.lang = this.lang === 'zh' ? 'en' : 'zh';
        this._applyLanguage();
        this._savePrefs();
    }

    _applyLanguage() {
        const t = (key) => this._t(key);

        // 语言按钮自身
        if (this.langBtn) {
            this.langBtn.querySelector('.lang-text').textContent = this.lang === 'zh' ? '中' : 'EN';
            this.langBtn.title = t('langBtnLabel');
        }

        // 页面标题
        document.title = t('pageTitle');
        document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en';

        // 贴板
        this._updateAppTitle();
        const boardClose = document.getElementById('board-close-handle');
        if (boardClose) boardClose.title = t('boardCloseTitle');
        if (this.boardToggle) this.boardToggle.title = t('boardToggleTitle');

        // 便签 placeholder
        if (this.textEditor) this.textEditor.dataset.placeholder = t('textPlaceholder');
        if (this.exitBtn) this.exitBtn.setAttribute('aria-label', t('exitBtnLabel'));

        // 拖拽提示
        if (this.hintUp) this.hintUp.querySelector('span').textContent = t('dragUp');
        if (this.hintDown) this.hintDown.querySelector('span').textContent = t('dragDown');

        // 侧边栏标签 (支持流笺提醒通知菜单翻译)
        const labels = document.querySelectorAll('#sidebar .tool-label');
        const labelKeys = ['sidebarEditMode', 'brushSizeLabel', 'colorLabel', 'paperStyleLabel', 'snapLabel', 'soundLabel', 'notifyLabel'];
        labels.forEach((el, i) => { if (labelKeys[i]) el.textContent = t(labelKeys[i]); });

        // 提醒通知控制按钮及输入框翻译
        if (this.notifyToggleBtn) this.notifyToggleBtn.title = t('notifyToggleTitle');
        if (this.pushPermissionBtn) {
            this.pushPermissionBtn.title = t('pushPermissionBtnTitle');
            const pushText = this.pushPermissionBtn.querySelector('.push-text');
            if (pushText) pushText.textContent = t('notifyAuthBtn');
        }
        if (this.discordInput) {
            this.discordInput.placeholder = t('discordInputPlaceholder');
            this.discordInput.title = t('discordInputTitle');
        }
        this._updateNotifyUI();

        // 编辑模式按钮
        const brushModeBtn = document.querySelector('.mode-btn[data-mode="brush"] span');
        const textModeBtn = document.querySelector('.mode-btn[data-mode="text"] span');
        if (brushModeBtn) brushModeBtn.textContent = t('modeBrush');
        if (textModeBtn) textModeBtn.textContent = t('modeText');

        // 自定义颜色标签
        const customLabel = document.querySelector('.custom-label');
        if (customLabel) customLabel.textContent = t('customColorLabel');

        // 纸张按钮
        const paperSpans = document.querySelectorAll('.paper-btn span');
        const paperKeys = ['paperBlank', 'paperRuled', 'paperGrid'];
        paperSpans.forEach((el, i) => { if (paperKeys[i]) el.textContent = t(paperKeys[i]); });

        // 磁吸对齐
        const snapText = document.querySelector('.snap-text');
        if (snapText) snapText.textContent = this.snapEnabled ? t('snapOn') : t('snapOff');

        // 音效
        this._updateSoundUI();
        this._updateWeatherSoundUI();

        // 主题菜单
        if (this.themeTitle) this.themeTitle.textContent = t('themeMenuHeader');
        if (this.themeBtn) this.themeBtn.title = t('themeBtnTitle');
        if (this.musicBtn) {
            const isPlaying = this.bgMusic && !this.bgMusic.paused;
            this.musicBtn.title = isPlaying ? t('musicBtnPauseTitle') : t('musicBtnPlayTitle');
        }

        // 主题选项名称
        const themeNameMap = {
            'ice-inspiration': 'themeIceInspiration',
            'warm-oat': 'themeWarmOat',
            'fog-blue': 'themeFogBlue',
            'spring-green': 'themeSpringGreen',
            'minimal-white': 'themeMinimalWhite',
            'deep-drift': 'themeDeepDrift',
            'custom-glass': 'themeCustomGlass'
        };
        this.themeOpts.forEach(opt => {
            const key = themeNameMap[opt.dataset.theme];
            if (key) {
                const nameEl = opt.querySelector('.theme-name');
                if (nameEl) nameEl.textContent = t(key);
            }
        });

        // 自定义玻璃子菜单
        const backBtn = document.getElementById('custom-bg-back-btn');
        if (backBtn) {
            const txt = backBtn.querySelector('.btn-text');
            if (txt) txt.textContent = t('customBackBtn');
        }
        const subTitle = document.querySelector('.sub-menu-title');
        if (subTitle) {
            const txt = subTitle.querySelector('.title-text');
            if (txt) txt.textContent = t('customSubTitle');
        }
        if (this.customBgUploadBtn) {
            const txt = this.customBgUploadBtn.querySelector('.btn-text');
            if (txt) txt.textContent = t('customUpload');
        }

        // 玻璃样式按钮
        const glassBtns = document.querySelectorAll('.glass-style-btn');
        glassBtns.forEach(btn => {
            if (btn.dataset.style === 'frosted') btn.textContent = t('glassFrosted');
            if (btn.dataset.style === 'translucent') btn.textContent = t('glassTranslucent');
            if (btn.dataset.style === 'liquid') btn.textContent = t('glassLiquid');
        });

        // 气象标题
        const weatherTitleEl = document.querySelector('.weather-title');
        if (weatherTitleEl) {
            const txt = weatherTitleEl.querySelector('.title-text');
            if (txt) txt.textContent = t('weatherTitle');
        }

        // 天气时间下拉选项
        const timeOpts = document.querySelectorAll('#weather-time-wrapper .custom-select-opt');
        const timeKeys = { auto: 'timeAuto', sunrise: 'timeSunrise', morning: 'timeMorning', noon: 'timeNoon', sunset: 'timeSunset', night: 'timeNight' };
        timeOpts.forEach(opt => {
            const k = timeKeys[opt.dataset.value];
            if (k) {
                const txt = opt.querySelector('.opt-text');
                if (txt) txt.textContent = t(k);
            }
        });

        // 天气状态下拉选项
        const stateOpts = document.querySelectorAll('#weather-state-wrapper .custom-select-opt');
        const stateKeys = { auto: 'weatherAuto', clear: 'weatherClear', cloudy: 'weatherCloudy', rainy: 'weatherRainy', 'heavy-rain': 'weatherHeavyRain', thunderstorm: 'weatherThunderstorm', 'sun-shower': 'weatherSunShower' };
        stateOpts.forEach(opt => {
            const k = stateKeys[opt.dataset.value];
            if (k) {
                const txt = opt.querySelector('.opt-text');
                if (txt) txt.textContent = t(k);
            }
        });

        // 同步下拉触发器文本
        this._syncCustomSelect('weather-time-wrapper', this.weatherTime);
        this._syncCustomSelect('weather-state-wrapper', this.weatherState);

        // Toast 默认文本
        if (this.toast) {
            this.toast.querySelector('span').textContent = t('toastLimit');
        }

        // 贴板空状态
        const boardEmpty = this.boardScroll.querySelector('.board-empty');
        if (boardEmpty) boardEmpty.textContent = t('boardEmpty');
    }

    _setGlassStyle(style) {
        this.glassStyle = style;
        
        // 重新配置自定义玻璃隔板的类
        if (this.customBgGlass) {
            this.customBgGlass.className = '';
            this.customBgGlass.classList.add(style);
        }
        
        // 更新菜单选项卡的 active 激活高亮
        this.glassStyleBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.style === style);
        });
        
        this._savePrefs();
    }

    _compressAndSaveImage(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                // 限制最大宽高到 1200px 级，防御性保障 localStorage 不超限
                const maxDim = 1200;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                
                // 压缩为 JPEG, 质量系数 0.82 (体积小巧，且肉眼完全无差异)
                try {
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
                    localStorage.setItem('sticky365_custom_bg', compressedBase64);
                    
                    if (this.customBgImage) {
                        this.customBgImage.style.backgroundImage = `url(${compressedBase64})`;
                    }
                    
                    // 自动切换为自定义玻璃背景，提供极致丝滑的物理滚屏体验
                    this._setTheme('custom-glass');
                    
                    // 【终极必杀修复】强制手动触发一次右下角背景局部分析，保障每次上传新背景图后 30ms 内完成文字和 icon 自适应反色！
                    this._analyzeLocalBackground(compressedBase64);
                } catch (err) {
                    console.error("Image compression error:", err);
                    this._showToast(this._t('toastImageFail'));
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    _updateActiveSheetStyle() {
        if (!this.currentNoteId) {
            this.activeSheet.style.filter = '';
            this.activeSheet.style.boxShadow = '';
            return;
        }
        const note = this._getNote(this.currentNoteId);
        if (!note) return;
        
        const ageMinutes = (Date.now() - note.createTime) / (1000 * 60);
        const ageDays = ageMinutes / 1.0;
        const ageFactor = Math.min(1.0, ageDays / 12);
        
        if (ageFactor > 0.02) {
            const sep = ageFactor * 0.22;
            const sat = 1.0 - ageFactor * 0.15;
            const con = 1.0 - ageFactor * 0.05;
            this.activeSheet.style.filter = `sepia(${sep}) saturate(${sat}) contrast(${con})`;
            
            const vigBlur = ageFactor * 12 + 4;
            const vigAlpha = ageFactor * 0.22;
            
            if (this.state === 'editing') {
                this.activeSheet.style.boxShadow = `
                    inset 0 0 ${vigBlur}px rgba(139, 90, 43, ${vigAlpha}),
                    0 30px 60px -15px rgba(0, 0, 0, 0.35),
                    0 0 0 1px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5)
                `;
            } else {
                this.activeSheet.style.boxShadow = `
                    inset 0 0 ${vigBlur}px rgba(139, 90, 43, ${vigAlpha}),
                    0 1px 3px rgba(0, 0, 0, 0.08),
                    0 4px 12px rgba(0, 0, 0, 0.06),
                    0 0 0 1px rgba(0, 0, 0, 0.03),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5)
                `;
            }
        } else {
            this.activeSheet.style.filter = '';
            this.activeSheet.style.boxShadow = '';
        }
    }

    // ━━ 窗外实时天气与时间模拟引擎 (Micro-Climate Weather System) ━━━━━━━━━━
    _initWeather() {
        this.weatherCanvasBack  = document.getElementById('weather-canvas-back');
        this.weatherCtxBack     = this.weatherCanvasBack ? this.weatherCanvasBack.getContext('2d') : null;
        this.weatherCanvasFront = document.getElementById('weather-canvas-front');
        this.weatherCtxFront    = this.weatherCanvasFront ? this.weatherCanvasFront.getContext('2d') : null;
        
        // 从 LocalStorage 载入缓存的气象与时间段偏好
        try {
            this.weatherTime  = localStorage.getItem('sticky365_weather_time') || 'auto';
            this.weatherState = localStorage.getItem('sticky365_weather_state') || 'auto';
        } catch {
            this.weatherTime  = 'auto';
            this.weatherState = 'auto';
        }

        // 初始化并配置自定义时间段选择菜单
        const timeWrapper = document.getElementById('weather-time-wrapper');
        if (timeWrapper) {
            this._syncCustomSelect('weather-time-wrapper', this.weatherTime);
            timeWrapper.querySelectorAll('.custom-select-opt').forEach(opt => {
                opt.addEventListener('click', e => {
                    e.stopPropagation();
                    const val = e.currentTarget.dataset.value;
                    this.weatherTime = val;
                    try { localStorage.setItem('sticky365_weather_time', this.weatherTime); } catch {}
                    this._syncCustomSelect('weather-time-wrapper', val);
                    this._updateWeatherVisuals();
                    timeWrapper.classList.remove('active-open');
                });
            });
        }

        // 初始化并配置自定义天气类型选择菜单
        const stateWrapper = document.getElementById('weather-state-wrapper');
        if (stateWrapper) {
            this._syncCustomSelect('weather-state-wrapper', this.weatherState);
            stateWrapper.querySelectorAll('.custom-select-opt').forEach(opt => {
                opt.addEventListener('click', e => {
                    e.stopPropagation();
                    const val = e.currentTarget.dataset.value;
                    this.weatherState = val;
                    try { localStorage.setItem('sticky365_weather_state', this.weatherState); } catch {}
                    this._syncCustomSelect('weather-state-wrapper', val);
                    this._updateWeatherVisuals();
                    stateWrapper.classList.remove('active-open');
                });
            });
        }

        // 初始化自定义下拉框的气象选项点击切换 (兼容移动端手势触控)
        const triggers = document.querySelectorAll('.custom-select-trigger');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', e => {
                e.stopPropagation();
                const wrapper = trigger.closest('.custom-select-wrapper');
                const wasOpen = wrapper.classList.contains('active-open');
                
                // 互斥关闭其它下拉框
                document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                    w.classList.remove('active-open');
                });
                
                if (!wasOpen) {
                    wrapper.classList.add('active-open');
                }
            });
        });

        // 监听视口 Resize，确保粒子在全屏上完美平铺
        this._resizeWeatherCanvas();
        window.addEventListener('resize', () => this._resizeWeatherCanvas());

        // 初次加载刷一遍环境光照对比度滤镜
        this._updateWeatherVisuals();

        // 尝试无感拉取用户所在地理位置的真实气象
        this._fetchRealWeather();

        // 启动环境音效轮询（检查当前时间与气象，以极低频率随机触发鸟叫或乌鸦叫）
        this.ambientSoundInterval = setInterval(() => {
            this._checkAndPlayAmbientSounds();
        }, 10000); // 每10秒检查一次

        // 启动雨丝和流体水滴的 requestAnimationFrame 循环
        this._startWeatherAnimation();
    }

    _syncCustomSelect(wrapperId, value) {
        const wrapper = document.getElementById(wrapperId);
        if (!wrapper) return;
        const triggerText = wrapper.querySelector('.trigger-text');
        const activeOpt = wrapper.querySelector(`.custom-select-opt[data-value="${value}"]`);
        
        wrapper.querySelectorAll('.custom-select-opt').forEach(opt => {
            opt.classList.remove('active');
        });
        
        if (activeOpt) {
            activeOpt.classList.add('active');
            if (triggerText) {
                triggerText.innerHTML = activeOpt.innerHTML;
            }
        }
    }

    _resizeWeatherCanvas() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (this.weatherCanvasBack) {
            this.weatherCanvasBack.width  = w;
            this.weatherCanvasBack.height = h;
        }
        if (this.weatherCanvasFront) {
            this.weatherCanvasFront.width  = w;
            this.weatherCanvasFront.height = h;
        }
    }

    _startWeatherAnimation() {
        if (this.weatherAnimFrame) {
            cancelAnimationFrame(this.weatherAnimFrame);
        }
        const loop = () => {
            this._loopWeather();
            this.weatherAnimFrame = requestAnimationFrame(loop);
        };
        this.weatherAnimFrame = requestAnimationFrame(loop);
    }

    _loopWeather() {
        if (!this.weatherCanvasBack || !this.weatherCtxBack || !this.weatherCanvasFront || !this.weatherCtxFront) return;

        const w = this.weatherCanvasBack.width;
        const h = this.weatherCanvasBack.height;

        // 性能安全阀：如果不处于“自定义双层玻璃”壁纸，直接清空 Canvas 并暂停渲染以节省宝贵的机器 CPU / GPU 算力！
        if (this.theme !== 'custom-glass') {
            this.weatherCtxBack.clearRect(0, 0, w, h);
            this.weatherCtxFront.clearRect(0, 0, w, h);
            return;
        }

        this.weatherCtxBack.clearRect(0, 0, w, h);
        this.weatherCtxFront.clearRect(0, 0, w, h);

        const { state } = this._getEffectiveTimeAndWeather();

        // 1. 如果是晴天或多云（没下雨），逐渐销毁并清空粒子
        const isRainy = ['rainy', 'heavy-rain', 'thunderstorm', 'sun-shower'].includes(state);
        if (!isRainy) {
            this.weatherRaindrops = [];
            // 已有水滴重力慢慢滑落排出视口之外，不再生成新水滴
            this.weatherGlassDrops = this.weatherGlassDrops.filter(drop => {
                if (Math.random() < 0.08) drop.isRolling = true;
                if (drop.isRolling) {
                    drop.y += (drop.r * 0.25 + 1.2);
                }
                return drop.y < h;
            });
            this._drawGlassDrops(w, h);
            return;
        }

        // 2. 动态调节不同降雨状态的物理参数极限
        let maxRain = 40;
        let rainSpeed = 15;
        let rainOpacity = 0.22;
        let dropSpawnChance = 0.03;

        if (state === 'sun-shower') {
            maxRain = 12;
            rainSpeed = 10;
            rainOpacity = 0.26;
            dropSpawnChance = 0.012;
        } else if (state === 'heavy-rain') {
            maxRain = 160;
            rainSpeed = 24;
            rainOpacity = 0.16;
            dropSpawnChance = 0.14;
        } else if (state === 'thunderstorm') {
            maxRain = 180;
            rainSpeed = 26;
            rainOpacity = 0.18;
            dropSpawnChance = 0.18;
        }

        // 3. 补充雨丝粒子 (Raindrops System)
        while (this.weatherRaindrops.length < maxRain) {
            this.weatherRaindrops.push({
                x: Math.random() * w,
                y: Math.random() * -h,
                len: Math.random() * 25 + 15,
                speed: Math.random() * 6 + rainSpeed,
                opacity: Math.random() * 0.15 + rainOpacity,
                angle: -0.15 // 斜下落角度 (弧度)
            });
        }

        // 渲染更新雨丝粒子
        this.weatherRaindrops.forEach(r => {
            r.y += r.speed;
            r.x += r.speed * Math.sin(r.angle);
            if (r.y > h) {
                r.y = Math.random() * -50;
                r.x = Math.random() * w;
            }
        });

        // 绘制斜飘雨丝粒子到后景 (玻璃板后，被虚化)
        this.weatherCtxBack.save();
        this.weatherCtxBack.lineWidth = state === 'heavy-rain' || state === 'thunderstorm' ? 1.5 : 0.8;
        this.weatherRaindrops.forEach(r => {
            this.weatherCtxBack.strokeStyle = state === 'sun-shower'
                ? `rgba(255, 230, 160, ${r.opacity})` // 太阳雨呈现金色闪耀雨丝
                : `rgba(174, 194, 224, ${r.opacity})`; // 普通雨丝
            this.weatherCtxBack.beginPath();
            this.weatherCtxBack.moveTo(r.x, r.y);
            this.weatherCtxBack.lineTo(r.x + r.len * Math.sin(r.angle), r.y + r.len);
            this.weatherCtxBack.stroke();
        });
        this.weatherCtxBack.restore();

        // 4. 玻璃表面水滴物理模拟引擎 (Glass Drops Physics)
        if (Math.random() < dropSpawnChance && this.weatherGlassDrops.length < 90) {
            this.weatherGlassDrops.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.random() * 3.8 + 1.2, // 水滴大小
                vy: 0,
                vx: 0,
                isRolling: false,
                trail: [] // 水珠下滑的蒸发水痕划痕轨道
            });
        }

        // 更新水滴物理
        this.weatherGlassDrops = this.weatherGlassDrops.filter(drop => {
            const rollThreshold = state === 'heavy-rain' || state === 'thunderstorm' ? 0.012 : 0.002;
            if (!drop.isRolling && Math.random() < rollThreshold) {
                if (drop.r > 3.2 || Math.random() < 0.12) {
                    drop.isRolling = true;
                }
            }

            if (drop.isRolling) {
                drop.vy = drop.r * 0.28 + 1.2; // 水滴越重，滑落速度越快 (重力学)
                drop.vx = Math.sin(drop.y * 0.05) * 0.38; // 随机阻力微扰晃动
                drop.y += drop.vy;
                drop.x += drop.vx;

                drop.trail.push({ x: drop.x, y: drop.y });
                if (drop.trail.length > 20) drop.trail.shift();

                // 下滑慢慢消耗水珠本身体积
                drop.r -= 0.012;

                if (drop.y > h || drop.r < 0.8) {
                    return false; // 超限销毁
                }
            }
            return true;
        });

        // 立体折射绘制水珠
        this._drawGlassDrops(w, h);
    }

    _drawGlassDrops(w, h) {
        if (!this.weatherCtx) return;

        this.weatherCtx.save();
        this.weatherGlassDrops.forEach(drop => {
            // 1. 绘制流体水珠下滑遗留的柔和水迹 (Trail)
            if (drop.trail.length > 1) {
                this.weatherCtx.beginPath();
                this.weatherCtx.strokeStyle = 'rgba(255, 255, 255, 0.055)';
                this.weatherCtx.lineWidth = drop.r * 1.4;
                this.weatherCtx.lineCap = 'round';
                this.weatherCtx.lineJoin = 'round';
                this.weatherCtx.moveTo(drop.trail[0].x, drop.trail[0].y);
                for (let i = 1; i < drop.trail.length; i++) {
                    this.weatherCtx.lineTo(drop.trail[i].x, drop.trail[i].y);
                }
                this.weatherCtx.stroke();
            }

            // 2. 绘制立体通透水珠主体 (立体折射画法)
            this.weatherCtx.shadowColor = 'rgba(0, 0, 0, 0.14)';
            this.weatherCtx.shadowBlur = 2;
            this.weatherCtx.shadowOffsetY = 1.0;

            this.weatherCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.weatherCtx.beginPath();
            this.weatherCtx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
            this.weatherCtx.fill();

            // 还原 Shadow
            this.weatherCtx.shadowColor = 'transparent';
            this.weatherCtx.shadowBlur = 0;
            this.weatherCtx.shadowOffsetY = 0;

            // 亮边折射下弧月亮弯
            this.weatherCtx.strokeStyle = 'rgba(255, 255, 255, 0.52)';
            this.weatherCtx.lineWidth = 0.8;
            this.weatherCtx.beginPath();
            this.weatherCtx.arc(drop.x, drop.y, drop.r, Math.PI * 0.15, Math.PI * 0.85);
            this.weatherCtx.stroke();

            // 逆侧右上反光高光焦点 (Skeuomorphic highlight)
            this.weatherCtx.fillStyle = 'rgba(255, 255, 255, 0.88)';
            this.weatherCtx.beginPath();
            this.weatherCtx.arc(drop.x - drop.r * 0.32, drop.y - drop.r * 0.32, drop.r * 0.18, 0, Math.PI * 2);
            this.weatherCtx.fill();
        });
        this.weatherCtx.restore();
    }

    async _fetchRealWeather() {
        if (this.weatherState !== 'auto') return;

        try {
            // 1. 无感拉取用户所在公网 IP 经纬度 (使用免费、免 Key 且国内速度很快的 HTTPS 定位 API)
            const geoRes = await fetch('https://ipapi.co/json/');
            if (!geoRes.ok) throw new Error("Geolocation request failed");
            const geoData = await geoRes.json();
            
            if (!geoData.latitude || !geoData.longitude) throw new Error("Latitude/longitude missing");

            const lat = geoData.latitude;
            const lon = geoData.longitude;
            const city = geoData.city || '未知城市';

            // 2. 调用开源、免授权限制、超高响应速率的国际 Open-Meteo 实时天气 API
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            if (!weatherRes.ok) throw new Error("Weather forecast API request failed");
            const weatherData = await weatherRes.json();

            if (!weatherData.current_weather) throw new Error("Weather payload empty");
            const code = weatherData.current_weather.weathercode;

            // 3. WMO 气象解读码映射到我们写好的 6 大高端物理动效上
            let parsedState = 'clear';
            if (code === 0) {
                parsedState = 'clear'; // 晴空
            } else if ([1, 2, 3, 45, 48].includes(code)) {
                parsedState = 'cloudy'; // 晴间多云/烟雨微阴
            } else if ([51, 53, 55, 61, 63, 65].includes(code)) {
                // 如果是白天小雨，为了唯美可以映射为“太阳金雨”
                const hour = new Date().getHours();
                if (hour >= 11 && hour <= 16 && Math.random() < 0.5) {
                    parsedState = 'sun-shower';
                } else {
                    parsedState = 'rainy'; // 普通小雨
                }
            } else if ([80, 81, 82].includes(code)) {
                parsedState = 'heavy-rain'; // 暴雨倾盆
            } else if ([95, 96, 99].includes(code)) {
                parsedState = 'thunderstorm'; // 电闪雷鸣
            } else {
                // 其余如雪天或阵雨归到多云/下雨
                parsedState = code > 70 ? 'cloudy' : 'rainy';
            }

            this.realWeatherState = parsedState;
            console.log(`[Sticky365 Weather] 成功捕获真实地理位置 (${city}) 实时天气: ${parsedState} (WMO Code: ${code})`);
            
            // 实时刷新滤镜
            this._updateWeatherVisuals();
        } catch (err) {
            console.warn("[Sticky365 Weather] 地理实时天气拉取失败，已平滑启用本地微气候随机物理模拟。原因:", err.message);
        }
    }

    _getEffectiveTimeAndWeather() {
        let time = this.weatherTime;
        if (time === 'auto') {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 7) time = 'sunrise';
            else if (hour >= 7 && hour < 11) time = 'morning';
            else if (hour >= 11 && hour < 16) time = 'noon';
            else if (hour >= 16 && hour < 19) time = 'sunset';
            else time = 'night';
        }
        
        let state = this.weatherState;
        if (state === 'auto') {
            if (this.realWeatherState) {
                // 优先采用真实获取到的实时气象！
                state = this.realWeatherState;
            } else {
                // 降级兜底：每3小时自动变幻一次气象，增加趣味性
                const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 3)) % 10;
                if (seed < 5) state = 'clear';
                else if (seed < 7) state = 'cloudy';
                else if (seed < 8) state = 'rainy';
                else if (seed < 9) state = 'thunderstorm';
                else state = 'sun-shower';
            }
        }
        
        return { time, state };
    }

    _updateWeatherVisuals() {
        const { time, state } = this._getEffectiveTimeAndWeather();
        const bgImg = document.getElementById('custom-bg-image');
        if (!bgImg) return;
        
        // 1. 基准时间段滤镜配置
        let baseBrightness = 1.0;
        let baseContrast = 1.0;
        let baseSaturate = 1.0;
        let tintOverlay = ''; 
        
        switch (time) {
            case 'sunrise':
                baseBrightness = 0.96;
                baseContrast = 1.02;
                baseSaturate = 1.15;
                tintOverlay = 'sepia(0.18) hue-rotate(-12deg)'; // 玫瑰红霞
                break;
            case 'morning':
                baseBrightness = 1.06; // 晨光微亮提亮
                baseContrast = 0.98;
                baseSaturate = 1.02;
                break;
            case 'noon':
                baseBrightness = 1.15; // 正午强烈曝光
                baseContrast = 1.05;
                baseSaturate = 1.08;
                break;
            case 'sunset':
                baseBrightness = 0.86;
                baseContrast = 1.08;
                baseSaturate = 1.32;
                tintOverlay = 'sepia(0.25) hue-rotate(-28deg)'; // 夕阳余晖
                break;
            case 'night':
                baseBrightness = 0.38; // 夜深暗淡
                baseContrast = 0.88;
                baseSaturate = 0.72;
                tintOverlay = 'hue-rotate(22deg) saturate(1.1)'; // 幽冷深蓝
                break;
        }
        
        // 2. 气象滤镜修正
        let weatherBrightness = 1.0;
        let weatherContrast = 1.0;
        let weatherSaturate = 1.0;
        
        switch (state) {
            case 'clear':
                weatherBrightness = 1.0;
                break;
            case 'cloudy':
                weatherBrightness = 0.86; // 阴天暗淡
                weatherContrast = 0.92;
                weatherSaturate = 0.82;
                break;
            case 'rainy':
                weatherBrightness = 0.80; // 普通雨清冷
                weatherContrast = 0.88;
                weatherSaturate = 0.78;
                break;
            case 'heavy-rain':
                weatherBrightness = 0.68; // 暴雨幽暗
                weatherContrast = 0.84;
                weatherSaturate = 0.68;
                break;
            case 'thunderstorm':
                weatherBrightness = 0.60; // 雷雨最暗，衬托雷电强闪
                weatherContrast = 0.90;
                weatherSaturate = 0.60;
                break;
            case 'sun-shower':
                weatherBrightness = 1.02; // 太阳雨依然明澈
                weatherContrast = 1.02;
                weatherSaturate = 1.05;
                break;
        }
        
        const finalBright = baseBrightness * weatherBrightness;
        const finalContrast = baseContrast * weatherContrast;
        const finalSat = baseSaturate * weatherSaturate;
        
        bgImg.style.filter = `
            brightness(${finalBright}) 
            contrast(${finalContrast}) 
            saturate(${finalSat}) 
            ${tintOverlay}
        `.trim().replace(/\s+/g, ' ');
        
        // 3. 处理雷阵雨的随机闪电时钟
        if (this.thunderTimer) {
            clearInterval(this.thunderTimer);
            this.thunderTimer = null;
        }
        
        if (state === 'thunderstorm') {
            this.thunderTimer = setInterval(() => {
                if (Math.random() < 0.35) {
                    this._triggerLightning();
                }
            }, 4500);
        }

        // 4. 根据最终合成物理亮度，智能切换亮暗类，实现左上角字色百分之百自适应突出！
        if (finalBright >= 0.76) {
            document.body.classList.remove('bg-dark');
            document.body.classList.add('bg-light');
        } else {
            document.body.classList.remove('bg-light');
            document.body.classList.add('bg-dark');
        }

        // 5. 联动刷新天气与环境白噪音音效
        this._updateWeatherSounds();
    }

    _updateWeatherSounds() {
        if (!this.sound.enabled || !this.sound.weatherSoundEnabled) {
            this.sound.stopRain();
            return;
        }
        
        const { state } = this._getEffectiveTimeAndWeather();
        if (state === 'rainy' || state === 'sun-shower') {
            this.sound.startRain('light');
        } else if (state === 'heavy-rain' || state === 'thunderstorm') {
            this.sound.startRain('heavy');
        } else {
            this.sound.stopRain();
        }
    }

    _checkAndPlayAmbientSounds() {
        if (!this.sound.enabled || !this.sound.weatherSoundEnabled) return;
        const { time, state } = this._getEffectiveTimeAndWeather();
        
        // 早晨或日出：鸟鸣 (有20%概率触发，且必须是晴天/阴天/太阳雨等温和光线天气)
        const isLightWeather = ['clear', 'cloudy', 'sun-shower'].includes(state);
        if ((time === 'sunrise' || time === 'morning') && isLightWeather) {
            if (Math.random() < 0.20) {
                this.sound.playBirdChirp();
            }
        }
        
        // 傍晚日落：乌鸦叫 (有18%概率触发，且不能是暴风雨/雷雨天气)
        const isNotStormy = ['clear', 'cloudy', 'rainy', 'sun-shower'].includes(state);
        if (time === 'sunset' && isNotStormy) {
            if (Math.random() < 0.18) {
                this.sound.playCrowCaw();
            }
        }
    }

    _triggerLightning() {
        const flash = document.getElementById('weather-lightning-flash');
        if (!flash) return;
        
        // 拟物双闪电物理效果
        flash.style.backgroundColor = 'rgba(255, 255, 255, 0.72)';
        setTimeout(() => {
            flash.style.backgroundColor = 'rgba(255, 255, 255, 0)';
            setTimeout(() => {
                flash.style.backgroundColor = 'rgba(255, 255, 255, 0.84)';
                
                // 开启雷鸣合成音 (复用全局解锁的主 AudioContext 播放闷雷)
                if (this.sound.enabled && this.sound.weatherSoundEnabled) {
                    this.sound.playThunder();
                }
                
                setTimeout(() => {
                    flash.style.backgroundColor = 'rgba(255, 255, 255, 0)';
                }, 160);
            }, 70);
        }, 60);
    }

    // ━━ 提醒通知与中转 API 系统 ━━━━━━━━━━━━━━━━━━━━━━━━━
    _updateNotifyUI() {
        if (this.notifyToggleBtn) {
            const text = this.notifyToggleBtn.querySelector('.notify-text');
            const icon = this.notifyToggleBtn.querySelector('.notify-icon');
            
            if (this.notifyMode === 'default') {
                if (text) text.textContent = this._t('notifyModeDefault');
                if (icon) icon.textContent = '🌓';
            } else if (this.notifyMode === 'web') {
                if (text) text.textContent = this._t('notifyModeWeb');
                if (icon) icon.textContent = '💻';
            } else if (this.notifyMode === 'discord') {
                if (text) text.textContent = this._t('notifyModeDiscord');
                if (icon) icon.textContent = '👾';
            }
            this.notifyToggleBtn.classList.add('snap-active');
        }
        if (this.discordInput) {
            this.discordInput.value = this.discordUserId || '';
        }
    }

    _toggleNotify() {
        const modes = ['default', 'web', 'discord'];
        let idx = modes.indexOf(this.notifyMode);
        idx = (idx + 1) % modes.length;
        this.notifyMode = modes[idx];
        
        this._updateNotifyUI();
        this._savePrefs();
        this.sound.playInk();
        
        let toastMsg = '';
        if (this.notifyMode === 'default') toastMsg = '🌓 通知模式: 双渠道 (在线Web/离线Discord)';
        else if (this.notifyMode === 'web') toastMsg = '💻 通知模式: 仅本地浏览器弹窗';
        else if (this.notifyMode === 'discord') toastMsg = '👾 通知模式: 仅 Discord Bot 私信';
        
        this._showToast(toastMsg);
        this._syncTasksWithBackend(); // 即刻同步模式偏好
    }

    _requestPushPermission() {
        if (!('Notification' in window)) {
            this._showToast('⚠️ 浏览器不支持系统通知');
            return;
        }
        
        const handlePermission = (permission) => {
            if (permission === 'granted') {
                this._showToast('🎉 系统通知授权成功！');
                const title = 'StickyFlow · 流笺';
                const options = {
                    body: '流笺提醒通知通道已开启',
                    icon: 'logo.png'
                };
                this._sendSystemNotification(title, options);
            } else {
                this._showToast('⚠️ 授权被拒绝，无法接收提醒');
            }
        };

        try {
            // 现代浏览器支持返回 Promise 形式
            Notification.requestPermission().then(handlePermission);
        } catch (e) {
            // iOS Safari 或是旧版设备需要使用传统的 Callback 形式
            Notification.requestPermission(handlePermission);
        }
    }

    _sendSystemNotification(title, options) {
        // 1. 判断是否是 iOS 设备 (iOS Safari 必须要用 Service Worker 配合 PWA 才能拉起通知)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, options)
                    .catch(err => {
                        console.warn("[iOS Notification] Service Worker failed:", err);
                        try { new Notification(title, options); } catch (e) {}
                    });
            }).catch(err => {
                console.warn("[iOS Notification] Service Worker not ready:", err);
                try { new Notification(title, options); } catch (e) {}
            });
        } else {
            // 2. 非 iOS 设备 (例如 Windows, macOS 电脑) 直接采用标准 HTML5 Web Notification 弹出，零延迟响应，不依赖 SW 状态
            try {
                new Notification(title, options);
            } catch (err) {
                console.warn("[Desktop Notification] Standard new Notification failed, trying Service Worker fallback:", err);
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification(title, options).catch(() => {});
                    }).catch(() => {});
                }
            }
        }
    }

    _onDiscordInput(e) {
        this.discordUserId = e.target.value.trim();
        this._savePrefs();
        this._showToast(this.discordUserId ? '🔗 Discord ID 绑定成功' : '🔓 Discord ID 已取消绑定');
        this._syncTasksWithBackend();
    }

    // 点击留空态底座：抽纸或重置配额
    _onPadClick() {
        if (this.locked) return;

        if (this.currentIndex <= 365) {
            // ─── 抽纸动作 ───
            this._lock();
            this.sound.playInk(); // 播放落笔沙沙抽纸声

            // 还原活动便签显示
            this.activeSheet.style.display = '';
            this.activeSheet.style.opacity = '1';
            this.activeSheet.style.pointerEvents = 'none'; // 👈 弹出期间禁用交互，防止穿透误触
            this._spawnNew();
            
            // 抽纸微回弹物理效果
            this.activeSheet.style.transition = 'none';
            this.activeSheet.style.animation  = `padEntrance 500ms ${SPRING} forwards`;
            
            setTimeout(() => {
                this.activeSheet.style.animation = '';
                this.activeSheet.style.transition = '';
                this.activeSheet.style.pointerEvents = 'auto'; // 👈 稳定后重新解禁交互！
                this._unlock();
            }, 520);
        } else {
            // ─── 消耗殆尽，重置配额 ───
            this._lock();
            this.sound.playBell(); // 播放清脆的重置风铃声

            // 彻底抹平计数与历史便签，完全开启新的一轮 365 记录
            localStorage.setItem(NOTES_KEY, JSON.stringify([]));
            this.currentIndex = 1;
            this._savePrefs();

            // 👈 完美时序修复一：在第 0 毫秒立刻同步更新底座叠纸与投影状态，让 21 张纸与阴影瞬间重现
            this._updateCounter();

            // 专属堆叠物理回弹动画 (由中心 3D 弹性拉伸弹出)
            this.pad.classList.add('pad-bounce-reset');
            this.activeSheet.style.display = '';
            this.activeSheet.style.opacity = '1';
            this.activeSheet.style.pointerEvents = 'none'; // 👈 弹出期间禁用交互，防止穿透误触
            this._spawnNew();

            // 触发 AI 重置成功温馨提示
            this._showAIToast('quota_reset');

            // 👈 完美时序修复二：在动画执行完毕后移除弹出 class
            setTimeout(() => {
                this.pad.classList.remove('pad-bounce-reset');
            }, 850);

            // 👈 完美时序修复三：额外多延时 140ms (共 990ms) 异步激活交互与解锁，彻底躲开手指长按与慢速连点的残余指针穿透！
            setTimeout(() => {
                this.isDragging = false; // 强行重置可能残留的拖拽判定状态
                this.activeSheet.style.pointerEvents = 'auto'; // 彻底稳定后激活交互
                this._unlock();
            }, 990);
        }
    }

    _analyzeTaskAndSave(note) {
        // 先获取 localStorage 中原有的旧便签数据（必须在 _saveNote 覆盖前获取！）
        const oldNote = this._getNote(note.id);

        // 先保存到本地 notes 缓存中（防网络延迟）
        this._saveNote(note);

        if (!note.textData || !note.textData.trim()) {
            note.isTask = false;
            this._saveNote(note);
            this._renderBoard();
            return;
        }

        // 检查此 note 是否已经在 localStorage 中存在过，且曾经被识别为 task
        // 如果之前已经是 task，则直接重用它，跳过 AI API 请求，并且完全保留原来的 notifySent 状态，避免重复通知！
        if (oldNote && oldNote.isTask) {
            note.isTask = oldNote.isTask;
            note.event = oldNote.event;
            note.targetTimestamp = oldNote.targetTimestamp;
            note.notifySent = oldNote.notifySent; // 保留原有的通知状态，防止重复发送
            
            this._saveNote(note);
            this._renderBoard();
            this._syncTasksWithBackend();
            return;
        }

        const clientNow = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const formattedRefTime = `${pad(clientNow.getDate())}/${pad(clientNow.getMonth() + 1)}/${clientNow.getFullYear()} : ${pad(clientNow.getHours())}:${pad(clientNow.getMinutes())}:${pad(clientNow.getSeconds())}`;
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kuala_Lumpur';

        // 调用中转后端 API 进行 AI 任务分析
        fetch('/api/analyze-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                text: note.textData,
                clientTime: formattedRefTime,
                clientTimestamp: Date.now(),
                timezone: userTimezone
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Backend response error");
            return res.json();
        })
        .then(data => {
            if (data && typeof data.isTask === 'boolean') {
                note.isTask = data.isTask;
                note.event = data.event || '';
                note.targetTimestamp = data.targetTimestamp || null;
                note.aiAlertText = data.aiAlertText || null;
                note.notifySent = false;
                
                if (note.isTask && note.targetTimestamp) {
                    this._showToast(`⏰ 提醒设定：${note.event}`);
                }
            } else {
                note.isTask = false;
            }
            this._saveNote(note);
            this._renderBoard();
            this._syncTasksWithBackend();
        })
        .catch(err => {
            console.warn("[AI Engine] 解析失败，降级为普通卡片:", err.message);
            note.isTask = false;
            this._saveNote(note);
            this._renderBoard();

            if (!navigator.onLine || err.message.includes('Failed to fetch') || err.message.includes('network') || err instanceof TypeError) {
                this._showAIToast('network_error');
            } else {
                this._showAIToast('ai_busy');
            }
        });
    }

    _syncTasksWithBackend() {
        if (!this.discordUserId) return;

        const unfulfilledTasks = this._allNotes()
            .filter(n => n.isTask && !n.notifySent && n.targetTimestamp)
            .map(n => ({
                id: n.id,
                event: n.event,
                targetTimestamp: n.targetTimestamp,
                aiAlertText: n.aiAlertText // 同步预存的治愈推送文案，避免后端离线提醒时重复调用 AI
            }));

        fetch('/api/sync-tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                discordUserId: this.discordUserId,
                notifyMode:    this.notifyMode, // 向后端同步当前模式
                tasks:         unfulfilledTasks
            })
        })
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(data => {
            if (data && data.notifiedTaskIds && data.notifiedTaskIds.length > 0) {
                this._markTasksAsNotifiedLocally(data.notifiedTaskIds);
            }
        })
        .catch(err => console.warn("Failed to sync tasks:", err.message));
    }

    _startNotifyTimers() {
        // 1. 每 30 秒心跳包
        this._sendHeartbeat();
        setInterval(() => this._sendHeartbeat(), 30000);

        // 2. 每 1 秒在线通知扫描检查，保障毫秒级精准秒发对齐
        setInterval(() => this._checkActiveReminders(), 1000);
    }

    _sendHeartbeat() {
        if (!this.discordUserId) return;
        fetch('/api/heartbeat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                discordUserId: this.discordUserId,
                notifyMode:    this.notifyMode // 发送心跳时同步当前模式
            })
        })
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(data => {
            if (data && data.notifiedTaskIds && data.notifiedTaskIds.length > 0) {
                this._markTasksAsNotifiedLocally(data.notifiedTaskIds);
            }
        })
        .catch(() => {});
    }

    _markTasksAsNotifiedLocally(ids) {
        let changed = false;
        const notes = this._allNotes();
        notes.forEach(note => {
            if (ids.includes(note.id) && !note.notifySent) {
                note.notifySent = true;
                changed = true;
                console.log(`[Sync Confirmation] Task "${note.event || note.id}" marked as notified locally.`);
            }
        });
        if (changed) {
            localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
            this._renderBoard();
        }
    }

    _checkActiveReminders() {
        // 核心：若为仅 'discord' 模式，本地浏览器静默，全部交由后端 Discord Bot 推送并确认
        if (this.notifyMode === 'discord') return;

        const now = Date.now();
        let changed = false;

        const notes = this._allNotes();
        notes.forEach(note => {
            if (note.isTask && !note.notifySent && note.targetTimestamp && now >= note.targetTimestamp) {
                note.notifySent = true;
                changed = true;

                // 只有在非仅 Discord 模式下，才触发本地的声音和弹窗提示
                if (this.notifyMode !== 'discord') {
                    // 播放本地提醒墨音 (100% 播放)
                    this.sound.playInk();
                    console.log(`[Online Alert] Local alert triggered: "${note.event}"`);

                    const fallbackBody = `记得 ${note.event} 哦😊`;
                    const bodyText = note.aiAlertText || fallbackBody;
                    
                    // 1. 如果支持且授权了系统通知，优先使用 Website Notification (操作系统级桌面弹窗，优先调用 Service Worker 以确保完全兼容 iOS Safari 和 Windows)
                    if ('Notification' in window && Notification.permission === 'granted') {
                        const title = '⏰ StickyFlow 提醒';
                        const options = {
                            body: bodyText,
                            icon: 'logo.png',
                            badge: 'logo.png'
                        };
                        this._sendSystemNotification(title, options);
                    } else {
                        // 2. 兜底方案：如果未授权或不支持，仍弹出网页内 UI Toast 提示，并智能引导用户开启权限
                        this._showToast(`⏰ 提醒：${bodyText}`);
                        if ('Notification' in window && Notification.permission === 'default') {
                            this._showToast(`💡 提示：推荐点击右侧“授权浏览器通知”以启用系统级桌面弹窗`);
                        }
                    }

                    // 如果本地没有缓存的 AI 提醒文案（以防万一），在后台异步获取一次，用来保底或记录缓存
                    if (!note.aiAlertText) {
                        fetch('/api/generate-notify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ scene: 'web_alert', event: note.event })
                        })
                        .then(res => {
                            if (res.ok) return res.json();
                        })
                        .then(data => {
                            if (data && data.text) {
                                // 异步更新缓存，下次使用
                                note.aiAlertText = data.text;
                                const currentNotes = this._allNotes();
                                const target = currentNotes.find(n => n.id === note.id);
                                if (target) {
                                    target.aiAlertText = data.text;
                                    localStorage.setItem(NOTES_KEY, JSON.stringify(currentNotes));
                                }
                            }
                        })
                        .catch(() => {});
                    }
                }

                // 3. 【极客 Serverless 协同关键】如果开启了 default 双渠道，且绑定了 Discord ID，直接由客户端实时向后端发送代发请求，绕过云端后台定时器挂起限制！
                if ((this.notifyMode === 'default' || this.notifyMode === 'discord') && this.discordUserId) {
                    const fallbackBody = `记得 ${note.event} 哦😊`;
                    const bodyText = note.aiAlertText || fallbackBody;

                    fetch('/api/send-discord-alert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            discordUserId: this.discordUserId, 
                            event: note.event,
                            taskId: note.id,
                            message: bodyText // 将本地已缓存（或优雅兜底）的文案直接传给后端，实现免 API 查询秒发！
                        })
                    })
                    .then(res => {
                        if (res.ok) console.log(`[Online Alert] Co-dispatched Discord DM successfully for: ${note.event}`);
                        else console.warn(`[Online Alert] Co-dispatch returned error status: ${res.status}`);
                    })
                    .catch(err => console.warn("[Online Alert] Failed to co-dispatch Discord DM:", err.message));
                }
            }
        });

        if (changed) {
            localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
            this._renderBoard();
            this._syncTasksWithBackend();
        }
    }

    _genId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    // ── 全新 3D 陀螺仪极清果冻低通平滑视差引擎 ──
    _startOrientationLoop() {
        const loop = () => {
            // 仅在非编辑、非拖拽、贴板关闭状态下，才开启视差，防止任何定位抖动与穿模
            if (this.state !== 'editing' && !this.isDragging && !this.boardOpen) {
                // 0.06 是物理极清果冻惯性系数，使得便签纸如液态悬浮般平滑
                this.tiltX += (this.targetTiltX - this.tiltX) * 0.06;
                this.tiltY += (this.targetTiltY - this.tiltY) * 0.06;
                this.shadowDx += (this.targetShadowDx - this.shadowDx) * 0.06;
                this.shadowDy += (this.targetShadowDy - this.shadowDy) * 0.06;

                this.pad.style.setProperty('--pad-tilt-x', `${this.tiltX.toFixed(2)}deg`);
                this.pad.style.setProperty('--pad-tilt-y', `${this.tiltY.toFixed(2)}deg`);
                this.pad.style.setProperty('--shadow-dx', `${this.shadowDx.toFixed(1)}px`);
                this.pad.style.setProperty('--shadow-dy', `${this.shadowDy.toFixed(1)}px`);
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    _initOrientationListener() {
        if (this.isSensorListening) return;
        this.isSensorListening = true;

        // 启动低通 Lerp 回路
        this._startOrientationLoop();

        window.addEventListener('deviceorientation', e => {
            if (this.state === 'editing' || this.isDragging || this.boardOpen) return;
            if (e.gamma === null || e.beta === null) return;

            // 移动端重力感应视差 (以 48 度为手机手持舒适阅读倾角基准进行差值运算，大幅调高灵敏度与振幅，肉眼可见wow视差)
            const x = Math.min(Math.max(e.gamma / 18, -2.5), 2.5);
            const y = Math.min(Math.max((e.beta - 48) / 18, -2.5), 2.5);

            // 更新目标位置，由 Lerp 回路顺滑渲染，投影位移放大至 20px，倾斜放大至 15deg
            this.targetShadowDx = -x * 20;
            this.targetShadowDy = -y * 20 + 4;
            this.targetTiltX = -y * 15;
            this.targetTiltY = x * 15;
        });
    }
}

// ── Bootstrap ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    window.stickyApp = new StickyApp();
});

})();
