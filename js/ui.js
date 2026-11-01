/* Слой представления: строит разметку текста по словам,
   красит символы, двигает каретку и обновляет числа. */

(function () {
  const TT = (window.TT = window.TT || {});

  const el = {};
  const spans = [];
  let target = "";
  let caretEl = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function init() {
    el.text = byId("text");
    el.board = byId("board");
    el.overlay = byId("overlay");
    el.progress = byId("progress");
    el.input = byId("input");
    el.best = byId("best");
    el.results = byId("results");
    el.recordBadge = byId("record-badge");
    el.modeButtons = Array.from(document.querySelectorAll("[data-seconds]"));
    el.langButtons = Array.from(document.querySelectorAll("[data-lang]"));

    el.stats = {
      wpm: byId("stat-wpm"),
      accuracy: byId("stat-accuracy"),
      time: byId("stat-time"),
      errors: byId("stat-errors")
    };

    el.res = {
      wpm: byId("res-wpm"),
      accuracy: byId("res-accuracy"),
      chars: byId("res-chars"),
      errors: byId("res-errors")
    };
  }

  function makeChar(ch) {
    const span = document.createElement("span");
    span.className = "ch pending";
    span.textContent = ch;
    spans.push(span);
    return span;
  }

  /* Слова оборачиваются в inline-block-подобные span'ы с nowrap,
     чтобы слово не рвалось между строками. */
  function appendText(str) {
    target += str;
    const fragment = document.createDocumentFragment();
    let i = 0;

    while (i < str.length) {
      let end = str.indexOf(" ", i);
      if (end === -1) end = str.length;

      if (end > i) {
        const word = document.createElement("span");
        word.className = "word";
        for (let j = i; j < end; j++) {
          word.appendChild(makeChar(str[j]));
        }
        fragment.appendChild(word);
      }

      if (end < str.length) {
        fragment.appendChild(makeChar(" "));
        i = end + 1;
      } else {
        i = end;
      }
    }

    el.text.appendChild(fragment);
  }

  function setTarget(str) {
    el.text.textContent = "";
    spans.length = 0;
    caretEl = null;
    target = "";
    appendText(str);
    el.text.scrollTop = 0;
  }

  function setCaret(index) {
    if (caretEl) caretEl.classList.remove("caret");

    const current = spans[Math.min(index, spans.length - 1)];
    if (!current) return;

    current.classList.add("caret");
    caretEl = current;

    // Контейнер ровно в три строки — значит одна строка это треть высоты.
    // Держим каретку на второй видимой строке, чтобы был виден контекст.
    const lineHeight = el.text.clientHeight / 3 || current.offsetHeight || 1;
    el.text.scrollTop = Math.max(0, current.offsetTop - lineHeight);
  }

  function clearCaret() {
    if (caretEl) caretEl.classList.remove("caret");
    caretEl = null;
  }

  function update(typed) {
    for (let i = 0; i < spans.length; i++) {
      let cls = "ch";
      if (i < typed.length) {
        cls += typed[i] === target[i] ? " correct" : " incorrect";
      } else {
        cls += " pending";
      }
      if (spans[i].className !== cls) spans[i].className = cls;
    }

    setCaret(typed.length);
  }

  function renderStats(s) {
    el.stats.wpm.textContent = String(s.wpm);
    el.stats.accuracy.textContent = s.accuracy + "%";
    el.stats.time.textContent = s.secondsLeft + " с";
    el.stats.errors.textContent = String(s.errors);
  }

  function setProgress(ratio) {
    const clamped = Math.min(1, Math.max(0, ratio));
    el.progress.style.width = (clamped * 100).toFixed(2) + "%";
  }

  function showOverlay(visible) {
    el.overlay.classList.toggle("is-hidden", !visible);
    el.overlay.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  function showResults(r) {
    el.res.wpm.textContent = String(r.wpm);
    el.res.accuracy.textContent = r.accuracy + "%";
    el.res.chars.textContent = r.correct + "/" + r.typed;
    el.res.errors.textContent = String(r.errors);
    el.recordBadge.hidden = !r.isRecord;
    el.results.hidden = false;
  }

  function hideResults() {
    el.results.hidden = true;
    el.recordBadge.hidden = true;
  }

  function setBest(wpm) {
    el.best.textContent = wpm > 0 ? "Рекорд: " + wpm + " WPM" : "Рекорд: —";
  }

  function setMode(seconds) {
    for (const btn of el.modeButtons) {
      btn.setAttribute(
        "aria-pressed",
        Number(btn.dataset.seconds) === seconds ? "true" : "false"
      );
    }
  }

  function setLang(lang) {
    for (const btn of el.langButtons) {
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    }
  }

  function focusInput() {
    try {
      el.input.focus({ preventScroll: true });
    } catch (e) {
      el.input.focus();
    }
  }

  TT.ui = {
    init,
    setTarget,
    appendText,
    update,
    clearCaret,
    renderStats,
    setProgress,
    showOverlay,
    showResults,
    hideResults,
    setBest,
    setMode,
    setLang,
    focusInput
  };
})();
