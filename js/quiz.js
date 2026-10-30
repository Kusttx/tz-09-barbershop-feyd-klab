/*
 * quiz.js — тест «Форма лица» на странице style-quiz.html.
 * 4 вопроса → форма лица → 3 рекомендованные стрижки и промокод FIRST20.
 */
(function () {
  'use strict';
  var quiz = document.getElementById('quiz');
  if (!quiz) return;
  var track = window.fcTrack || function () {};

  var SHAPES = {
    oval:   { name: 'Овальная',      text: 'Подходит почти любая стрижка. Сохраняйте пропорции: умеренный объём сверху и аккуратные виски.',
              recs: [['fade-01', 'Скин-фейд с текстурой'], ['classic-03', 'Помпадур'], ['crop-02', 'Французский кроп']] },
    round:  { name: 'Круглая',       text: 'Вытягиваем силуэт: объём сверху и короткие бока зрительно удлиняют лицо.',
              recs: [['fade-04', 'Тейпер-фейд'], ['classic-04', 'Квифф'], ['beard-05', 'Щетина с контуром']] },
    square: { name: 'Квадратная',    text: 'Сильная челюсть — ваше преимущество. Текстура сверху смягчает углы.',
              recs: [['crop-01', 'Текстурный кроп'], ['fade-02', 'Мид-фейд'], ['classic-01', 'Классика с пробором']] },
    long:   { name: 'Вытянутая',     text: 'Добавляем ширину: чёлка и не слишком короткие бока делают лицо пропорциональнее.',
              recs: [['crop-03', 'Кроп с чёлкой'], ['classic-05', 'Канадка'], ['beard-02', 'Короткая борода']] }
  };

  var steps = quiz.querySelectorAll('.quiz__step');
  var bar = quiz.querySelector('.quiz__progress i');
  var result = document.getElementById('quiz-result');
  var answers = [];

  function show(n) {
    steps.forEach(function (s, i) { s.hidden = i !== n; });
    bar.style.width = ((n + 1) / steps.length * 100) + '%';
    var first = steps[n] && steps[n].querySelector('button');
    if (first && n > 0) first.focus();
  }

  // Побеждает форма, которую выбирали чаще; при равенстве — ответ на первый вопрос
  function decide() {
    var count = {};
    answers.forEach(function (a) { count[a] = (count[a] || 0) + 1; });
    var best = answers[0];
    Object.keys(count).forEach(function (k) { if (count[k] > count[best]) best = k; });
    return best;
  }

  quiz.addEventListener('click', function (e) {
    var b = e.target.closest('.quiz__opts button');
    if (!b) return;
    answers.push(b.dataset.shape);
    if (answers.length < steps.length) { show(answers.length); return; }

    var shape = decide();
    var data = SHAPES[shape];
    steps.forEach(function (s) { s.hidden = true; });
    bar.style.width = '100%';
    document.getElementById('result-shape').textContent = data.name;
    document.getElementById('result-text').textContent = data.text;
    document.getElementById('result-recs').innerHTML = data.recs.map(function (r) {
      return '<figure><img src="img/works/' + r[0] + '.webp" alt="' + r[1] + '" width="600" height="600" loading="lazy"><figcaption><b>' + r[1] + '</b></figcaption></figure>';
    }).join('');
    result.classList.add('is-shown');
    result.querySelector('.result__shape').setAttribute('tabindex', '-1');
    result.querySelector('.result__shape').focus();
    track('face_quiz_complete', { face_shape: shape });
  });

  document.getElementById('quiz-restart').addEventListener('click', function () {
    answers = [];
    result.classList.remove('is-shown');
    show(0);
  });

  // Копирование промокода
  var status = document.getElementById('promo-status');
  document.getElementById('promo-copy').addEventListener('click', function () {
    var code = document.getElementById('promo-code').textContent.trim();
    function done() { status.textContent = 'Скопировано'; track('promo_copy', { promo_code: code }); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done, function () { status.textContent = 'Выделите код и скопируйте вручную'; });
    } else {
      var r = document.createRange();
      r.selectNodeContents(document.getElementById('promo-code'));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      try { document.execCommand('copy'); done(); } catch (err) {}
    }
  });

  show(0);
})();
