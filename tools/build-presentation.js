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

// Текст выступления: [время, слова]. Пишется в заметки слайдов и в docs/zashchita-tekst.md
const SPEECH = [];
function say(slide, time, text) { slide.addNotes(time + '\n' + text); SPEECH.push([time, text]); }

/* 1. Титул — 0:20 */
let s = pres.addSlide({ masterName: 'DARK' });
s.addText('ФЕЙД КЛАБ', { x: 0.6, y: 0.6, w: 6, h: 0.6, fontFace: HEAD, fontSize: 24, bold: true, color: BRASS, charSpacing: 6, margin: 0, isTextBox: true });
s.addText('Сайт барбершопа, сквозная аналитика и онлайн-запись из соцсетей', { x: 0.6, y: 2.0, w: 8.2, h: 2.2, fontFace: HEAD, fontSize: 40, bold: true, color: LINEN, margin: 0, isTextBox: true, valign: 'top' });
s.addText('Курсовая работа по ОП.03 «Информационные технологии» · ТЗ-09/2026', { x: 0.6, y: 4.5, w: 8.2, h: 0.5, fontFace: BODY, fontSize: 20, color: MIST, margin: 0, isTextBox: true });
s.addText('tz-09-barbershop-feyd-klab-fawn.vercel.app', { x: 0.6, y: 6.4, w: 8.2, h: 0.4, fontFace: BODY, fontSize: 20, color: BRASS, margin: 0, isTextBox: true });
s.addImage({ path: path.join(__dirname, 'hero.png'), x: 9.3, y: 0.6, w: 3.4, h: 4.25, altText: 'Иллюстрация мастера' });
say(s, '0:00–0:20', 'Здравствуйте. Моя курсовая — проект по техническому заданию барбершопа «Фейд Клаб». Я сделал сайт с записью на конкретное время, подключил Google Analytics 4, разметил ссылки из соцсетей UTM-метками и настроил приём заявок в Google Таблицу.');

/* 2. Проблема — 0:45 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Половина обращений из соцсетей терялась');
sub(s, 'Из письма директора: сентябрь 2026');
const stats = [['280', 'обращений в соцсетях'], ['132', 'записались — 47 %'], ['2–3 ч', 'ждут ответа вечером'], ['20 000 ₽', 'в месяц блогерам без учёта']];
stats.forEach((st, i) => {
  const x = 0.6 + i * 3.1;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.4, w: 2.8, h: 2.6, rectRadius: 0.1, fill: { color: i === 1 ? INK : 'FFFFFF' }, line: { color: i === 1 ? INK : LINEN, width: 1 } });
  s.addText(st[0], { x: x + 0.25, y: 2.7, w: 2.4, h: 1.1, fontFace: HEAD, fontSize: 40, bold: true, color: i === 1 ? BRASS : INK, margin: 0, isTextBox: true });
  s.addText(st[1], { x: x + 0.25, y: 3.9, w: 2.4, h: 0.9, fontFace: BODY, fontSize: 20, color: i === 1 ? LINEN : STONE, margin: 0, isTextBox: true, valign: 'top' });
});
s.addText('Администратор вручную сверял время мастеров, пока клиент уходил в другой барбершоп. Какие видео блогеров приводят клиентов — никто не знал.',
  { x: 0.6, y: 5.4, w: 12.1, h: 1.0, fontFace: BODY, fontSize: 20, color: INK, margin: 0, isTextBox: true });
say(s, '0:20–1:05', 'Проблема из письма директора. В сентябре в соцсети написали 280 человек, а записались только 132 — меньше половины. Новые клиенты записывались через переписку: администратор вручную сверял свободное время мастеров, а вечером ответ шёл два-три часа, и человек уходил в другой барбершоп. Ещё компания платила блогерам 20 тысяч рублей в месяц и не знала, сколько клиентов приходит после их видео. Задача — дать клиенту записываться самому и видеть источник каждой записи.');

/* 3. Схема — 0:40 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Схема работы: от публикации до дашборда');
s.addImage({ path: path.join(ROOT, 'docs', 'scheme.png'), x: 0.9, y: 1.35, w: 11.5, h: 5.47, altText: 'Схема работы' });
say(s, '1:05–1:45', 'Вот как всё связано. Человек переходит на сайт по ссылке с UTM-метками — из поста, от блогера, с QR-кода на визитке — или по кнопке из автоответа в Instagram. Сайт отправляет события в Google Analytics, а заявку — через Apps Script в Google Таблицу. Из таблицы и выгрузки GA4 строится дашборд в DataLens.');

/* 4. Сайт — 0:40 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Сайт из 8 страниц: нейросеть + ручные правки');
frame(s, '01-site-home.png', 0.6, 1.4, 8.3, 5.2, 'Главная страница на Vercel');
s.addText([
  { text: 'Статический HTML, CSS, JS', options: { bullet: true, breakLine: true } },
  { text: 'Адаптив 375 / 768 / 1280 px', options: { bullet: true, breakLine: true } },
  { text: 'Фирменные цвета и шрифты', options: { bullet: true, breakLine: true } },
  { text: 'Журнал запросов — docs/prompts.md', options: { bullet: true } },
], { x: 9.2, y: 1.6, w: 3.6, h: 4.0, fontFace: BODY, fontSize: 20, color: INK, paraSpaceAfter: 12, isTextBox: true, valign: 'top' });
say(s, '1:45–2:25', 'Сайт сделан с помощью нейросети и доработан вручную: восемь страниц и страница 404, обычный HTML, CSS и JavaScript без сборки. Он опубликован на Vercel и обновляется после каждого коммита. Все запросы к нейросети и что пришлось исправить — в файле prompts.md. На главной сразу видна акция «минус 20 процентов» и свободное время на сегодня.');

/* 5. Запись на время — 0:40 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Клиент сам выбирает время — без переписки');
frame(s, '04-booking-form.png', 0.6, 1.4, 8.3, 5.2, 'Календарь на 14 дней и форма записи');
s.addText('Занятые слоты неактивны, ошибки в полях подсвечиваются, заявка уходит без перезагрузки страницы.',
  { x: 9.2, y: 1.6, w: 3.6, h: 3.0, fontFace: BODY, fontSize: 20, color: INK, isTextBox: true, valign: 'top', margin: 0 });
say(s, '2:25–3:05', 'Главная функция — запись на конкретное время. Календарь на 14 дней, слоты по часу с 10 до 21. Занятые слоты задаются массивом в JavaScript и зачёркнуты. Форма проверяет имя, телефон и согласие на обработку данных; если телефон неверный, под полем появляется подсказка. Отправка идёт без перезагрузки, после неё — страница «Спасибо» с номером записи и файлом для календаря.');

/* 6. Таблица — 0:35 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, 'Каждая запись — в таблице с источником и статусом');
frame(s, '08-lead-in-sheet.png', 0.6, 1.6, 12.1, 2.4, 'Строка заявки в листе leads');
s.addText('new → confirmed → reminded → visited  ·  no_show', { x: 0.6, y: 4.6, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 22, bold: true, color: BRASS_INK, margin: 0, isTextBox: true });
s.addText('Приёмник Apps Script проверяет поля, не пускает дубли и сам ставит время и статус', { x: 0.6, y: 5.3, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 20, color: INK, margin: 0, isTextBox: true });
say(s, '3:05–3:40', 'Заявка попадает в Google Таблицу через приёмник на Apps Script. Он сам проверяет поля и не создаёт вторую строку с тем же номером. Здесь моя тестовая заявка по ссылке U-01: услуга, уровень мастера, время и метки — instagram, social, first_visit_nov_2026, bio. Статус администратор меняет из списка: новая, подтверждена, напомнили, клиент пришёл или не пришёл.');

/* 7. GA4 — 0:45 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, '20 событий GA4 — каждый шаг посетителя');
frame(s, '11-ga4-realtime.png', 0.6, 1.4, 8.3, 5.2, 'GA4 Realtime: generate_lead после заявки');
s.addText([
  { text: 'Ключевые события', options: { bold: true, breakLine: true } },
  { text: 'generate_lead', options: { bullet: true, breakLine: true } },
  { text: 'contact_click', options: { bullet: true, breakLine: true } },
  { text: 'messenger_click', options: { bullet: true } },
], { x: 9.2, y: 1.6, w: 3.6, h: 3.0, fontFace: BODY, fontSize: 20, color: INK, paraSpaceAfter: 10, isTextBox: true, valign: 'top' });
say(s, '3:40–4:25', 'Аналитика — Google Analytics 4, ресурс «ФЕЙД КЛАБ — сайт». Сайт отправляет 20 событий: шесть собирает сам GA4, остальные я запрограммировал в одном файле analytics.js — клики по кнопкам записи, выбор услуги и мастера, выбор времени, ошибки формы. Событие generate_lead отправляется только после того, как таблица ответила «ok». На кадре видно, что после тестовой заявки оно пришло в отчёт реального времени.');

/* 8. UTM — 0:35 */
s = pres.addSlide({ masterName: 'LIGHT' });
title(s, '12 ссылок с UTM: каждый канал считается отдельно');
frame(s, '09-utm-registry.png', 0.6, 1.4, 12.1, 4.9, 'Реестр ссылок docs/utm.csv');
say(s, '4:25–5:00', 'Чтобы видеть источник, все ссылки размечены UTM-метками — 12 штук в реестре: Instagram, ВКонтакте, Telegram, YouTube, два блогера и QR-код на визитке. Метки сохраняются, пока человек ходит по сайту, и попадают в заявку. Теперь директор видит, сколько записей дал каждый блогер.');

/* 9. Instagram — 0:35. Пока нет кадра ManyChat — показываем страницу, куда ведёт автоответ */
s = pres.addSlide({ masterName: 'LIGHT' });
if (fs.existsSync(K('10-instagram-direct.png'))) {
  title(s, 'Комментарий под Reel → ответ в Direct за секунды');
  frame(s, '10-instagram-direct.png', 0.6, 1.4, 5.2, 5.2, 'Сообщение ManyChat с кнопкой');
} else {
  title(s, 'Автоответ из Instagram ведёт на тест с промокодом');
  frame(s, '07-quiz-result.png', 0.6, 1.4, 7.4, 5.2, 'Результат теста «Форма лица» и промокод FIRST20');
}
s.addText([
  { text: '«СТРИЖКА» → тест «Форма лица» и промокод FIRST20', options: { bullet: true, breakLine: true } },
  { text: '«ПОДАРОК» → сертификаты на 2 000, 3 000, 5 000 ₽', options: { bullet: true, breakLine: true } },
  { text: 'Кнопки ведут по UTM-ссылкам U\u201102 и U\u201103', options: { bullet: true } },
], { x: 8.3, y: 1.6, w: 4.4, h: 4.6, fontFace: BODY, fontSize: 20, color: INK, paraSpaceAfter: 14, isTextBox: true, valign: 'top' });
say(s, '5:00–5:35', 'Вместо ожидания ответа вечером — автоответ ManyChat. Человек пишет под Reel слово «СТРИЖКА» и сразу получает в директ кнопку на тест «Форма лица»: четыре вопроса, три подходящие стрижки и промокод на первую стрижку. Слово «ПОДАРОК» ведёт на сертификаты. Обе кнопки — ссылки с UTM, поэтому такие заявки видны в таблице как instagram.');

/* 10. Отчёты и DataLens — 0:40. Пока нет дашборда — показываем проверку формы */
s = pres.addSlide({ masterName: 'LIGHT' });
if (fs.existsSync(K('13-datalens-campaigns.png'))) {
  title(s, 'DataLens: сеансы, заявки и визиты вместе');
  frame(s, '13-datalens-campaigns.png', 0.6, 1.4, 12.1, 5.2, 'Вкладка «Кампании»: заявок на 100 сеансов');
  say(s, '5:35–6:15', 'Данные собираются в отчётах GA4 и в дашборде DataLens из трёх вкладок: трафик, заявки со статусами и кампании. На вкладке «Кампании» сеансы из GA4 стоят рядом с заявками и визитами из таблицы, поэтому видно, сколько заявок даёт каждый источник на сто посещений. Выводы и гипотеза — в аналитической записке.');
} else {
  title(s, 'Форма не пропустит ошибку — и сообщит о ней в GA4');
  frame(s, '05-form-errors.png', 0.6, 1.4, 8.3, 5.2, 'Ошибки формы: пустые поля и телефон «123»');
  s.addText([
    { text: 'Телефон — только +7 и 10 цифр', options: { bullet: true, breakLine: true } },
    { text: 'Без согласия форма не уйдёт', options: { bullet: true, breakLine: true } },
    { text: 'Каждая ошибка — событие form_error', options: { bullet: true } },
  ], { x: 9.2, y: 1.6, w: 3.6, h: 4.0, fontFace: BODY, fontSize: 20, color: INK, paraSpaceAfter: 12, isTextBox: true, valign: 'top' });
  say(s, '5:35–6:15', 'Форма защищена от ошибок. Если оставить телефон пустым или ввести «123», заявка не уйдёт, а под полем появится понятная подсказка. Каждая такая ошибка отправляется в GA4 событием form_error с названием поля — так видно, на каком поле люди спотыкаются. Приёмник в таблице проверяет те же правила ещё раз и не принимает повторную заявку с тем же номером.');
}

/* 11. Итог — 0:45 */
s = pres.addSlide({ masterName: 'DARK' });
s.addText('Что компания теперь видит', { x: 0.6, y: 0.5, w: 12.1, h: 0.9, fontFace: HEAD, fontSize: 36, bold: true, color: LINEN, margin: 0, isTextBox: true });
const res = [
  ['Запись 24/7', 'Клиент выбирает время сам — вечером и в выходные ответа ждать не нужно'],
  ['Источник каждой записи', 'Instagram, ВКонтакте, Telegram, YouTube, блогеры и визитки — отдельными строками'],
  ['Окупаемость блогеров', 'Заявки по utm_source блогера против 20 000 ₽ в месяц'],
  ['Путь до визита', 'Статус в таблице: от новой записи до «клиент пришёл»'],
];
res.forEach((r, i) => {
  const x = 0.6 + (i % 2) * 6.15, y = 1.8 + Math.floor(i / 2) * 2.4;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 5.95, h: 2.1, rectRadius: 0.1, fill: { color: '2A2724' }, line: { color: '3A3631', width: 1 } });
  s.addText(r[0], { x: x + 0.3, y: y + 0.25, w: 5.4, h: 0.6, fontFace: HEAD, fontSize: 24, bold: true, color: BRASS, margin: 0, isTextBox: true });
  s.addText(r[1], { x: x + 0.3, y: y + 0.9, w: 5.4, h: 1.0, fontFace: BODY, fontSize: 20, color: LINEN, margin: 0, isTextBox: true, valign: 'top' });
});
say(s, '6:15–7:00', 'Итог для бизнеса. Клиент записывается сам в любое время, не дожидаясь ответа администратора. У каждой записи есть услуга, мастер, время и источник. Директор может посчитать, окупаются ли 20 тысяч рублей блогерам, и видит, дошёл ли клиент до визита. Сайт работает по адресу на Vercel — могу прямо сейчас показать заявку вживую. Спасибо, готов ответить на вопросы.');

// Текст выступления отдельным файлом
const md = ['# Текст выступления на защите — 7 минут', '',
  'Говорить своими словами, опираясь на этот текст. Время указано от начала доклада.',
  'Живая демонстрация (после доклада или на слайде 6): открыть ссылку U-01 из docs/utm.csv → записаться с именем «Приёмка ТЗ-09/2026» → показать строку в таблице → показать generate_lead в GA4 Realtime.', '']
  .concat(SPEECH.map((x, i) => '## Слайд ' + (i + 1) + ' · ' + x[0] + '\n\n' + x[1] + '\n')).join('\n');
fs.writeFileSync(path.join(ROOT, 'docs', 'zashchita-tekst.md'), md);

pres.writeFile({ fileName: path.join(ROOT, 'presentation', 'zashchita.pptx') }).then((f) => console.log('Готово:', f));
