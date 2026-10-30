/*
 * form.js — запись на конкретное время (страница contacts.html).
 * Календарь на 14 дней, слоты по 60 минут, проверка полей,
 * отправка в Google Таблицу через Apps Script без перезагрузки страницы.
 */
(function () {
  'use strict';

  // Адрес веб-приложения Apps Script (Развернуть → Веб-приложение → URL)
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby7pZrUixWcOQzKQdKJzzLUTYNaUYZ2aIkEKPAbYhcElvI_12_SBitkOHVRovKADB_2Cw/exec';

  var form = document.getElementById('booking-form');
  if (!form) return;

  var S = window.fcSchedule;
  var track = window.fcTrack || function () {};
  var daysBox = document.getElementById('days');
  var slotsBox = document.getElementById('slots');
  var chosen = document.getElementById('chosen');
  var slotInput = document.getElementById('f-slot');
  var submitBtn = document.getElementById('f-submit');
  var statusEl = document.getElementById('form-status');

  var DAY_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var WEEKDAY_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var SERVICES = ['haircut', 'beard', 'combo', 'kids', 'father_son', 'gift_card'];
  var LEVELS = ['any', 'barber', 'top', 'brand'];

  var selectedDay = 0;          // смещение выбранного дня от сегодня
  var started = new Date();     // «сегодня» фиксируем при открытии страницы

  function dayDate(offset) {
    var d = new Date(started.getFullYear(), started.getMonth(), started.getDate());
    d.setDate(d.getDate() + offset);
    return d;
  }

  /* ---------- 1. Календарь на 14 дней ---------- */
  function renderDays() {
    daysBox.innerHTML = '';
    for (var i = 0; i < 14; i++) {
      var d = dayDate(i);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'day';
      b.dataset.offset = i;
      b.setAttribute('aria-pressed', String(i === selectedDay));
      b.setAttribute('aria-label', d.getDate() + ' ' + MONTHS[d.getMonth()] + (i === 0 ? ', сегодня' : ''));
      b.innerHTML = '<small>' + (i === 0 ? 'сегодня' : DAY_SHORT[d.getDay()]) + '</small><b>' + d.getDate() + '</b>';
      daysBox.appendChild(b);
    }
  }

  /* ---------- 2. Слоты выбранного дня ---------- */
  function renderSlots() {
    slotsBox.innerHTML = '';
    S.SLOT_TIMES.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = t;
      b.dataset.time = t;
      var free = S.isSlotFree(selectedDay, t);
      b.disabled = !free;                                   // занятые слоты неактивны
      b.setAttribute('aria-label', t + (free ? '' : ', занято'));
      var current = slotInput.value === S.isoDate(dayDate(selectedDay)) + ' ' + t;
      b.setAttribute('aria-pressed', String(current));
      slotsBox.appendChild(b);
    });
  }

  function chooseSlot(time, silent) {
    var d = dayDate(selectedDay);
    var date = S.isoDate(d);
    slotInput.value = date + ' ' + time;                    // скрытое поле slot: «ГГГГ-ММ-ДД ЧЧ:ММ»
    chosen.textContent = 'Вы выбрали: ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ', ' + time;
    renderSlots();
    clearError('slot');
    if (!silent) {
      track('slot_select', { slot_date: date, slot_time: time, weekday: WEEKDAY_EN[d.getDay()] });
    }
  }

  daysBox.addEventListener('click', function (e) {
    var b = e.target.closest('.day');
    if (!b) return;
    selectedDay = Number(b.dataset.offset);
    renderDays();
    renderSlots();
  });
  slotsBox.addEventListener('click', function (e) {
    var b = e.target.closest('.slot');
    if (!b || b.disabled) return;
    chooseSlot(b.dataset.time);
  });

  /* ---------- 3. Значения из ссылки (кнопки «Записаться к мастеру» и т. п.) ---------- */
  var q = new URLSearchParams(window.location.search);
  var svcSelect = form.elements.service;
  var lvlSelect = form.elements.master_level;
  var giftNote = document.getElementById('gift-note');
  if (SERVICES.indexOf(q.get('service')) > -1) svcSelect.value = q.get('service');
  if (LEVELS.indexOf(q.get('master_level')) > -1) lvlSelect.value = q.get('master_level');
  function toggleGiftNote() { giftNote.hidden = svcSelect.value !== 'gift_card'; }
  svcSelect.addEventListener('change', toggleGiftNote);
  toggleGiftNote();
  if (q.get('gift')) giftNote.textContent = 'Сертификат на ' + Number(q.get('gift')).toLocaleString('ru-RU') + ' ₽: выберите время, когда удобно забрать его в барбершопе.';

  renderDays();
  var qDate = q.get('date'), qTime = q.get('time');
  if (qDate) {
    for (var i = 0; i < 14; i++) {
      if (S.isoDate(dayDate(i)) === qDate) { selectedDay = i; break; }
    }
    renderDays();
  }
  renderSlots();
  if (qDate && qTime && S.isoDate(dayDate(selectedDay)) === qDate && S.isSlotFree(selectedDay, qTime)) {
    chooseSlot(qTime, true);
  }

  /* ---------- 4. Скрытые поля ---------- */
  function newRequestId() {
    if (window.crypto && crypto.randomUUID) return 'REQ-' + crypto.randomUUID();
    return 'REQ-' + Date.now().toString(16) + '-' + Math.random().toString(16).slice(2, 10);
  }
  var utm = window.fcGetUtm ? window.fcGetUtm() : {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) {
    form.elements[k].value = utm[k] || '';
  });
  form.elements.request_id.value = newRequestId();

  /* ---------- 5. Проверка полей ---------- */
  function setError(field, text, type) {
    var box = form.querySelector('[data-field="' + field + '"]');
    if (box) box.classList.add('has-error');
    var err = document.getElementById('err-' + field);
    if (err) err.textContent = text;
    var input = form.elements[field];
    if (input && input.setAttribute) input.setAttribute('aria-invalid', 'true');
    track('form_error', { field_name: field, error_type: type });
  }
  function clearError(field) {
    var box = form.querySelector('[data-field="' + field + '"]');
    if (box) box.classList.remove('has-error');
    var err = document.getElementById('err-' + field);
    if (err) err.textContent = '';
    var input = form.elements[field];
    if (input && input.removeAttribute) input.removeAttribute('aria-invalid');
  }

  // Телефон приводим к виду +7XXXXXXXXXX
  function normalizePhone(raw) {
    var digits = String(raw).replace(/\D/g, '');
    if (digits.length === 11 && (digits[0] === '8' || digits[0] === '7')) digits = digits.slice(1);
    return digits.length === 10 ? '+7' + digits : null;
  }

  function validate() {
    var ok = true;
    ['slot', 'service', 'master_level', 'name', 'phone', 'email', 'consent'].forEach(clearError);

    if (!slotInput.value) { setError('slot', 'Выберите день и время визита.', 'required'); ok = false; }

    if (SERVICES.indexOf(svcSelect.value) < 0) { setError('service', 'Выберите услугу.', 'required'); ok = false; }
    if (LEVELS.indexOf(lvlSelect.value) < 0) { setError('master_level', 'Выберите уровень мастера.', 'required'); ok = false; }

    var name = form.elements.name.value.trim();
    if (!name) { setError('name', 'Введите имя.', 'required'); ok = false; }
    else if (name.length < 2 || name.length > 60) { setError('name', 'Имя — от 2 до 60 символов.', 'format'); ok = false; }

    var phoneRaw = form.elements.phone.value.trim();
    var phone = normalizePhone(phoneRaw);
    if (!phoneRaw) { setError('phone', 'Введите телефон, чтобы администратор подтвердил запись.', 'required'); ok = false; }
    else if (!phone) { setError('phone', 'Телефон — в формате +7 и 10 цифр, например +7 900 123-45-67.', 'format'); ok = false; }

    var email = form.elements.email.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError('email', 'Проверьте e-mail: в нём нет «@» или домена.', 'format'); ok = false; }

    if (!form.elements.consent.checked) { setError('consent', 'Отметьте согласие на обработку данных — без него запись не отправится.', 'required'); ok = false; }

    return ok ? { phone: phone, name: name, email: email } : null;
  }

  // Ошибка исчезает, как только поле исправили
  form.addEventListener('input', function (e) { if (e.target.name) clearError(e.target.name); });
  form.addEventListener('change', function (e) { if (e.target.name) clearError(e.target.name); });

  /* ---------- 6. Отправка ---------- */
  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle('is-error', !!isError);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    setStatus('', false);
    var valid = validate();
    if (!valid) {
      var firstErr = form.querySelector('.has-error input, .has-error select, .has-error');
      if (firstErr && firstErr.scrollIntoView) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    var data = new URLSearchParams();
    data.append('request_id', form.elements.request_id.value);
    data.append('name', valid.name);
    data.append('phone', valid.phone);
    data.append('email', valid.email);
    data.append('service', svcSelect.value);
    data.append('master_level', lvlSelect.value);
    data.append('slot', slotInput.value);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) {
      data.append(k, form.elements[k].value);
    });

    submitBtn.disabled = true;                       // кнопка неактивна во время отправки
    submitBtn.textContent = 'Отправляем…';

    var controller = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 20000);

    fetch(APPS_SCRIPT_URL, { method: 'POST', body: data, signal: controller ? controller.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        clearTimeout(timer);
        if (res && res.ok === true) {
          // generate_lead — только после ответа {"ok": true}
          track('generate_lead', {
            lead_service: svcSelect.value,
            lead_master_level: lvlSelect.value,
            lead_source: form.elements.utm_source.value
          });
          try {
            sessionStorage.setItem('fc_last_lead', JSON.stringify({
              id: res.request_id || form.elements.request_id.value,
              slot: slotInput.value,
              service: svcSelect.options[svcSelect.selectedIndex].text,
              code: svcSelect.value
            }));
          } catch (err) {}
          setTimeout(function () { window.location.href = 'thanks.html'; }, 400);
        } else {
          throw new Error((res && res.error) || 'unknown');
        }
      })
      .catch(function () {
        clearTimeout(timer);
        track('form_error', { field_name: 'form', error_type: 'server' });
        setStatus('Запись не отправилась: сервер не ответил. Попробуйте ещё раз или позвоните +7 (900) 909-09-90.', true);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Записаться';
      });
  });
})();
