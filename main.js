// ==========================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==========================================

// Tempos em minutos para cada modo
const TIMER_MODES = {
  pomodoro: 25,
  short: 5,
  long: 15,
};

// Estado atual do timer
let currentMode = "pomodoro";
let timeLeft = TIMER_MODES.pomodoro * 60; // tempo em segundos
let isRunning = false;
let timerInterval = null;
let pomodorosCompleted = 0;
let totalFocusTime = 0; // em minutos

// Elementos do DOM
const timeDisplay = document.getElementById("timeDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const progressCircle = document.getElementById("progressCircle");
const modeBtns = document.querySelectorAll(".mode-btn");
const pomodorosDisplay = document.getElementById("pomodorosCompleted");
const totalTimeDisplay = document.getElementById("totalTime");

// Constante para o círculo de progresso
const CIRCLE_CIRCUMFERENCE = 565.48;

// ==========================================
// FUNÇÕES PRINCIPAIS
// ==========================================

/**
 * Formata o tempo em segundos para MM:SS
 * @param {number} seconds - Tempo em segundos
 * @returns {string} Tempo formatado
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Atualiza o display do timer
 */
function updateDisplay() {
  timeDisplay.textContent = formatTime(timeLeft);
  updateProgress();
}

/**
 * Atualiza a barra de progresso circular
 */
function updateProgress() {
  const totalTime = TIMER_MODES[currentMode] * 60;
  const progress = (totalTime - timeLeft) / totalTime;
  const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
  progressCircle.style.strokeDashoffset = offset;
}

/**
 * Inicia o timer
 */
function startTimer() {
  if (isRunning) return;

  isRunning = true;
  startBtn.style.display = "none";
  pauseBtn.style.display = "inline-block";

  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();

    // Timer chegou ao fim
    if (timeLeft === 0) {
      completeTimer();
    }
  }, 1000);
}

/**
 * Pausa o timer
 */
function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  startBtn.style.display = "inline-block";
  pauseBtn.style.display = "none";
}

/**
 * Reinicia o timer para o tempo inicial do modo atual
 */
function resetTimer() {
  pauseTimer();
  timeLeft = TIMER_MODES[currentMode] * 60;
  updateDisplay();
}

/**
 * Completa um ciclo do timer
 */
function completeTimer() {
  pauseTimer();

  // Reproduz som de notificação (opcional)
  playNotificationSound();

  // Atualiza estatísticas se for um pomodoro
  if (currentMode === "pomodoro") {
    pomodorosCompleted++;
    totalFocusTime += TIMER_MODES.pomodoro;
    updateStats();
  }

  // Mostra notificação
  showNotification();

  // Auto-inicia próximo modo (opcional)
  // autoSwitchMode();
}

/**
 * Muda o modo do timer (pomodoro, pausa curta, pausa longa)
 * @param {string} mode - Modo a ser ativado
 */
function switchMode(mode) {
  pauseTimer();
  currentMode = mode;
  timeLeft = TIMER_MODES[mode] * 60;
  updateDisplay();

  // Atualiza botões ativos
  modeBtns.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.mode === mode) {
      btn.classList.add("active");
    }
  });
}

/**
 * Atualiza as estatísticas na tela
 */
function updateStats() {
  pomodorosDisplay.textContent = pomodorosCompleted;
  const hours = Math.floor(totalFocusTime / 60);
  const mins = totalFocusTime % 60;
  totalTimeDisplay.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/**
 * Toca som de notificação
 */
function playNotificationSound() {
  // Cria um beep simples usando Web Audio API
  try {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.log("Audio não disponível:", error);
  }
}

/**
 * Mostra notificação quando o timer termina
 */
function showNotification() {
  const messages = {
    pomodoro: "🎉 Pomodoro completo! Hora de uma pausa!",
    short: "💪 Pausa curta terminada! Bora codar!",
    long: "🚀 Pausa longa terminada! Vamos voltar ao trabalho!",
  };

  alert(messages[currentMode]);

  // Tenta usar Notification API se disponível
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Dev Pomodoro", {
      body: messages[currentMode],
      icon: "⏱️",
    });
  }
}

/**
 * Solicita permissão para notificações
 */
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

// Botões de modo
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchMode(btn.dataset.mode);
  });
});

// Atalhos de teclado
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  } else if (e.code === "KeyR") {
    resetTimer();
  }
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

// Inicializa o display
updateDisplay();

// Solicita permissão para notificações
requestNotificationPermission();

// Carrega estatísticas salvas (opcional - localStorage)
// loadStats();
