/*
 * main.js — общий код для всех страниц:
 * меню, сохранение UTM-меток, фильтры, расписание свободного времени.
 * События отправляются через window.fcTrack из analytics.js.
 */
(function () {
  'use strict';

  /* ---------- 1. Меню на телефоне ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
  }

  /* ---------- 2. UTM-метки ----------
     Метки читаются из адреса страницы и сохраняются в sessionStorage,
     чтобы не потеряться, пока посетитель ходит по сайту до формы (ТЗ, п. 6.3). */
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  try {
    var query = new URLSearchParams(window.location.search);
    if (query.get('utm_source')) {             // новые метки заменяют старые целиком
      UTM_KEYS.forEach(function (key) {
        var value = (query.get(key) || '').toLowerCase().slice(0, 100);
        sessionStorage.setItem('fc_' + key, value);
      });
    }
  } catch (e) { /* sessionStorage недоступен — метки просто не сохранятся */ }

  window.fcGetUtm = function () {
    var defaults = { utm_source: 'direct', utm_medium: 'none', utm_campaign: 'not_set', utm_content: 'not_set' };
    var result = {};
    UTM_KEYS.forEach(function (key) {
      var v = '';
      try { v = sessionStorage.getItem('fc_' + key) || ''; } catch (e) {}
      result[key] = v || defaults[key];
    });
    return result;
  };

  /* ---------- 3. Фильтры (мастера и работы) ----------
     Кнопки в [data-filter-group], карточки — в следующем за ним [data-filter-target].
     Карточка показывается, если её data-type / data-level совпадает с фильтром. */
  document.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var target = group.parentElement.querySelector('[data-filter-target]');
    if (!target) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      var value = btn.dataset.filter;
      group.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      Array.prototype.forEach.call(target.children, function (card) {
        var key = card.dataset.type || card.dataset.level;
        card.hidden = !(value === 'all' || key === value);
      });
    });
  });

  /* ---------- 4. Строка таблицы цен ведёт в форму записи ---------- */
  document.querySelectorAll('.price-table tr[data-service-name]').forEach(function (row) {
    row.addEventListener('click', function () {
      var map = { gray_camo: 'haircut' };
      var svc = row.dataset.serviceName;
      setTimeout(function () {                 // даём событию service_view уйти в GA4
        window.location.href = 'contacts.html?service=' + (map[svc] || svc);
      }, 150);
    });
  });

  /* ---------- 5. Расписание: занятые слоты ----------
     Занятые слоты задаются массивом: [смещение в днях от сегодня, 'ЧЧ:ММ'].
     Слоты — каждый час с 10:00 до 21:00 (ТЗ, п. 3.3). */
  var BUSY_SLOTS = [
    [0, '11:00'], [0, '12:00'], [0, '15:00'], [0, '19:00'], [0, '20:00'],
    [1, '10:00'], [1, '13:00'], [1, '19:00'],
    [2, '12:00'], [2, '17:00'], [2, '18:00'], [2, '20:00'],
    [3, '11:00'], [3, '14:00'],
    [4, '16:00'], [4, '19:00'], [4, '20:00'], [4, '21:00'],
    [5, '10:00'], [5, '11:00'], [5, '12:00'], [5, '18:00'],
    [6, '13:00'], [6, '17:00'],
    [7, '15:00'], [7, '19:00'],
    [9, '12:00'], [9, '18:00'],
    [10, '11:00'], [10, '20:00'],
    [12, '14:00'], [12, '16:00'],
    [13, '19:00']
  ];
  var SLOT_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
                    '17:00', '18:00', '19:00', '20:00', '21:00'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  // Слот недоступен, если он занят или уже прошёл
  function isSlotFree(dayOffset, time) {
    var busy = BUSY_SLOTS.some(function (s) { return s[0] === dayOffset && s[1] === time; });
    if (busy) return false;
    if (dayOffset === 0) {
      var now = new Date();
      var h = parseInt(time, 10);
      if (h <= now.getHours()) return false;
    }
    return true;
  }

  window.fcSchedule = { SLOT_TIMES: SLOT_TIMES, isSlotFree: isSlotFree, isoDate: isoDate, pad: pad };

  /* ---------- 6. «Свободно сегодня» на первом экране ---------- */
  var today = document.querySelector('[data-today-slots]');
  if (today) {
    var box = today.querySelector('.today__slots');
    var date = isoDate(new Date());
    var free = SLOT_TIMES.filter(function (t) { return isSlotFree(0, t); });
    if (!free.length) {
      today.querySelector('.today__title').textContent = 'На сегодня всё занято — выберите время на завтра';
      var a = document.createElement('a');
      a.href = 'contacts.html';
      a.textContent = 'Выбрать время';
      box.appendChild(a);
    } else {
      SLOT_TIMES.filter(function (t) { return parseInt(t, 10) > new Date().getHours(); }).forEach(function (t) {
        var el = document.createElement('a');
        el.textContent = t;
        if (isSlotFree(0, t)) {
          el.href = 'contacts.html?date=' + date + '&time=' + t;
          el.setAttribute('data-event', 'cta_click');
          el.setAttribute('data-button-name', 'hero_slot');
          el.setAttribute('data-page-section', 'hero');
          el.setAttribute('aria-label', 'Записаться на сегодня, ' + t);
        } else {
          el.className = 'is-busy';
          el.setAttribute('aria-label', t + ' занято');
        }
        box.appendChild(el);
      });
    }
  }
})();
