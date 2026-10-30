/**
 * Приёмник заявок «Фейд Клаб» — Google Apps Script, веб-приложение.
 * Таблица «FadeClub — Bookings», лист leads (ТЗ, раздел 6).
 *
 * Как развернуть:
 *  1. Откройте таблицу → Расширения → Apps Script, вставьте этот код.
 *  2. Один раз запустите setupSheet() — создаст заголовки, выпадающий список статусов
 *     и условное форматирование.
 *  3. Развернуть → Новое развёртывание → Веб-приложение:
 *     «Запуск от имени» — Я, «Доступ» — Все. Скопируйте URL в js/form.js (APPS_SCRIPT_URL).
 */

// Идентификатор таблицы (часть адреса между /d/ и /edit). Если скрипт создан
// из самой таблицы, можно оставить пустым — возьмётся активная таблица.
var SPREADSHEET_ID = '';
var SHEET_NAME = 'leads';

var HEADERS = ['request_id', 'created_at', 'name', 'phone', 'email', 'service', 'master_level',
               'slot', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'status'];
var SERVICES = ['haircut', 'beard', 'combo', 'kids', 'father_son', 'gift_card'];
var LEVELS = ['any', 'barber', 'top', 'brand'];
var STATUSES = ['new', 'confirmed', 'reminded', 'visited', 'no_show'];
var UTM_DEFAULTS = { utm_source: 'direct', utm_medium: 'none', utm_campaign: 'not_set', utm_content: 'not_set' };
var MAX_LEN = 200;

function getSheet_() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  return sh;
}

// Ответ в формате JSON: {"ok": true, ...} или {"ok": false, "error": "..."}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Значение поля: строка без пробелов по краям
function field_(p, name) {
  return p[name] === undefined || p[name] === null ? '' : String(p[name]).trim();
}

// Защита от формул: значение, начинающееся с = + - @, таблица не будет вычислять
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  var p = (e && e.parameter) || {};

  // --- 1. Проверка данных ---
  var data = {};
  HEADERS.forEach(function (h) { data[h] = field_(p, h); });

  for (var key in data) {
    if (data[key].length > MAX_LEN) return json_({ ok: false, error: key + ': длиннее ' + MAX_LEN + ' символов' });
  }
  if (!/^REQ-[0-9a-zA-Z-]{8,60}$/.test(data.request_id)) return json_({ ok: false, error: 'request_id: неверный формат' });
  if (data.name.length < 2 || data.name.length > 60) return json_({ ok: false, error: 'name: от 2 до 60 символов' });
  if (!/^\+7\d{10}$/.test(data.phone)) return json_({ ok: false, error: 'phone: нужен формат +7 и 10 цифр' });
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return json_({ ok: false, error: 'email: неверный формат' });
  if (SERVICES.indexOf(data.service) < 0) return json_({ ok: false, error: 'service: недопустимое значение' });
  if (LEVELS.indexOf(data.master_level) < 0) return json_({ ok: false, error: 'master_level: недопустимое значение' });

  // slot: «ГГГГ-ММ-ДД ЧЧ:ММ», с 10:00 до 21:00, не в прошлом
  var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(data.slot);
  if (!m) return json_({ ok: false, error: 'slot: нужен формат ГГГГ-ММ-ДД ЧЧ:ММ' });
  var slotDate = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);   // часовой пояс скрипта — Москва
  var hour = +m[4];
  if (isNaN(slotDate.getTime()) || hour < 10 || hour > 21 || m[5] !== '00') return json_({ ok: false, error: 'slot: время вне расписания' });
  if (slotDate.getTime() < Date.now() - 5 * 60 * 1000) return json_({ ok: false, error: 'slot: время уже прошло' });

  // пустые метки заменяем значениями по умолчанию
  Object.keys(UTM_DEFAULTS).forEach(function (k) {
    data[k] = data[k] ? data[k].toLowerCase() : UTM_DEFAULTS[k];
  });

  // --- 2. Запись с блокировкой, чтобы два одновременных запроса не создали дубль ---
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return json_({ ok: false, error: 'server: таблица занята, повторите' });
  }
  try {
    var sh = getSheet_();
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

    // повторная отправка с тем же request_id не создаёт вторую строку
    var found = sh.getRange(1, 1, sh.getLastRow(), 1).createTextFinder(data.request_id).matchEntireCell(true).findNext();
    if (found) return json_({ ok: false, error: 'duplicate: заявка ' + data.request_id + ' уже записана' });

    // created_at и status ставит приёмник; status из браузера игнорируется
    var row = [
      data.request_id, new Date(), safe_(data.name), "'" + data.phone, safe_(data.email),
      data.service, data.master_level, slotDate,
      safe_(data.utm_source), safe_(data.utm_medium), safe_(data.utm_campaign), safe_(data.utm_content),
      'new'
    ];
    sh.appendRow(row);
    var last = sh.getLastRow();
    sh.getRange(last, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sh.getRange(last, 8).setNumberFormat('yyyy-mm-dd hh:mm');
    return json_({ ok: true, request_id: data.request_id });
  } finally {
    lock.releaseLock();
  }
}

// Проверка, что веб-приложение отвечает (открыть URL в браузере)
function doGet() {
  return json_({ ok: true, service: 'FadeClub bookings', method: 'use POST' });
}

/**
 * Запустить один раз вручную: заголовки, проверка данных и условное форматирование (ТЗ, п. 6.1).
 */
function setupSheet() {
  var sh = getSheet_();
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#141414').setFontColor('#EDE6DA');
  sh.setFrozenRows(1);
  var rows = sh.getMaxRows() - 1;

  // выпадающие списки: service, master_level, status — другое значение отклоняется
  function list(col, values) {
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
    sh.getRange(2, col, rows, 1).setDataValidation(rule);
  }
  list(6, SERVICES);
  list(7, LEVELS);
  list(13, STATUSES);

  // условное форматирование: пустые обязательные ячейки и повторяющиеся request_id
  var rules = [];
  var required = ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  required.forEach(function (c) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(COUNTA($A2:$M2)>0,ISBLANK(' + c + '2))')
      .setBackground('#F6C9C4')
      .setRanges([sh.getRange(c + '2:' + c)]).build());
  });
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=AND($A2<>"",COUNTIF($A:$A,$A2)>1)')
    .setBackground('#F2A196').setBold(true)
    .setRanges([sh.getRange('A2:A')]).build());
  // цвет статуса
  [['visited', '#D7EBD3'], ['no_show', '#E9E2D6'], ['confirmed', '#F3E3BE'], ['reminded', '#F0D9A6']].forEach(function (s) {
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s[0]).setBackground(s[1])
      .setRanges([sh.getRange('M2:M')]).build());
  });
  sh.setConditionalFormatRules(rules);
  sh.autoResizeColumns(1, HEADERS.length);
}
