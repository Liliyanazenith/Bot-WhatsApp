/**
 * Fitur: .download <link_tiktok>
 * Download video TikTok tanpa watermark pakai API publik tikwm.com
 *
 * Butuh dependency: npm install axios
 */

const axios = require('axios');

const TIKWM_API = 'https://www.tikwm.com/api/';

/**
 * Ambil data video TikTok dari tikwm.com
 * @param {string} tiktokUrl - Link video TikTok
 * @returns {Promise<object>} judul, author, durasi, url tanpa watermark, dll
 */
async function fetchTiktokVideo(tiktokUrl) {
    if (!tiktokUrl || !tiktokUrl.includes('tiktok.com')) {
        throw new Error('Link TikTok tidak valid.');
    }

    const { data } = await axios.get(TIKWM_API, {
        params: { url: tiktokUrl, hd: 1 },
        timeout: 15000
    });

    if (!data || data.code !== 0 || !data.data) {
        throw new Error(data?.msg || 'Gagal ambil data dari tikwm.com');
    }

    const d = data.data;
    return {
        title: d.title || '-',
        author: d.author?.nickname || d.author?.unique_id || '-',
        duration: d.duration || 0,
        noWatermarkUrl: d.hdplay || d.play,
        watermarkUrl: d.wmplay,
        musicUrl: d.music,
        cover: d.cover
    };
}

/**
 * Handler command .download, tinggal dipasang di messages.upsert
 */
async function handleDownloadCommand(sock, msg, text) {
    const sender = msg.key.remoteJid;
    const args = text.trim().split(' ');

    if (args.length < 2) {
        return sock.sendMessage(sender, { text: '❌ Format: .download <link_tiktok>' }, { quoted: msg });
    }

    const link = args[1];

    try {
        await sock.sendMessage(sender, { text: '⏳ Tunggu bentar, lagi diproses...' }, { quoted: msg });

        const video = await fetchTiktokVideo(link);

        await sock.sendMessage(sender, {
            video: { url: video.noWatermarkUrl },
            caption:
                `🎬 *${video.title}*\n` +
                `👤 ${video.author}\n` +
                `⏱️ ${video.duration}s\n\n` +
                `_Tanpa watermark • via tikwm.com_`
        }, { quoted: msg });

    } catch (err) {
        await sock.sendMessage(sender, { text: `❌ Gagal download: ${err.message}` }, { quoted: msg });
    }
}

// Cara pasang di messages.upsert:
// if (text.startsWith('.download ')) await handleDownloadCommand(sock, msg, text);

module.exports = { fetchTiktokVideo, handleDownloadCommand };
