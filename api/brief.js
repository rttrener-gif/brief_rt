export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram not configured' });
  }

  try {
    const { goal, users, confidentiality, product_type, strategic, scale, contact, name, title, description, deadline, analogs } = req.body;

    const text = [
      '📋 *Новая заявка на ИИ-инициативу*',
      '',
      `👤 *Заказчик:* ${name || 'Не указано'}`,
      `📞 *Контакт:* ${contact || 'Не указано'}`,
      `📦 *Тип продукта:* ${product_type || 'Не указано'}`,
      '',
      '── Бриф ──',
      `📌 *Название:* ${title || 'Не указано'}`,
      `💡 *Суть продукта:*\n${description || 'Не заполнено'}`,
      `🎯 *Цель и ожидаемый эффект:*\n${goal || 'Не заполнено'}`,
      `⏰ *Сроки:* ${deadline || 'Не указано'}`,
      `👥 *Охват пользователей:* ${users || 'Не указано'}`,
      `🔒 *Конфиденциальность:* ${confidentiality || 'Не указано'}`,
      analogs ? `🔗 *Аналоги:* ${analogs}` : '',
      '',
      '── Экспресс-оценка ──',
      `🎯 Стратегическая ценность: ${strategic || '—'}`,
      `📈 Масштабируемость: ${scale || '—'}`,
      `👥 Охват: ${users || '—'}`,
    ].filter(Boolean).join('\n');

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Telegram error:', tgData);
      return res.status(500).json({ error: 'Failed to send to Telegram' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Brief handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
