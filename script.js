"use strict";

const DIFFICULTIES = {
  easy: { max: 5, guesses: 20 },
  moderate: { max: 50, guesses: 10 },
  hard: { max: 100, guesses: 5 },
};

let current = { name: null, target: null, remaining: 0 };

const getRandomInt = (max) => Math.floor(Math.random() * (max + 1));

function showModal(id) {
  const el = document.getElementById(id);
  if (!el || typeof bootstrap === "undefined") return;
  const modal = new bootstrap.Modal(el);
  modal.show();
}

function updateGuessesText() {
  const el = document.getElementById("guesses");
  if (!el) return;
  el.textContent = current.name ? `Tries Remaining: ${current.remaining}` : "";
}

function setDifficulty(level) {
  const cfg = DIFFICULTIES[level];
  if (!cfg) return;
  current.name = level;
  current.target = getRandomInt(cfg.max);
  current.remaining = cfg.guesses;

  const input = document.getElementById("inputNum");
  const guessBtn = document.getElementById("guessBtn");
  const cardArea = document.getElementById("cardArea");

  if (input) {
    input.disabled = false;
    input.max = cfg.max;
    input.placeholder = `Enter a number 0–${cfg.max}`;
  }
  // show range for this difficulty
  const rangeEl = document.getElementById("rangeDisplay");
  if (rangeEl) rangeEl.textContent = `Range: 0–${cfg.max}`;
  if (guessBtn) guessBtn.disabled = false;
  if (cardArea) cardArea.innerHTML = ""; // clear hints / buttons

  // clear any previous validation modal text
  const chooseEl = document.getElementById("chooseModal");
  if (chooseEl) {
    const body = chooseEl.querySelector(".modal-body");
    if (body)
      body.textContent =
        "Please select a valid number within the allowed range.";
  }

  updateGuessesText();
}

function checkGuess() {
  const input = document.getElementById("inputNum");
  if (!input) return;
  const raw = input.value.trim();
  if (raw === "") {
    showModal("emptyModal");
    return;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    showModal("letterModal");
    input.value = "";
    return;
  }
  const min = 0;
  const cfgMax = DIFFICULTIES[current.name]?.max;

  // if difficulty not selected, prompt user to pick one
  if (!current.name || typeof cfgMax === "undefined") {
    const chooseEl = document.getElementById("chooseModal");
    if (chooseEl) {
      const body = chooseEl.querySelector(".modal-body");
      if (body) body.textContent = "Please choose a difficulty first.";
    }
    showModal("chooseModal");
    return;
  }

  const max = cfgMax;
  if (value < min || value > max) {
    const chooseEl = document.getElementById("chooseModal");
    if (chooseEl) {
      const body = chooseEl.querySelector(".modal-body");
      if (body)
        body.textContent = `Please select a number between ${min} and ${max}.`;
    }
    showModal("chooseModal");
    input.value = "";
    return;
  }

  current.remaining -= 1;
  const cardArea = document.getElementById("cardArea");

  // show result / hint with simple animation
  if (cardArea) {
    const hintEl = document.createElement("div");
    hintEl.className = "hint text-center fw-bold";

    if (value === current.target) {
      showModal("winnerModal");
      hintEl.innerHTML =
        '<i class="bi bi-trophy-fill text-warning me-2"></i>Correct!';
    } else {
      const icon =
        value > current.target
          ? "bi-arrow-down-circle-fill"
          : "bi-arrow-up-circle-fill";
      const text = value > current.target ? "Try Lower." : "Try Higher.";
      hintEl.innerHTML = `<i class="bi ${icon} me-2"></i>${text}<div class="h2 mt-2">${value}</div>`;
    }

    // clear and insert with small show animation
    cardArea.innerHTML = "";
    cardArea.appendChild(hintEl);
    requestAnimationFrame(() => hintEl.classList.add("show"));
  }

  input.value = "";
  updateGuessesText();

  if (current.remaining <= 0 && value !== current.target) {
    showModal("loseModal");
  }
}

function resetGame() {
  window.location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const cardArea = document.getElementById("cardArea");
  if (cardArea && !document.getElementById("easyBtn")) {
    cardArea.innerHTML = `
      <button class="btn btn-danger rounded-pill px-4" id="easyBtn">Easy</button>
      <button class="btn btn-danger rounded-pill px-4" id="moderateBtn">Moderate</button>
      <button class="btn btn-danger rounded-pill px-4" id="hardBtn">Hard</button>
    `;
  }

  const attach = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };

  attach("easyBtn", () => setDifficulty("easy"));
  attach("moderateBtn", () => setDifficulty("moderate"));
  attach("hardBtn", () => setDifficulty("hard"));

  const guessBtn = document.getElementById("guessBtn");
  if (guessBtn) guessBtn.addEventListener("click", checkGuess);

  const input = document.getElementById("inputNum");
  if (input)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") checkGuess();
    });

  attach("restartBtn", resetGame);
  attach("loseRestartBtn", resetGame);

  updateGuessesText();
});
