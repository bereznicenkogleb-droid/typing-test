/* Чистая логика без DOM: расчёт статистики и выбор текста.
   WPM = (верно набранные символы / 5) / минуты.
   Точность = (нажатия - ошибки) / нажатия. Ошибки считаются по факту ввода,
   поэтому исправленные backspace'ом промахи всё равно влияют на точность. */

(function () {
  const TT = (window.TT = window.TT || {});

  const CHARS_PER_WORD = 5;

  function calcStats(typed, target, elapsedMs, keystrokes, errors) {
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++;
    }

    const incorrect = typed.length - correct;
    const minutes = Math.max(elapsedMs, 1) / 60000;
    const wpm = typed.length
      ? Math.round(correct / CHARS_PER_WORD / minutes)
      : 0;

    const accuracy =
      keystrokes > 0
        ? Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 100))
        : 100;

    return {
      wpm: Math.max(0, wpm),
      accuracy,
      correct,
      incorrect,
      typed: typed.length,
      keystrokes,
      errors
    };
  }

  function pick(texts, previousIndex) {
    if (!texts.length) return { index: -1, text: "" };
    if (texts.length === 1) return { index: 0, text: texts[0] };

    let index = Math.floor(Math.random() * texts.length);
    while (index === previousIndex) {
      index = Math.floor(Math.random() * texts.length);
    }
    return { index, text: texts[index] };
  }

  TT.engine = { calcStats, pick, CHARS_PER_WORD };
})();
