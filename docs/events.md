# Таблица событий GA4 — «Фейд Клаб»

Все вызовы `gtag('event', …)` — в одном файле `js/analytics.js`, строка 51 (функция `track`).
Кнопки и ссылки размечены атрибутами `data-event` и `data-*` — обработчик кликов `js/analytics.js:68` превращает `data-button-name` в параметр `button_name` и т. д.
Скрипты `form.js`, `quiz.js` вызывают `window.fcTrack(имя, параметры)`, которая передаёт событие в ту же функцию `track`.

Имя, телефон и e-mail посетителя в GA4 не передаются: `track` пропускает только параметры из списка `EVENT_PARAMS` (`js/analytics.js:16`).

| № | Событие | Тип | Где отправляется (файл:строка) | Параметры и пример значений |
|---|---|---|---|---|
| 1 | `page_view` | авто | тег Google в `<head>` каждой страницы, строки 7–13 | `page_location` = …/services.html, `page_title` = «Услуги и цены — Фейд Клаб» |
| 2 | `scroll` | авто | расширенная статистика | `percent_scrolled` = 90 |
| 3 | `click` | авто | ссылки на Instagram, ВКонтакте, Telegram, WhatsApp, карты | `link_url` = https://t.me/fadeclub_barber, `outbound` = true |
| 4 | `file_download` | авто | services.html — ссылка `files/fadeclub-price.pdf` | `file_name` = /files/fadeclub-price.pdf, `file_extension` = pdf |
| 5 | `form_start` | авто | contacts.html — форма `#booking-form` | `form_id` = booking-form |
| 6 | `form_submit` | авто | contacts.html — форма `#booking-form` | `form_id` = booking-form |
| 7 | `generate_lead` ★ | рекоменд. | `js/form.js:230` — только после ответа приёмника `{"ok": true}` | `lead_service` = combo, `lead_master_level` = top, `lead_source` = instagram |
| 8 | `cta_click` | своё | шапка всех страниц (строка 51), index.html (первый экран, слоты «Свободно сегодня» — `js/main.js:131`), masters.html (кнопки «Записаться к мастеру»), style-quiz.html, works.html, contacts.html (кнопка формы), 404.html | `button_name` = hero_book, `page_section` = hero |
| 9 | `service_view` | своё | index.html:84 (карточки услуг), services.html:70 (строки таблицы цен) | `service_name` = combo |
| 10 | `master_view` | своё | masters.html:65 (фильтр по уровню), фото мастеров на index.html:112 и masters.html | `master_level` = brand, `master_id` = m01 |
| 11 | `works_filter` | своё | index.html:164, works.html:65 (кнопки фильтра) | `haircut_type` = crop |
| 12 | `face_quiz_complete` | своё | `js/quiz.js:61` — после ответа на 4-й вопрос | `face_shape` = square |
| 13 | `slot_select` | своё | `js/form.js:81` — выбор времени в календаре | `slot_date` = 2026-11-01, `slot_time` = 18:00, `weekday` = sunday |
| 14 | `gift_card_click` | своё | index.html:189, services.html:102 (карточки номиналов) | `gift_amount` = 3000 |
| 15 | `contact_click` ★ | своё | телефон в шапке (строка 50 всех страниц), телефон и e-mail в подвале и на contacts.html | `contact_type` = phone / email |
| 16 | `messenger_click` ★ | своё | contacts.html:140 и следующая строка | `messenger` = telegram / whatsapp |
| 17 | `social_click` | своё | подвал всех страниц (index.html:213), thanks.html:78 | `network` = instagram, `page_section` = footer / thanks |
| 18 | `form_error` | своё | `js/form.js:142` (ошибка поля), `js/form.js:250` (ошибка приёмника) | `field_name` = phone, `error_type` = format / required / server |
| 19 | `promo_copy` (по выбору) | своё | `js/quiz.js:74` — кнопка «Скопировать промокод» | `promo_code` = FIRST20 |
| 20 | `map_open` (по выбору) | своё | contacts.html:146 (Яндекс Карты) и ссылка 2ГИС | `map_service` = yandex / 2gis |

★ — ключевые события (Admin → Events → Mark as key event): `generate_lead`, `contact_click`, `messenger_click`.

## Пользовательские параметры (Admin → Custom definitions, Event scope)

| Параметр | Событие |
|---|---|
| `button_name` | cta_click |
| `page_section` | cta_click, social_click |
| `service_name` | service_view |
| `master_level` | master_view |
| `weekday` | slot_select |
| `lead_service` | generate_lead |
| `messenger` | messenger_click |

## Значения `error_type`

| Значение | Когда |
|---|---|
| `required` | обязательное поле пустое (slot, service, name, phone, consent) |
| `format` | телефон не +7 и 10 цифр, e-mail без «@», имя короче 2 символов |
| `server` | приёмник ответил `{"ok": false}` или не ответил за 20 секунд |
