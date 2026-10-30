# Что сделать в сервисах — пошагово

Код сайта, приёмник и документы уже в репозитории. Ниже — шаги, которые делаются только в ваших аккаунтах (GitHub, Vercel, Google, Instagram, ManyChat, DataLens). Порядок — по этапам раздела 9 ТЗ. Скриншоты называйте ровно так, как указано, и кладите в указанные папки.

## 0. Репозиторий (5 минут)

1. GitHub → репозиторий → **Settings → General → Repository name**: `tz-09-barbershop-feyd-klab` (имя из п. 3.4 ТЗ). Старая ссылка продолжит работать как переадресация.
2. На главной странице репозитория → шестерёнка у **About**:
   - Description: `Сайт барбершопа «Фейд Клаб»: GA4, UTM, заявки в Google Таблицу, ManyChat, дашборд DataLens`
   - Website: адрес Vercel (после шага 1)
   - Topics: `google-analytics` `utm` `apps-script` `manychat` `datalens` `vercel`
3. Репозиторий должен быть **Public**.

## 1. Vercel (этап 1, 10 минут)

1. vercel.com → войти через GitHub → **Add New → Project** → выбрать репозиторий → Framework Preset: **Other**, Build Command пусто, Output Directory пусто → **Deploy**.
2. Settings → General → Project Name: `tz-09-barbershop-feyd-klab`. Адрес проекта — `https://tz-09-barbershop-feyd-klab-fawn.vercel.app` (короткое имя без суффикса занято другим проектом Vercel).
3. Если адрес другой, подставьте его везде одной командой и закоммитьте:
   ```
   node tools/set-config.js --site https://ВАШ-АДРЕС.vercel.app
   ```
4. Lighthouse: Chrome → F12 → Lighthouse → Mobile → Performance, Accessibility, SEO → Analyze. Снимок — `screens/lighthouse/index-mobile.png`.

## 2. Google Analytics 4 (этап 2)

1. analytics.google.com → Admin → **Create property**: «ФЕЙД КЛАБ — сайт», часовой пояс (GMT+03:00) Москва, валюта — российский рубль.
2. **Data streams → Web** → адрес Vercel. В Enhanced measurement включено всё, в том числе **Form interactions**.
3. Скопируйте Measurement ID (`G-…`) и выполните:
   ```
   node tools/set-config.js --ga G-ВАШ_ID
   git commit -am "GA4: идентификатор ресурса" && git push
   ```
4. **Admin → Custom definitions → Create custom dimension** (Scope: Event) — 7 штук: `button_name`, `page_section`, `service_name`, `master_level`, `weekday`, `lead_service`, `messenger`.
5. **Admin → Events**: после первых срабатываний отметьте звёздочкой (Mark as key event) `generate_lead`, `contact_click`, `messenger_click`. Больше ни одного.
6. **Admin → Property access management** → добавить e-mail Заказчика с ролью **Viewer**.
7. DebugView: установите расширение Chrome «Google Analytics Debugger», включите его, откройте сайт. Admin → DebugView. Для каждого события из `docs/events.md` вызовите его на сайте, откройте событие в DebugView, раскройте параметры, снимок — `screens/ga4/<имя_события>.png` (например `screens/ga4/service_view.png`). 20 снимков.

## 3. Таблица и приёмник (этап 3)

1. Google Таблицы → новая таблица «**FadeClub — Bookings**», лист переименовать в `leads`. Добавить листы `utm`, `ga4_traffic`, `ga4_leads`.
2. Расширения → **Apps Script** → вставить `apps-script/Code.gs` целиком. Шестерёнка «Настройки проекта» → часовой пояс (GMT+03:00) Москва.
3. Выбрать функцию `setupSheet` → **Выполнить** → разрешить доступ. На листе появятся заголовки, список статусов и подсветка.
4. **Развернуть → Новое развёртывание → Веб-приложение**: «Выполнять от имени» — Я, «У кого есть доступ» — Все. Скопировать URL `…/exec`.
5. ```
   node tools/set-config.js --script https://script.google.com/macros/s/…/exec
   git commit -am "Форма: адрес приёмника Apps Script" && git push
   ```
6. Проверка: откройте сайт со ссылкой U-01 из `docs/utm.csv`, запишитесь с именем «Тест U-01» → строка в `leads` с метками instagram / social / first_visit_nov_2026 / bio.
7. Таблица → Настройки доступа → e-mail Заказчика, роль «Читатель».
8. После любой правки Code.gs: Развернуть → Управление развёртываниями → карандаш → Версия: новая → Развернуть (URL не меняется).

## 4. Каналы (этап 4)

**Реестр.** Импортируйте `docs/utm.csv` на лист `utm` (Файл → Импорт → Заменить текущий лист). Полная ссылка собирается формулой, а не вручную — в ячейку J2:
```
=СЦЕПИТЬ("https://tz-09-barbershop-feyd-klab-fawn.vercel.app/"; ПОДСТАВИТЬ(I2;"#gift";""); "?utm_source="; D2; "&utm_medium="; E2; "&utm_campaign="; F2; "&utm_content="; G2; ЕСЛИ(ЕЧИСЛО(ПОИСК("#";I2)); "#gift"; ""))
```
и протяните вниз. В строках U-10 и U-11 замените `nik_blogera_1` / `nik_blogera_2` на ники двух одногруппников латиницей (и в формуле, и в `docs/utm.csv`).

**Короткие ссылки.** Для U-05, U-06, U-07, U-08 — vk.cc (ВКонтакте) или clck.ru. Перейдите по каждой, убедитесь, что в адресе все метки, снимок `screens/utm/short-u-05.png` и т. д. Ссылку впишите в столбец short_url.

**Публикации.** Отдельные аккаунты от имени «Фейд Клаб» (не личные): Instagram (профессиональный), сообщество ВКонтакте, канал Telegram, канал YouTube. Опубликуйте ссылки из реестра, адрес публикации и дату впишите в реестр. Нельзя опубликовать в одной сети — замена (Дзен, TikTok, Pinterest), отметка в comment.

**Отработка (п. 5.5).** Каждую ссылку — кликом из публикации, с другого устройства или в инкогнито:
- снимок адресной строки — `screens/utm/u-01-url.png`;
- снимок GA4 Realtime с источником — `screens/utm/u-01-realtime.png`;
- для U-01, U-05, U-07, U-09, U-10, U-11, U-12 — заявка с именем «Тест U-05» и т. п.
Через 24–48 часов: Reports → Acquisition → Traffic acquisition, группировка Session source / medium, не меньше 6 пар → `screens/utm/traffic-acquisition.png`.

После заполнения выгрузите лист `utm` в CSV и замените `docs/utm.csv`.

## 5. ManyChat (этап 4)

1. Instagram: переключите аккаунт на профессиональный (Автор или Бизнес). Опубликуйте Reel «Фейд за 40 минут: до и после».
2. manychat.com → подключить Instagram → **Automation → New → Start from scratch**, имя `IG · First Visit Nov 2026 · Fade Reel`.
3. Триггер: **Instagram → Post or Reel Comments** → Specific Post or Reel → выбрать Reel → ключевое слово `СТРИЖКА`.
4. Ответ в комментариях (3 варианта, случайный):
   - Отправили подбор стрижки в личные сообщения ✂️
   - Проверьте директ — там тест по форме лица
   - Готово! Тест и промокод уже в сообщениях
5. Сообщение в Direct: «Привет! Это «Фейд Клаб». Пройдите тест из 4 вопросов — подберём стрижку по форме лица. Первая стрижка у нас −20 %.» Кнопка «Подобрать стрижку» → полная ссылка U-02.
6. Вторая ветка (новая автоматизация на тот же Reel): ключевое слово `ПОДАРОК`, сообщение «Подарочные сертификаты на 2 000, 3 000 и 5 000 ₽ — по кнопке ниже.», кнопка «Сертификаты» → ссылка U-03.
7. Переведите обе в **Live**. Со второго аккаунта: комментарий «СТРИЖКА» → снимки ответа, сообщения (может быть в «Запросах»), адреса страницы после кнопки, строки в таблице, generate_lead в Realtime. Через 2 минуты то же с «ПОДАРОК». Папка `screens/instagram/`: `01-automation.png`, `02-comment-reply.png`, `03-direct.png`, `04-url.png`, `05-lead.png`, `06-realtime.png`, `07-gift-branch.png`.

## 6. Отчёты (этап 5, через 24–48 часов после проверок)

Период во всех отчётах — Custom: от первой проверки до дня сдачи. Снимки в `screens/reports/`:

| Отчёт | Как настроить | Файл |
|---|---|---|
| Reports snapshot | Compare → Preceding period | `snapshot.png` |
| User acquisition | First user source / medium | `user-acquisition.png` |
| Traffic acquisition | Session source / medium + «+» Session campaign | `traffic-campaign.png` |
| Traffic acquisition | Session source / medium + Session manual ad content | `traffic-content.png` |
| Traffic acquisition | Add comparison: Session source exactly matches `instagram` и `(direct)` | `comparison.png` |
| Landing page | Engagement → Landing page + Session source | `landing-source.png` |
| Pages and screens | Views, Active users, Average engagement time | `pages.png` |
| Events | generate_lead, cta_click, service_view, master_view, works_filter | `events.png` |
| Key events | разбивка Session source / medium | `key-events.png` |
| Tech | Tech details → Device category | `tech.png` |
| Library | коллекция «ФЕЙД КЛАБ», отчёт «Кампания first_visit_nov_2026», Publish | `library.png` |
| Custom insight | Insights → Create: daily, Session source = instagram, Sessions decreased > 50 %, e-mail | `custom-insight.png` |

Traffic acquisition → Share this report → Download File → CSV → `docs/reports/traffic-acquisition.csv`.

**Explore** (названия начинаются с «ФЕЙД КЛАБ ·», сегменты сеансов «Instagram Sessions» и «Direct Sessions»), снимки с видимым значком качества данных в `screens/explore/`: `free-form.png`, `free-form-segments.png`, `funnel-open.png`, `funnel-closed.png`, `funnel-device.png`, `funnel-time.png`, `path.png`, `path-reverse.png`. Таблицу свободной формы → Export → CSV → `docs/reports/free-form.csv`. Настройки — таблица 8.2 ТЗ.

## 7. DataLens (этап 5)

1. Из «Свободной формы» выгрузите данные (Export → Google Sheets или CSV) на листы `ga4_traffic` (дата, source, medium, campaign, sessions, active users) и `ga4_leads` (дата, source, campaign, generate_lead). Удалите служебные строки сверху и строку «Общий итог». Замените `(direct)` → `direct`, `(none)` → `none`, `(not set)` → `not_set`.
2. datalens.yandex.ru → Подключения → **Google Sheets** → таблица «FadeClub — Bookings».
3. Датасеты: `leads` (скрыть поля name, phone, email), `ga4_traffic`, `ga4_leads`.
4. Дашборд «ФЕЙД КЛАБ — first_visit_nov_2026», три вкладки по таблице 8.4 ТЗ. На каждой вкладке селектор периода закреплён и связан со всеми виджетами. Индикатор «Всего заявок» — `COUNTD([request_id])`, «Новые» — `COUNTD(IF([status]="new",[request_id],NULL))`, «Клиент пришёл» — то же для `visited`.
5. Одну тестовую заявку проведите по статусам new → confirmed → reminded → visited, другую закройте `no_show`.
6. Доступ к воркбуку — «Просмотр» для e-mail Заказчика, без публичной ссылки. Снимки: `screens/datalens/traffic.png`, `leads.png`, `campaigns.png`.

## 8. Записка, README, курсовая

1. Заполните `docs/report.md` числами из отчётов.
2. В `README.md` впишите ссылки и строки, помеченные «впишите».
3. Кадры для описания и презентации — в `screens/kursovaya/`. Кадры 01–07 и 09 (сайт и реестр) уже сделаны; лучше переснять 01–07 со своего адреса Vercel — там загрузятся фирменные шрифты. Добавьте свои:
   - `08-lead-in-sheet.png` — строка заявки в листе leads (телефон закрыть);
   - `10-instagram-direct.png` — сообщение ManyChat в Direct с кнопкой;
   - `11-ga4-debugview.png` — generate_lead с раскрытыми параметрами;
   - `12-ga4-traffic.png` — Traffic acquisition с кампанией;
   - `13-datalens-campaigns.png` — вкладка «Кампании»;
   - `screens/lighthouse/index-mobile.png`.
4. Презентация: либо `npm i pptxgenjs` и `node presentation/build.js` (кадры подставятся сами), либо откройте `presentation/zashchita.pptx`, удалите пунктирные рамки и вставьте снимки. Затем Файл → Экспорт → PDF → `presentation/zashchita.pdf`. На первый слайд добавьте ФИО и группу.
5. Видео до 60 секунд на случай плохой сети на защите: ссылка с UTM → форма → строка в таблице → generate_lead в Realtime.
6. Перед сдачей отключите расширение GA Debugger (в коде отладки нет).
