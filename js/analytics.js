/*
 * analytics.js — все события Google Analytics 4 сайта «Фейд Клаб».
 * Это единственный файл, где вызывается gtag('event', ...) (ТЗ, п. 4.3).
 *
 * 1) Клики: элементы с атрибутом data-event отправляют событие с параметрами
 *    из data-атрибутов (data-button-name → button_name и т. д.).
 * 2) Другие скрипты (form.js, quiz.js, main.js) вызывают window.fcTrack(имя, параметры),
 *    а fcTrack уже передаёт событие в gtag.
 *
 * Имя, телефон и e-mail посетителя в GA4 не передаются.
 */
(function () {
  'use strict';

  // Какие параметры разрешено отправлять с каждым событием (таблица 4.2 ТЗ)
  var EVENT_PARAMS = {
    generate_lead:      ['lead_service', 'lead_master_level', 'lead_source'],
    cta_click:          ['button_name', 'page_section'],
    service_view:       ['service_name'],
    master_view:        ['master_level', 'master_id'],
    works_filter:       ['haircut_type'],
    face_quiz_complete: ['face_shape'],
    slot_select:        ['slot_date', 'slot_time', 'weekday'],
    gift_card_click:    ['gift_amount'],
    contact_click:      ['contact_type'],
    messenger_click:    ['messenger'],
    social_click:       ['network', 'page_section'],
    form_error:         ['field_name', 'error_type'],
    promo_copy:         ['promo_code'],
    map_open:           ['map_service']
  };

  // Обрезаем значение до 100 символов (ограничение ТЗ и GA4)
  function clean(value) {
    if (value === undefined || value === null) return undefined;
    var s = String(value).trim();
    return s.length > 100 ? s.slice(0, 100) : s;
  }

  // Отправка события: оставляем только разрешённые параметры
  function track(eventName, params) {
    var allowed = EVENT_PARAMS[eventName];
    if (!allowed) return;                       // неизвестное событие не отправляем
    var payload = {};
    params = params || {};
    allowed.forEach(function (key) {
      var v = clean(params[key]);
      if (v !== undefined && v !== '') payload[key] = v;
    });
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }
  }
  window.fcTrack = track;

  // data-button-name → button_name, data-page-section → page_section
  function paramsFromData(el) {
    var params = {};
    Object.keys(el.dataset).forEach(function (key) {
      if (key === 'event') return;
      var snake = key.replace(/[A-Z]/g, function (c) { return '_' + c.toLowerCase(); });
      params[snake] = el.dataset[key];
    });
    return params;
  }

  // Один обработчик на весь документ ловит клики по элементам с data-event
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-event]');
    if (!el) return;
    var name = el.dataset.event;
    // кнопка формы отправляет cta_click, только если форма прошла проверку — это делает form.js
    if (el.type === 'submit') return;
    track(name, paramsFromData(el));
  });

  // Строки таблицы цен можно выбрать с клавиатуры (Enter) — тоже service_view
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var el = e.target.closest('tr[data-event]');
    if (el) el.click();
  });
})();
