# ФЕЙД КЛАБ — сайт барбершопа, сквозная аналитика и онлайн-запись из соцсетей

Курсовая работа по ОП.03 «Информационные технологии» · техническое задание ТЗ-09/2026 · ООО «Фейд Клаб» (организация вымышленная).

| Что | Ссылка |
|---|---|
| Сайт на Vercel | [tz-09-barbershop-feyd-klab-fawn.vercel.app](https://tz-09-barbershop-feyd-klab-fawn.vercel.app) |
| Запись на время (форма) | [contacts.html](https://tz-09-barbershop-feyd-klab-fawn.vercel.app/contacts.html) |
| Таблица заявок «FadeClub — Bookings» | [Google Таблица, лист leads](https://docs.google.com/spreadsheets/d/1VvPuJ8EsLE4YFzbElOxijllofdqzxtpLOWg4Lim7r7c/edit) |
| Приёмник заявок Apps Script | [веб-приложение](https://script.google.com/macros/s/AKfycby7pZrUixWcOQzKQdKJzzLUTYNaUYZ2aIkEKPAbYhcElvI_12_SBitkOHVRovKADB_2Cw/exec), код — [apps-script/Code.gs](apps-script/Code.gs) |
| Реестр UTM-ссылок | [docs/utm.csv](docs/utm.csv) |
| Дашборд DataLens | ⟨ссылка на дашборд⟩ |
| Instagram | ⟨ссылка на профиль⟩ |
| Reel с автоответами | ⟨ссылка на Reel⟩ |
| ВКонтакте | ⟨ссылка на пост⟩ |
| Telegram | ⟨ссылка на пост⟩ |
| YouTube | ⟨ссылка на Shorts⟩ |
| Презентация | [presentation/zashchita.pdf](presentation/zashchita.pdf), исходник [zashchita.pptx](presentation/zashchita.pptx) |

Идентификатор ресурса GA4: `G-LKT0RQ9B2E`
Доступ Viewer к ресурсу GA4 выдан: ⟨e-mail Заказчика⟩

## Что сделано

- **Сайт** — 8 страниц и 404 на HTML, CSS и JavaScript без сборки: главная, услуги и цены, мастера, работы, подбор стрижки, запись и контакты, спасибо, политика конфиденциальности. Запись на конкретное время: календарь на 14 дней, слоты по 60 минут, занятые неактивны. Кнопка «Добавить в календарь» скачивает .ics.
- **GA4** — 20 событий (6 автоматических, 14 своих) в одном файле `js/analytics.js`, 7 пользовательских параметров, 3 ключевых события. Таблица событий — [docs/events.md](docs/events.md).
- **UTM** — реестр из 12 ссылок [docs/utm.csv](docs/utm.csv), метки сохраняются в `sessionStorage` до отправки формы. QR-код [docs/qr-u-12.png](docs/qr-u-12.png) и афиша [docs/afisha.pdf](docs/afisha.pdf).
- **Заявки** — форма отправляет данные через `fetch` в приёмник Apps Script [apps-script/Code.gs](apps-script/Code.gs): проверка полей, защита от дублей по `request_id`, статусы new → confirmed → reminded → visited / no_show.
- **Instagram** — ManyChat: «СТРИЖКА» ведёт на тест «Форма лица» с промокодом FIRST20, «ПОДАРОК» — на сертификаты.
- **Отчёты** — стандартные отчёты и исследования GA4, оповещение, аналитическая записка [docs/report.md](docs/report.md), дашборд DataLens из трёх вкладок.

Описание работы с кадрами — [docs/opisanie.md](docs/opisanie.md), схема — [docs/scheme.png](docs/scheme.png).

## Структура

```
tz-09-barbershop-feyd-klab/
├── index.html … 404.html   9 страниц сайта (в корне — так их публикует Vercel)
├── robots.txt, sitemap.xml для поисковиков
├── css/          style.css
├── js/           analytics.js — все события GA4 · form.js — запись и отправка
│                 main.js — меню, UTM, фильтры · quiz.js — тест · thanks.js — файл .ics
├── img/          иллюстрации, превью для соцсетей, значки сайта
├── files/        прайс в PDF
├── apps-script/  приёмник заявок Code.gs и appsscript.json
├── docs/         запросы, события, реестр UTM, записка, описание, схема, афиша, QR, настройка
├── screens/      снимки: ga4, utm, instagram, reports, explore, datalens, lighthouse, kursovaya
├── presentation/ zashchita.pdf и zashchita.pptx
└── tools/        set-config.js — настройки сайта · build-presentation.js — сборка презентации
```

## Настройка

Идентификатор GA4, адрес приёмника и адрес сайта подставляются одной командой:

```
node tools/set-config.js --ga G-XXXXXXXXXX --script https://script.google.com/macros/s/…/exec --site https://tz-09-barbershop-feyd-klab-fawn.vercel.app
```

Пошаговая настройка сервисов — [docs/nastroika.md](docs/nastroika.md).

Не получилось: ⟨впишите честно, что не удалось, или «всё выполнено»⟩

Нейросеть использовалась для: генерации страниц сайта и стилей, иллюстраций, кода JavaScript и Apps Script, реестра UTM, схемы работы и презентации (Claude Opus 5.5, запросы — [docs/prompts.md](docs/prompts.md)).
