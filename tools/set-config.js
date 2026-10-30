#!/usr/bin/env node
/*
 * Подставляет в сайт ваши настройки одной командой:
 *   node tools/set-config.js --ga G-ABC123XYZ
 *   node tools/set-config.js --script https://script.google.com/macros/s/AKfy.../exec
 *   node tools/set-config.js --site https://tz-09-barbershop-feyd-klab-fawn.vercel.app
 * Можно передать всё сразу. Скрипт заменяет текущие значения, поэтому его можно запускать повторно.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const get = (k) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null; };
const ga = get('--ga'), script = get('--script'), site = get('--site');
if (!ga && !script && !site) { console.log('Укажите --ga, --script и/или --site'); process.exit(1); }

const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
function edit(file, fn) {
  const p = path.join(root, file);
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before);
  if (after !== before) { fs.writeFileSync(p, after); console.log('изменён', file); }
}

if (ga) {
  if (!/^G-[A-Z0-9]{6,12}$/.test(ga)) { console.log('Идентификатор GA4 должен быть вида G-XXXXXXXXXX'); process.exit(1); }
  htmlFiles.forEach((f) => edit(f, (s) => s.replace(/G-[A-Z0-9]{6,12}/g, ga)));
}
if (script) {
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(script)) { console.log('Нужен URL веб-приложения вида https://script.google.com/macros/s/…/exec'); process.exit(1); }
  edit('js/form.js', (s) => s.replace(/var APPS_SCRIPT_URL = '[^']*';/, `var APPS_SCRIPT_URL = '${script}';`));
}
if (site) {
  const clean = site.replace(/\/$/, '');
  const re = /https:\/\/[a-z0-9-]+\.vercel\.app/g;
  htmlFiles.concat(['docs/utm.csv', 'sitemap.xml', 'robots.txt', 'README.md']).forEach((f) => {
    if (fs.existsSync(path.join(root, f))) edit(f, (s) => s.replace(re, clean));
  });
}
console.log('Готово. Проверьте изменения: git diff');
