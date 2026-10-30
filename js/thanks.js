/*
 * thanks.js — страница «Спасибо»: номер записи, дата и время,
 * кнопка «Добавить в календарь» скачивает файл .ics.
 */
(function () {
  'use strict';
  var MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var ADDRESS = 'Новоозёрск\\, ул. Кузнечная\\, д. 5';   // запятые в .ics экранируются

  var lead = null;
  try { lead = JSON.parse(sessionStorage.getItem('fc_last_lead') || 'null'); } catch (e) {}
  var btn = document.getElementById('add-calendar');

  if (!lead || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(lead.slot)) {
    document.getElementById('t-missing').hidden = false;
    btn.hidden = true;
    return;
  }

  var parts = lead.slot.split(' ');
  var d = parts[0].split('-').map(Number);       // [год, месяц, день]
  var time = parts[1];
  document.getElementById('t-id').textContent = lead.id;
  document.getElementById('t-date').textContent = d[2] + ' ' + MONTHS[d[1] - 1] + ' ' + d[0];
  document.getElementById('t-time').textContent = time;
  document.getElementById('t-service').textContent = lead.service;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  btn.addEventListener('click', function () {
    var h = parseInt(time, 10);
    var minutes = lead.code === 'combo' ? 90 : 60;          // стрижка + борода — 90 минут
    var start = new Date(d[0], d[1] - 1, d[2], h, 0);
    var end = new Date(start.getTime() + minutes * 60000);
    function stamp(x) {
      return x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' + pad(x.getHours()) + pad(x.getMinutes()) + '00';
    }
    var now = new Date();
    var nowUtc = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' +
                 pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fade Club//Booking//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Moscow',
      'BEGIN:STANDARD',
      'DTSTART:19700101T000000',
      'TZOFFSETFROM:+0300',
      'TZOFFSETTO:+0300',
      'TZNAME:MSK',
      'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:' + lead.id + '@fadeclub',
      'DTSTAMP:' + nowUtc,
      'DTSTART;TZID=Europe/Moscow:' + stamp(start),
      'DTEND;TZID=Europe/Moscow:' + stamp(end),
      'SUMMARY:Фейд Клаб — ' + lead.service,
      'LOCATION:Барбершоп «Фейд Клаб»\\, ' + ADDRESS,
      'DESCRIPTION:Номер записи ' + lead.id + '. Телефон +7 (900) 909-09-90.',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Скоро визит в «Фейд Клаб»',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fadeclub-' + parts[0] + '.ics';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
})();
