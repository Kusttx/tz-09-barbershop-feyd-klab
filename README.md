# ФЕЙД КЛАБ — сайт барбершопа, сквозная аналитика и онлайн-запись из соцсетей

Курсовая работа по ОП.03 «Информационные технологии» · техническое задание ТЗ-09/2026 · ООО «Фейд Клаб» (организация вымышленная).

| Что | Ссылка |
|---|---|
| Сайт на Vercel | https://tz-09-barbershop-feyd-klab-fawn.vercel.app |
| Таблица заявок «FadeClub — Bookings» | ⟨ссылка на Google Таблицу⟩ |
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
index.html services.html masters.html works.html style-quiz.html contacts.html thanks.html privacy.html 404.html
css/style.css
js/analytics.js   все события GA4
js/main.js        меню, UTM, фильтры, расписание
js/form.js        календарь, проверка и отправка формы
js/quiz.js        тест «Форма лица», промокод
js/thanks.js      номер записи и файл .ics
img/  files/fadeclub-price.pdf
apps-script/Code.gs, appsscript.json
docs/             prompts, events, utm.csv, images, report, opisanie, scheme.png, afisha.pdf, qr-u-12.png, nastroika
screens/          ga4 utm instagram reports explore datalens lighthouse kursovaya
presentation/     zashchita.pdf, zashchita.pptx, build.js
tools/set-config.js
```

## Настройка

Идентификатор GA4, адрес приёмника и адрес сайта подставляются одной командой:

```
node tools/set-config.js --ga G-XXXXXXXXXX --script https://script.google.com/macros/s/…/exec --site https://tz-09-barbershop-feyd-klab-fawn.vercel.app
```

Пошаговая настройка сервисов — [docs/nastroika.md](docs/nastroika.md).

Не получилось: ⟨впишите честно, что не удалось, или «всё выполнено»⟩

Нейросеть использовалась для: генерации страниц сайта и стилей, иллюстраций, кода JavaScript и Apps Script, реестра UTM, схемы работы и презентации (Claude Opus 5.5, запросы — [docs/prompts.md](docs/prompts.md)).
