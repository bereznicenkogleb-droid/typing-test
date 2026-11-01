/* Точка входа: состояние теста, таймер, ввод и localStorage. */

(function () {
  const TT = window.TT;

  const STORAGE = {
    prefs: "typing-test.prefs.v1",
    best: "typing-test.best.v1"
  };

  const state = {
    seconds: 30,
    lang: "ru",
    base: "",
    target: "",
    typed: "",
    status: "idle", // idle | running | finished
    startedAt: 0,
    timerId: 0,
    keystrokes: 0,
    errors: 0,
    textIndex: -1
  };

  let input = null;
  let board = null;

  /* --- Storage ------------------------------------------------------------ */

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* приватный режим или переполнение — молча игнорируем */
    }
  }

  function bestKey(lang, seconds) {
    return lang + ":" + seconds;
  }

  function getBest(lang, seconds) {
    const all = readJSON(STORAGE.best, {});
    const record = all[bestKey(lang, seconds)];
    return record && typeof record.wpm === "number" ? record.wpm : 0;
  }

  function saveBest(lang, seconds, wpm) {
    const all = readJSON(STORAGE.best, {});
    all[bestKey(lang, seconds)] = { wpm, date: Date.now() };
    writeJSON(STORAGE.best, all);
  }

  function savePrefs() {
    writeJSON(STORAGE.prefs, { seconds: state.seconds, lang: state.lang });
  }

  /* --- Test lifecycle ----------------------------------------------------- */

  function stopTimer() {
    if (state.timerId) {
      window.clearInterval(state.timerId);
      state.timerId = 0;
    }
  }

  function reset(useNewText) {
    stopTimer();

    if (useNewText || !state.base) {
      const picked = TT.engine.pick(TT.TEXTS[state.lang], state.textIndex);
      state.textIndex = picked.index;
      state.base = picked.text;
    }

    state.target = state.base + " ";
    state.typed = "";
    state.keystrokes = 0;
    state.errors = 0;
    state.status = "idle";
    state.startedAt = 0;

    input.value = "";
    TT.ui.setTarget(state.target);
    TT.ui.update("");
    TT.ui.setProgress(0);
    TT.ui.hideResults();
    TT.ui.showOverlay(true);
    renderLive();
    renderBest();
    TT.ui.focusInput();
  }

  function renderBest() {
    TT.ui.setBest(getBest(state.lang, state.seconds));
  }

  function ensureTextAhead() {
    while (state.target.length - state.typed.length < 60) {
      const picked = TT.engine.pick(TT.TEXTS[state.lang], state.textIndex);
      state.textIndex = picked.index;
      const chunk = picked.text + " ";
      state.target += chunk;
      TT.ui.appendText(chunk);
    }
  }

  function renderLive() {
    const elapsedMs =
      state.status === "running" ? performance.now() - state.startedAt : 0;
    const leftMs = Math.max(0, state.seconds * 1000 - elapsedMs);

    const stats = TT.engine.calcStats(
      state.typed,
      state.target,
      Math.max(elapsedMs, 1),
      state.keystrokes,
      state.errors
    );

    // В первую секунду WPM математически огромный — показываем 0, пока нет базы.
    const wpm = elapsedMs >= 1000 ? stats.wpm : 0;

    TT.ui.renderStats({
      wpm,
      accuracy: stats.accuracy,
      secondsLeft: Math.ceil(leftMs / 1000),
      errors: state.errors
    });

    TT.ui.setProgress(elapsedMs / (state.seconds * 1000));
  }

  function startTimer() {
    state.startedAt = performance.now();
    state.timerId = window.setInterval(tick, 100);
  }

  function tick() {
    if (state.status !== "running") return;

    const elapsed = performance.now() - state.startedAt;
    renderLive();

    if (elapsed >= state.seconds * 1000) finish();
  }

  function finish() {
    if (state.status === "finished") return;

    stopTimer();
    state.status = "finished";

    const stats = TT.engine.calcStats(
      state.typed,
      state.target,
      state.seconds * 1000,
      state.keystrokes,
      state.errors
    );

    TT.ui.renderStats({
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      secondsLeft: 0,
      errors: stats.errors
    });
    TT.ui.setProgress(1);
    TT.ui.showOverlay(false);
    TT.ui.clearCaret();

    const previousBest = getBest(state.lang, state.seconds);
    const isRecord = stats.wpm > previousBest && stats.wpm > 0;
    if (isRecord) saveBest(state.lang, state.seconds, stats.wpm);

    TT.ui.showResults({
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      correct: stats.correct,
      typed: stats.typed,
      errors: stats.errors,
      isRecord
    });

    renderBest();
  }

  /* --- Input -------------------------------------------------------------- */

  function onInput() {
    if (state.status === "finished") {
      input.value = state.typed;
      return;
    }

    let value = input.value.replace(/[\r\n\t]/g, "");
    if (value.length > state.target.length) {
      value = value.slice(0, state.target.length);
    }

    if (state.status === "idle" && value.length > 0) {
      state.status = "running";
      startTimer();
      TT.ui.showOverlay(false);
    }

    if (value.length > state.typed.length) {
      for (let i = state.typed.length; i < value.length; i++) {
        state.keystrokes++;
        if (value[i] !== state.target[i]) state.errors++;
      }
    }

    state.typed = value;
    if (input.value !== value) input.value = value;

    TT.ui.update(value);
    ensureTextAhead();
    renderLive();
  }

  /* --- Controls ----------------------------------------------------------- */

  function syncControls() {
    TT.ui.setMode(state.seconds);
    TT.ui.setLang(state.lang);
    document.documentElement.lang = state.lang;
  }

  function bindEvents() {
    input.addEventListener("input", onInput);
    input.addEventListener("paste", function (e) {
      e.preventDefault();
    });
    input.addEventListener("drop", function (e) {
      e.preventDefault();
    });
    input.addEventListener("blur", function () {
      board.classList.remove("is-focused");
    });
    input.addEventListener("focus", function () {
      board.classList.add("is-focused");
    });

    board.addEventListener("click", TT.ui.focusInput);

    for (const btn of document.querySelectorAll("[data-seconds]")) {
      btn.addEventListener("click", function () {
        const seconds = Number(btn.dataset.seconds);
        if (seconds === state.seconds) return;
        state.seconds = seconds;
        savePrefs();
        syncControls();
        reset(true);
      });
    }

    for (const btn of document.querySelectorAll("[data-lang]")) {
      btn.addEventListener("click", function () {
        if (btn.dataset.lang === state.lang) return;
        state.lang = btn.dataset.lang;
        savePrefs();
        syncControls();
        reset(true);
      });
    }

    document.getElementById("again").addEventListener("click", function () {
      reset(false);
    });
    document.getElementById("next").addEventListener("click", function () {
      reset(true);
    });

    document.addEventListener("keydown", function (e) {
      const typing = document.activeElement === input;

      if (e.key === "Tab" && typing && !e.shiftKey) {
        e.preventDefault();
        reset(false);
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        reset(true);
        return;
      }

      if (e.key === "Enter" && typing && state.status === "finished") {
        e.preventDefault();
        reset(true);
        return;
      }

      // Клик по странице мог снять фокус — возвращаем его, чтобы ввод не терялся.
      if (!typing && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        TT.ui.focusInput();
      }
    });
  }

  /* --- Init --------------------------------------------------------------- */

  function init() {
    TT.ui.init();

    input = document.getElementById("input");
    board = document.getElementById("board");

    const prefs = readJSON(STORAGE.prefs, {});
    if (TT.MODES.indexOf(prefs.seconds) !== -1) state.seconds = prefs.seconds;
    if (prefs.lang === "en" || prefs.lang === "ru") state.lang = prefs.lang;

    bindEvents();
    syncControls();
    reset(true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
