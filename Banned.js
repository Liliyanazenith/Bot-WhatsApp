sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedMessage?.text || '';

    if (text.startsWith('.banned')) {
        const args = text.split(' ');
        if (args.length < 3) {
            return sock.sendMessage(sender, { text: '❌ Format: .banned 628xxx 250' });
        }

        const target = args[1];
        const amount = parseInt(args[2]) || 250; // Default 250 kalau kosong

        if (amount > 250) {
            return sock.sendMessage(sender, { text: '⚠️ Maksimal 250 report per hari biar akun bot aman!' });
        }

        await sock.sendMessage(sender, { text: `🚀 *MULAI BOMBARDIR*\nTarget: ${target}\nJumlah: ${amount}\n\nProses ini akan memakan waktu ~15 menit karena ada sistem anti-banned.` });

        try {
            const result = await banWhatsAppMassal(sock, target, amount, console.log);
            await sock.sendMessage(sender, { 
                text: `✅ *MASS REPORT SELESAI*\n\nTarget: ${result.target}\nBerhasil: ${result.success}\nGagal: ${result.fail}\n\nNote: Kalau target belum banned, berarti butuh laporan dari akun lain.` 
            });
        } catch (error) {
            await sock.sendMessage(sender, { text: `❌ Error sistem: ${error.message}` });
        }
    }
});
