
/* =========================================
   CHARITY: WATER - WATER QUEST
   Interactive Waste Sorting Game
========================================= */


/* =========================================
   1. DIFFICULTY SETTINGS
========================================= */

const difficultySettings = {
  easy: {
    goal: 50,
    time: 90,
    pace: 3000
  },

  normal: {
    goal: 100,
    time: 60,
    pace: 2200
  },

  hard: {
    goal: 150,
    time: 45,
    pace: 1400
  }
};

let GOAL_SCORE = 100;
let TOTAL_GAME_TIME = 60;
let ITEM_PACE = 2200;

const CORRECT_POINTS = 10;
const WRONG_POINTS = 5;


/* =========================================
   2. GAME VARIABLES
========================================= */

let score = 0;
let timeLeft = TOTAL_GAME_TIME;
let gameActive = false;
let selectedItem = null;

let timerInterval = null;
let itemInterval = null;

let soundEnabled = true;
let audioContext = null;

let gameRound = 0;
let reachedMilestones = [];
let milestones = [];


/* =========================================
   3. WASTE ITEMS
========================================= */

const wasteItems = [
  {
    name: "Plastic Bottle",
    icon: "🧴",
    bin: "recycle"
  },
  {
    name: "Newspaper",
    icon: "📰",
    bin: "recycle"
  },
  {
    name: "Cardboard Box",
    icon: "📦",
    bin: "recycle"
  },
  {
    name: "Soda Can",
    icon: "🥫",
    bin: "recycle"
  },
  {
    name: "Paper Bag",
    icon: "🛍️",
    bin: "recycle"
  },
  {
    name: "Food Wrapper",
    icon: "🍬",
    bin: "trash"
  },
  {
    name: "Used Tissue",
    icon: "🧻",
    bin: "trash"
  },
  {
    name: "Dirty Sponge",
    icon: "🧽",
    bin: "trash"
  },
  {
    name: "Broken Ceramic Cup",
    icon: "☕",
    bin: "trash"
  },
  {
    name: "Plastic Straw",
    icon: "🥤",
    bin: "trash"
  }
];


/* =========================================
   4. GAME MESSAGES
========================================= */

const WINNING_MESSAGES = [
  "Amazing job! You completed Water Quest!",
  "Congratulations! You're a clean water champion!",
  "Great work! You sorted the waste and helped clean the water!"
];

const LOSING_MESSAGES = [
  "Good effort! Every drop counts. Try again!",
  "Almost there! Keep practicing your sorting skills!",
  "Time is up! Give Water Quest another try!"
];


/* =========================================
   5. HTML ELEMENTS
========================================= */

const grid =
  document.getElementById("grid");

const scoreDisplay =
  document.getElementById("current-cans");

const timerDisplay =
  document.getElementById("timer");

const timerBar =
  document.getElementById("timer-bar");

const highScoreDisplay =
  document.getElementById("high-score");

const startButton =
  document.getElementById("start-game");

const resetButton =
  document.getElementById("reset-game");

const trashButton =
  document.getElementById("trash-bin");

const recycleButton =
  document.getElementById("recycle-bin");

const feedbackDisplay =
  document.getElementById("game-feedback");

const achievementModal =
  document.getElementById("achievements");

const achievementCard =
  achievementModal.querySelector(".achievement-card");

const achievementIcon =
  document.getElementById("achievement-icon");

const achievementTitle =
  document.getElementById("achievement-title");

const achievementMessage =
  document.getElementById("achievement-message");

const finalScoreDisplay =
  document.getElementById("final-score");

const restartButton =
  document.getElementById("modal-restart");

const confettiContainer =
  document.getElementById("confetti-container");

const soundButton =
  document.getElementById("sound-toggle");

const soundIcon =
  document.getElementById("sound-icon");

const soundText =
  soundButton.querySelector(".btn-text");

const difficultySelect =
  document.getElementById("difficulty");

const difficultyDescription =
  document.getElementById("difficulty-description");

const goalText =
  document.getElementById("goal-text");

const milestoneDisplay =
  document.getElementById("milestone-message");

const scoreProgressBar =
  document.getElementById("score-progress-bar");

const scoreProgressTrack =
  document.getElementById("score-progress-track");

const progressScore =
  document.getElementById("progress-score");

const progressGoal =
  document.getElementById("progress-goal");

const finalGoal =
  document.getElementById("final-goal");


/* =========================================
   6. DIFFICULTY SELECTION
========================================= */

function updateDifficulty() {

  if (gameActive) return;

  const difficulty = difficultySelect.value;

  const settings =
    difficultySettings[difficulty] ||
    difficultySettings.normal;

  GOAL_SCORE = settings.goal;
  TOTAL_GAME_TIME = settings.time;
  ITEM_PACE = settings.pace;

  timeLeft = TOTAL_GAME_TIME;

  goalText.textContent = GOAL_SCORE;

  difficultyDescription.textContent =
    `${difficulty.toUpperCase()} MODE: Earn ${GOAL_SCORE} points in ${TOTAL_GAME_TIME} seconds!`;

  progressGoal.textContent = GOAL_SCORE;

  finalGoal.textContent =
    `${GOAL_SCORE} Points`;

  scoreProgressTrack.setAttribute(
    "aria-valuemax",
    GOAL_SCORE
  );

  milestones = [
    {
      points: Math.ceil(
        GOAL_SCORE * 0.25 / 10
      ) * 10,

      message:
        "Great start! You're making a difference! 💧"
    },
    {
      points: Math.ceil(
        GOAL_SCORE * 0.5 / 10
      ) * 10,

      message:
        "Halfway there! Keep going! 🌊"
    },
    {
      points: Math.ceil(
        GOAL_SCORE * 0.75 / 10
      ) * 10,

      message:
        "Almost there! You've got this! ⭐"
    }
  ];

  reachedMilestones = [];

  updateTimer();
  updateScore();

  milestoneDisplay.textContent =
    "Every point brings you closer to your goal!";
}


/* =========================================
   7. HIGH SCORE
========================================= */

function getHighScore() {

  try {

    return Number(
      localStorage.getItem(
        "waterQuestHighScore"
      )
    ) || 0;

  } catch (error) {

    return 0;
  }
}

function saveHighScore() {

  try {

    if (score > getHighScore()) {

      localStorage.setItem(
        "waterQuestHighScore",
        String(score)
      );
    }

  } catch (error) {

    // Continue game without local storage
  }

  updateHighScore();
}

function updateHighScore() {

  highScoreDisplay.textContent =
    getHighScore();
}


/* =========================================
   8. JAVASCRIPT SOUND EFFECTS
   NO MP3 FILES REQUIRED
========================================= */

function initializeAudio() {

  if (!soundEnabled) return;

  try {

    if (!audioContext) {

      const AudioClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (AudioClass) {

        audioContext = new AudioClass();
      }
    }

    if (
      audioContext &&
      audioContext.state === "suspended"
    ) {

      audioContext.resume();
    }

  } catch (error) {

    // Sound is optional
  }
}

function playSound(
  frequency,
  duration = 0.15,
  type = "sine"
) {

  if (!soundEnabled) return;

  try {

    initializeAudio();

    if (!audioContext) return;

    const oscillator =
      audioContext.createOscillator();

    const volume =
      audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      frequency,
      audioContext.currentTime
    );

    volume.gain.setValueAtTime(
      0.12,
      audioContext.currentTime
    );

    volume.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(volume);

    volume.connect(
      audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
      audioContext.currentTime + duration
    );

  } catch (error) {

    // Game continues without audio
  }
}

function playCorrectSound() {

  playSound(700, 0.15);

  setTimeout(() => {
    playSound(950, 0.18);
  }, 100);
}

function playWrongSound() {

  playSound(250, 0.25, "triangle");
}

function playClickSound() {

  playSound(450, 0.08);
}

function playWinSound() {

  playSound(700, 0.15);

  setTimeout(() => {
    playSound(900, 0.2);
  }, 150);

  setTimeout(() => {
    playSound(1100, 0.35);
  }, 350);
}


/* =========================================
   9. UPDATE SCORE
========================================= */

function updateScore() {

  scoreDisplay.textContent = score;

  updateProgress();
}

function updateProgress() {

  const percentage = Math.min(
    (score / GOAL_SCORE) * 100,
    100
  );

  scoreProgressBar.style.width =
    `${percentage}%`;

  progressScore.textContent = score;

  scoreProgressTrack.setAttribute(
    "aria-valuenow",
    Math.min(score, GOAL_SCORE)
  );
}


/* =========================================
   10. MILESTONE MESSAGES
========================================= */

function checkMilestones() {

  milestones.forEach(
    (milestone, index) => {

      if (
        score >= milestone.points &&
        !reachedMilestones.includes(index)
      ) {

        reachedMilestones.push(index);

        milestoneDisplay.textContent =
          milestone.message;

        playSound(850, 0.2);
      }
    }
  );
}


/* =========================================
   11. GAME FEEDBACK
========================================= */

function showFeedback(message, correct = null) {

  feedbackDisplay.textContent = message;

  feedbackDisplay.classList.remove(
    "correct",
    "incorrect"
  );

  if (correct === true) {

    feedbackDisplay.classList.add(
      "correct"
    );

  } else if (correct === false) {

    feedbackDisplay.classList.add(
      "incorrect"
    );
  }
}


/* =========================================
   12. SHUFFLE GAME ITEMS
========================================= */

function shuffleItems(items) {

  const shuffled = [...items];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {

    const randomIndex =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      shuffled[i],
      shuffled[randomIndex]
    ] = [
      shuffled[randomIndex],
      shuffled[i]
    ];
  }

  return shuffled;
}


/* =========================================
   13. CREATE INDIVIDUAL ITEM
========================================= */

function createItemElement(item) {

  const cell =
    document.createElement("button");

  cell.type = "button";

  cell.className =
    "grid-cell waste-item";

  cell.dataset.bin = item.bin;

  cell.innerHTML = `
    <span class="waste-icon">${item.icon}</span>
    <span class="waste-name">${item.name}</span>
  `;

  cell.disabled = !gameActive;

  cell.setAttribute(
    "aria-pressed",
    "false"
  );

  cell.setAttribute(
    "aria-label",
    `Select ${item.name}`
  );

  cell.addEventListener("click", () => {

    selectItem(cell, item);
  });

  return cell;
}


/* =========================================
   14. CREATE GAME GRID
========================================= */

function createGrid() {

  grid.innerHTML = "";

  selectedItem = null;

  const items =
    shuffleItems(wasteItems).slice(0, 9);

  items.forEach((item) => {

    const cell =
      createItemElement(item);

    grid.appendChild(cell);
  });
}


/* =========================================
   15. SELECT AN ITEM
========================================= */

function selectItem(cell, item) {

  if (
    !gameActive ||
    cell.disabled
  ) {
    return;
  }

  playClickSound();

  grid.querySelectorAll(".grid-cell")
    .forEach((element) => {

      element.classList.remove(
        "selected"
      );

      element.setAttribute(
        "aria-pressed",
        "false"
      );
    });

  selectedItem = {
    element: cell,
    bin: item.bin,
    name: item.name
  };

  cell.classList.add("selected");

  cell.setAttribute(
    "aria-pressed",
    "true"
  );

  showFeedback(
    `${item.name} selected! Choose Trash or Recycle.`
  );
}


/* =========================================
   16. SORT SELECTED ITEM
========================================= */

function sortItem(chosenBin) {

  if (!gameActive) return;

  if (!selectedItem) {

    showFeedback(
      "Select an item in the water first!",
      false
    );

    playWrongSound();

    return;
  }

  const itemElement =
    selectedItem.element;

  const correctBin =
    selectedItem.bin;

  if (chosenBin === correctBin) {

    // CORRECT ANSWER

    score += CORRECT_POINTS;

    showFeedback(
      "Correct! +10 points 🎉",
      true
    );

    playCorrectSound();

    itemElement.classList.remove(
      "selected"
    );

    itemElement.classList.add(
      "sorted-correct"
    );

    itemElement.disabled = true;

    selectedItem = null;

    updateScore();
    saveHighScore();
    checkMilestones();

    // Capture the current game round
    const currentRound = gameRound;

    // Remove sorted item after animation
    setTimeout(() => {

      if (currentRound !== gameRound) {
        return;
      }

      itemElement.remove();

    }, 300);

    // Check if player reached the goal
    if (score >= GOAL_SCORE) {

      endGame(true);

      return;
    }

    // Add another item to replace it
    setTimeout(() => {

      if (
        gameActive &&
        currentRound === gameRound
      ) {

        addNewItem();
      }

    }, 350);

  } else {

    // INCORRECT ANSWER

    score = Math.max(
      0,
      score - WRONG_POINTS
    );

    showFeedback(
      "Incorrect! -5 points. Try again!",
      false
    );

    playWrongSound();

    itemElement.classList.remove(
      "sorted-incorrect"
    );

    // Restart the shake animation
    void itemElement.offsetWidth;

    itemElement.classList.add(
      "sorted-incorrect"
    );

    setTimeout(() => {

      itemElement.classList.remove(
        "sorted-incorrect"
      );

    }, 400);

    updateScore();

    // Item remains available
    // so the player can try again
  }
}


/* =========================================
   17. ADD NEW ITEM
   UPDATED FUNCTION
========================================= */

function addNewItem() {

  if (!gameActive) return;

  // Remove previously sorted items
  // that may still be in the grid
  grid.querySelectorAll(
    ".grid-cell.sorted-correct"
  ).forEach((cell) => {

    cell.remove();
  });

  // Keep a maximum of nine items
  if (grid.children.length >= 9) {
    return;
  }

  // Select a random waste item
  const randomItem =
    wasteItems[
      Math.floor(
        Math.random() * wasteItems.length
      )
    ];

  // Create a new clickable item
  const cell =
    createItemElement(randomItem);

  // Add the new item to the page
  grid.appendChild(cell);
}


/* =========================================
   18. UPDATE TIMER
========================================= */

function updateTimer() {

  timerDisplay.textContent = timeLeft;

  const percentage = Math.max(
    0,
    (timeLeft / TOTAL_GAME_TIME) * 100
  );

  timerBar.style.width =
    `${percentage}%`;

  if (timeLeft <= 10) {

    timerBar.classList.add(
      "warning"
    );

  } else {

    timerBar.classList.remove(
      "warning"
    );
  }
}


/* =========================================
   19. START GAME
========================================= */

function startGame() {

  if (gameActive) return;

  clearInterval(timerInterval);
  clearInterval(itemInterval);

  // Apply selected difficulty
  updateDifficulty();

  gameRound++;

  score = 0;
  timeLeft = TOTAL_GAME_TIME;

  gameActive = true;
  selectedItem = null;

  reachedMilestones = [];

  updateScore();
  updateTimer();

  milestoneDisplay.textContent =
    "Every point brings you closer to your goal! 💧";

  achievementModal.style.display =
    "none";

  confettiContainer.innerHTML = "";

  startButton.disabled = true;

  startButton.textContent =
    "Game in Progress...";

  startButton.classList.add(
    "running"
  );

  difficultySelect.disabled = true;

  trashButton.disabled = false;
  recycleButton.disabled = false;

  // Create the first nine items
  createGrid();

  showFeedback(
    "Select an item and choose the correct bin!"
  );

  initializeAudio();

  playClickSound();

  // Start countdown
  timerInterval = setInterval(() => {

    if (!gameActive) return;

    timeLeft--;

    updateTimer();

    if (timeLeft <= 0) {

      endGame(false);
    }

  }, 1000);

  // Add new items based on difficulty
  itemInterval = setInterval(() => {

    addNewItem();

  }, ITEM_PACE);
}


/* =========================================
   20. RESET GAME
========================================= */

function resetGame() {

  clearInterval(timerInterval);
  clearInterval(itemInterval);

  gameRound++;

  gameActive = false;
  selectedItem = null;

  score = 0;
  timeLeft = TOTAL_GAME_TIME;

  reachedMilestones = [];

  updateScore();
  updateTimer();

  grid.innerHTML = "";

  confettiContainer.innerHTML = "";

  achievementModal.style.display =
    "none";

  startButton.disabled = false;

  startButton.textContent =
    "🎮 Start Game";

  startButton.classList.remove(
    "running"
  );

  difficultySelect.disabled = false;

  trashButton.disabled = true;
  recycleButton.disabled = true;

  milestoneDisplay.textContent =
    "Every point brings you closer to your goal!";

  showFeedback(
    "Game reset! Click Start Game to play."
  );

  playClickSound();
}


/* =========================================
   21. END GAME
========================================= */

function endGame(playerWon) {

  if (!gameActive) return;

  clearInterval(timerInterval);
  clearInterval(itemInterval);

  gameActive = false;
  selectedItem = null;

  saveHighScore();

  trashButton.disabled = true;
  recycleButton.disabled = true;

  difficultySelect.disabled = false;

  grid.querySelectorAll(".grid-cell")
    .forEach((cell) => {

      cell.disabled = true;
    });

  startButton.disabled = false;

  startButton.textContent =
    "🎮 Start Game";

  startButton.classList.remove(
    "running"
  );

  const messages = playerWon
    ? WINNING_MESSAGES
    : LOSING_MESSAGES;

  const randomIndex =
    Math.floor(
      Math.random() * messages.length
    );

  const message =
    messages[randomIndex];

  showAchievement(
    playerWon,
    message
  );

  if (playerWon) {

    milestoneDisplay.textContent =
      "Amazing! You completed your Water Quest! 🏆";

    playWinSound();

    celebrateWin();

  } else {

    milestoneDisplay.textContent =
      "Time's up! Try again! 💧";

    playWrongSound();
  }
}


/* =========================================
   22. ACHIEVEMENT POPUP
========================================= */

function showAchievement(
  playerWon,
  message
) {

  achievementCard.classList.remove(
    "win",
    "try-again"
  );

  if (playerWon) {

    achievementCard.classList.add(
      "win"
    );

    achievementIcon.textContent =
      "🎉";

    achievementTitle.textContent =
      "Quest Complete!";

  } else {

    achievementCard.classList.add(
      "try-again"
    );

    achievementIcon.textContent =
      "💧";

    achievementTitle.textContent =
      "Nice Try!";
  }

  achievementMessage.textContent =
    message;

  finalScoreDisplay.textContent =
    score;

  finalGoal.textContent =
    `${GOAL_SCORE} Points`;

  achievementModal.style.display =
    "flex";

  restartButton.focus();
}


/* =========================================
   23. CONFETTI CELEBRATION
========================================= */

function celebrateWin() {

  confettiContainer.innerHTML = "";

  const colors = [
    "#FFC907",
    "#2E9DF7",
    "#4FCB53",
    "#FF902A",
    "#F16061"
  ];

  for (let i = 0; i < 80; i++) {

    const confetti =
      document.createElement("span");

    confetti.className =
      "confetti-piece";

    confetti.style.backgroundColor =
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ];

    confetti.style.left =
      `${Math.random() * 100}%`;

    confetti.style.animationDelay =
      `${Math.random() * 1.5}s`;

    confetti.style.animationDuration =
      `${2 + Math.random() * 2}s`;

    confettiContainer.appendChild(
      confetti
    );
  }

  const celebrationRound =
    gameRound;

  setTimeout(() => {

    if (
      celebrationRound === gameRound
    ) {

      confettiContainer.innerHTML = "";
    }

  }, 5500);
}


/* =========================================
   24. BUTTON EVENT LISTENERS
========================================= */

// Start game
startButton.addEventListener(
  "click",
  startGame
);

// Reset game
resetButton.addEventListener(
  "click",
  resetGame
);

// Trash bin
trashButton.addEventListener(
  "click",
  () => {

    sortItem("trash");
  }
);

// Recycling bin
recycleButton.addEventListener(
  "click",
  () => {

    sortItem("recycle");
  }
);

// Play again
restartButton.addEventListener(
  "click",
  () => {

    resetGame();
    startGame();
  }
);

// Difficulty selector
difficultySelect.addEventListener(
  "change",
  () => {

    if (!gameActive) {

      updateDifficulty();
    }
  }
);

// Sound toggle
soundButton.addEventListener(
  "click",
  () => {

    soundEnabled = !soundEnabled;

    if (soundEnabled) {

      soundIcon.textContent = "🔊";
      soundText.textContent = "Sound ON";

      initializeAudio();
      playClickSound();

    } else {

      soundIcon.textContent = "🔇";
      soundText.textContent = "Sound OFF";
    }
  }
);


/* =========================================
   25. INITIAL GAME SETUP
========================================= */

updateDifficulty();

updateScore();
updateTimer();
updateHighScore();

createGrid();

trashButton.disabled = true;
recycleButton.disabled = true;

startButton.disabled = false;

