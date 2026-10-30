/*
 * Сборка презентации к защите: node tools/build-presentation.js
 * Кадры берутся из screens/kursovaya/. Если кадра ещё нет, на слайде остаётся рамка с именем файла —
 * положите снимок с этим именем и пересоберите, либо вставьте его в PowerPoint вручную.
 * PDF: откройте zashchita.pptx → Файл → Экспорт → PDF → presentation/zashchita.pdf
 */
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const K = (f) => path.join(ROOT, 'screens', 'kursovaya', f);

const INK = '141414', BRASS = 'B8862B', BRASS_INK = '7A5617', LINEN = 'EDE6DA', PAPER = 'F7F3EC', STONE = '5E574E', MIST = 'B9B1A5';
const HEAD = 'Arial', BODY = 'Arial';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 × 7.5
pres.title = 'Фейд Клаб — защита курсовой ТЗ-09/2026';
pres.author = 'ОП.03 «Информационные технологии»';

pres.defineSlideMaster({
  title: 'LIGHT',
  background: { color: PAPER },
  objects: [{ text: { text: 'ФЕЙД КЛАБ · ТЗ-09/2026', options: { x: 0.6, y: 7.0, w: 6, h: 0.3, fontFace: BODY, fontSize: 11, color: STONE, margin: 0 } } }],
  slideNumber: { x: 12.3, y: 7.0, w: 0.5, h: 0.3, fontFace: BODY, fontSize: 11, color: STONE, align: 'right' },
});
pres.defineSlideMaster({ title: 'DARK', background: { color: INK } });

function title(s, text, dark) {
  s.addText(text, { x: 0.6, y: 0.4, w: 12.1, h: 0.9, fontFace: HEAD, fontSize: 30, bold: true, color: dark ? LINEN : INK, margin: 0, isTextBox: true, valign: 'top' });
}
function sub(s, text, opts = {}) {
  s.addText(text, Object.assign({ x: 0.6, y: 1.3, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 20, color: STONE, margin: 0, isTextBox: true }, opts));
}
// Кадр: картинка, вписанная в рамку с сохранением пропорций; если файла нет — рамка с подсказкой
function frame(s, file, x, y, w, h, hint) {
  const p = K(file);
  if (fs.existsSync(p)) {
    const { imageSize } = require('./img-size');
    const sz = imageSize(p);
    let iw = w, ih = (w * sz.h) / sz.w;
    if (ih > h) { ih = h; iw = (h * sz.w) / sz.h; }
    s.addImage({ path: p, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, altText: hint });
  } else {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: 'FFFFFF' }, line: { color: BRASS, width: 2, dashType: 'dash' } });
    s.addText([{ text: hint, options: { bold: true, breakLine: true } }, { text: 'кадр: screens/kursovaya/' + file }],
      { x: x + 0.3, y, w: w - 0.6, h, fontFace: BODY, fontSize: 20, color: STONE, align: 'center', valign: 'middle', isTextBox: true });
  }
}

/* 1. Титул */
let s = pres.addSlide({ masterName: 'DARK' });
s.addText('ФЕЙД КЛАБ', { x: 0.6, y: 0.6, w: 6, h: 0.6, fontFace: HEAD, fontSize: 24, bold: true, color: BRASS, charSpacing: 6, margin: 0, isTextBox: true });
s.addText('Сайт барбершопа, сквозная аналитика и онлайн-запись из соцсетей', { x: 0.6, y: 2.0, w: 8.2, h: 2.2, fontFace: HEAD, fontSize: 40, bold: true, color: LINEN, margin: 0, isTextBox: true, valign: 'top' });
s.addText('Курсовая работа по ОП.03 «Информационные технологии» · ТЗ-09/2026', { x: 0.6, y: 4.5, w: 8.2, h: 0.5, fontFace: BODY, fontSize: 20, color: MIST, margin: 0, isTextBox: true });
s.addText('GA4 · UTM · Apps Script · ManyChat · DataLens · Vercel', { x: 0.6, y: 6.4, w: 8.2, h: 0.4, fontFace: BODY, fontSize: 20, color: BRASS, margin: 0, isTextBox: true });
s.addImage({ path: path.join(__dirname, 'hero.png'), x: 9.3, y: 0.6, w: 3.4, h: 4.25, altText: 'Иллюстрация мастера' });
s.addNotes('Здравствуйте. Моя курсовая — проект по ТЗ барбершопа «Фейд Клаб»: сайт с записью на время, аналитика GA4, UTM-разметка соцсетей, автоответы в Instagram, учёт записей в таблице и дашборд DataLens.');

/* 2. Проблема */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Половина обращений из соцсетей терялась');
sub(s, 'Из письма директора: сентябрь 2026');
const stats = [['280', 'обращений в соцсетях'], ['132', 'записались — 47\u00a0%'], ['2–3 ч', 'ждут ответа вечером'], ['20\u00a0000\u00a0₽', 'в месяц блогерам без учёта']];
stats.forEach((st, i) => {
  const x = 0.6 + i * 3.1;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.4, w: 2.8, h: 2.6, rectRadius: 0.1, fill: { color: i === 1 ? INK : 'FFFFFF' }, line: { color: i === 1 ? INK : LINEN, width: 1 } });
  s.addText(st[0], { x: x + 0.25, y: 2.7, w: 2.4, h: 1.1, fontFace: HEAD, fontSize: 40, bold: true, color: i === 1 ? BRASS : INK, margin: 0, isTextBox: true });
  s.addText(st[1], { x: x + 0.25, y: 3.9, w: 2.4, h: 0.9, fontFace: BODY, fontSize: 20, color: i === 1 ? LINEN : STONE, margin: 0, isTextBox: true, valign: 'top' });
});
s.addText('Администратор вручную сверял время мастеров, пока клиент уходил в другой барбершоп. Какие видео блогеров приводят клиентов — никто не знал.',
  { x: 0.6, y: 5.4, w: 12.1, h: 1.0, fontFace: BODY, fontSize: 20, color: INK, margin: 0, isTextBox: true });

/* 3. Схема */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Схема работы: от публикации до дашборда');
s.addImage({ path: path.join(ROOT, 'docs', 'scheme.png'), x: 0.9, y: 1.35, w: 11.5, h: 5.47, altText: 'Схема работы' });
s.addNotes('Ссылка с UTM-метками или кнопка из автоответа ведёт на сайт. Сайт отправляет события в GA4, а заявку — через Apps Script в Google Таблицу. Таблица и выгрузка GA4 собираются в дашборд DataLens.');

/* 4. Сайт */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Сайт из 8 страниц: нейросеть + ручные правки');
frame(s, '01-site-home.png', 0.6, 1.4, 8.3, 5.2, 'Главная страница на Vercel');
s.addText([
  { text: 'Статический HTML, CSS, JS', options: { bullet: true, breakLine: true } },
  { text: 'Адаптив 375 / 768 / 1280 px', options: { bullet: true, breakLine: true } },
  { text: 'Фирменные цвета и шрифты', options: { bullet: true, breakLine: true } },
  { text: 'Журнал запросов — docs/prompts.md', options: { bullet: true } },
], { x: 9.2, y: 1.6, w: 3.6, h: 4.0, fontFace: BODY, fontSize: 20, color: INK, paraSpaceAfter: 12, isTextBox: true, valign: 'top' });

/* 5. Запись на время */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Клиент сам выбирает время — без переписки');
frame(s, '04-booking-form.png', 0.6, 1.4, 8.3, 5.2, 'Календарь на 14 дней и форма записи');
s.addText('Занятые слоты неактивны, ошибки в полях подсвечиваются, заявка уходит без перезагрузки страницы.',
  { x: 9.2, y: 1.6, w: 3.6, h: 3.0, fontFace: BODY, fontSize: 20, color: INK, isTextBox: true, valign: 'top', margin: 0 });

/* 6. Таблица */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Каждая запись — в таблице с источником и статусом');
frame(s, '08-lead-in-sheet.png', 0.6, 1.4, 12.1, 4.3, 'Строка заявки в листе leads');
s.addText('new → confirmed → reminded → visited  ·  no_show', { x: 0.6, y: 6.0, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 22, bold: true, color: BRASS_INK, margin: 0, isTextBox: true });

/* 7. Instagram */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Комментарий под Reel → ответ в Direct за секунды');
frame(s, '10-instagram-direct.png', 0.6, 1.4, 5.2, 5.2, 'Сообщение ManyChat с кнопкой');
s.addText([
  { text: '«СТРИЖКА» → тест «Форма лица» и промокод FIRST20', options: { bullet: true, breakLine: true } },
  { text: '«ПОДАРОК» → сертификаты на 2 000, 3 000, 5 000 ₽', options: { bullet: true, breakLine: true } },
  { text: 'Кнопка ведёт по ссылкам U-02 и U-03 с UTM', options: { bullet: true } },
], { x: 6.2, y: 1.6, w: 6.5, h: 4.0, fontFace: BODY, fontSize: 20, color: INK, paraSpaceAfter: 14, isTextBox: true, valign: 'top' });

/* 8. UTM */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, '12 ссылок с UTM: каждый канал считается отдельно');
frame(s, '09-utm-registry.png', 0.6, 1.4, 12.1, 4.9, 'Реестр ссылок docs/utm.csv');

/* 9. GA4 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, '20 событий GA4 — каждый шаг посетителя');
frame(s, '11-ga4-debugview.png', 0.6, 1.4, 8.3, 5.2, 'DebugView: generate_lead с параметрами');
s.addText([
  { text: 'Ключевые события', options: { bold: true, breakLine: true } },
  { text: 'generate_lead', options: { bullet: true, breakLine: true } },
  { text: 'contact_click', options: { bullet: true, breakLine: true } },
  { text: 'messenger_click', options: { bullet: true } },
], { x: 9.2, y: 1.6, w: 3.6, h: 3.0, fontFace: BODY, fontSize: 20, color: INK, paraSpaceAfter: 10, isTextBox: true, valign: 'top' });

/* 10. Отчёты */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Отчёты GA4: какой канал приводит записи');
frame(s, '12-ga4-traffic.png', 0.6, 1.4, 12.1, 5.2, 'Traffic acquisition: Session source / medium + campaign');

/* 11. DataLens */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'DataLens: сеансы, заявки и визиты вместе');
frame(s, '13-datalens-campaigns.png', 0.6, 1.4, 12.1, 5.2, 'Вкладка «Кампании»: заявок на 100 сеансов');

/* 12. Итог */
s = pres.addSlide({ masterName: 'DARK' });
s.addText('Что компания теперь видит', { x: 0.6, y: 0.5, w: 12.1, h: 0.9, fontFace: HEAD, fontSize: 36, bold: true, color: LINEN, margin: 0, isTextBox: true });
const res = [
  ['Запись 24/7', 'Клиент выбирает время сам — вечером и в выходные ответа ждать не нужно'],
  ['Источник каждой записи', 'Instagram, ВКонтакте, Telegram, YouTube, блогеры и визитки — отдельными строками'],
  ['Окупаемость блогеров', 'Заявки по utm_source блогера против 20\u00a0000\u00a0₽ в месяц'],
  ['Путь до визита', 'Статус в таблице: от новой записи до «клиент пришёл»'],
];
res.forEach((r, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 1.8 + Math.floor(i / 2) * 2.4;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.95, h: 2.1, rectRadius: 0.1, fill: { color: '2A2724' }, line: { color: '3A3631', width: 1 } });
  s.addText(r[0], { x: x + 0.3, y: y + 0.25, w: 5.4, h: 0.6, fontFace: HEAD, fontSize: 24, bold: true, color: BRASS, margin: 0, isTextBox: true });
  s.addText(r[1], { x: x + 0.3, y: y + 0.9, w: 5.4, h: 1.0, fontFace: BODY, fontSize: 20, color: LINEN, margin: 0, isTextBox: true, valign: 'top' });
});

pres.writeFile({ fileName: path.join(ROOT, 'presentation', 'zashchita.pptx') }).then((f) => console.log('Готово:', f));
