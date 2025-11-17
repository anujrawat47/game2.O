window.addEventListener('DOMContentLoaded', () => {
let boxes = document.querySelectorAll('.box');
let resetButton = document.querySelector('#reset');
let newGameButton = document.querySelector('#new-game');
let msgContainer = document.querySelector('.msg-container');
let msg = document.querySelector('#msg');

let turnO = true;
let moveQueue = [];
let gameOver = false;

let scoreX = 0;
let scoreO = 0;
const scoreXDisplay = document.querySelector("#score-x");
const scoreODisplay = document.querySelector("#score-o");
const resetScoreboardBtn = document.querySelector('#reset-scoreboard');
const removeSound = document.getElementById("remove-sound");
console.log("removeSound:", removeSound); // this should NOT be null


removeSound.volume = 0.8;

// Unlock audio on first interaction
document.body.addEventListener("click", () => {
    removeSound.play().catch(() => {});
}, { once: true });
 

const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8]
];

const showResetButton = () => {
    resetButton.style.display = "inline-block";
    newGameButton.style.display = "none";
};

const showNewGameButton = () => {
    resetButton.style.display = "none";
    newGameButton.style.display = "inline-block";
};

const resetGame = () => {
    turnO = true;
    gameOver = false;
    enableBoxes();
    msgContainer.classList.add('hide');
    moveQueue = [];
    showResetButton();
};

const resetScoreboard = () => {
    scoreX = 0;
    scoreO = 0;
    scoreXDisplay.innerText = scoreX;
    scoreODisplay.innerText = scoreO;
};

boxes.forEach((box, index) => {
    box.addEventListener("click", () => {
        if (box.innerText !== "" || gameOver) return;

        if (turnO) {
            box.innerText = "O";
            turnO = false;
        } else {
            box.innerText = "X";
            turnO = true;
        }

        box.disabled = true;
        moveQueue.push({ index: index, value: box.innerText });
        checkWin();
    });
});

const disableBoxes = () => {
    for (let box of boxes) {
        box.disabled = true;
    }
};

const enableBoxes = () => {
    for (let box of boxes) {
        box.disabled = false;
        box.innerText = "";
        box.classList.remove("removing");
    }
};

const showWinner = (winner) => {
    msg.innerText = `Congratulations, Winner is ${winner}`;
    msgContainer.classList.remove('hide');
    disableBoxes();
    gameOver = true;
    moveQueue = [];

    if (winner === "X") {
        scoreX++;
        scoreXDisplay.innerText = scoreX;
    } else if (winner === "O") {
        scoreO++;
        scoreODisplay.innerText = scoreO;
    }

    showNewGameButton();
};

const checkWin = () => {
    for (let pattern of winPatterns) {
        let pos1 = boxes[pattern[0]].innerText;
        let pos2 = boxes[pattern[1]].innerText;
        let pos3 = boxes[pattern[2]].innerText;

        if (pos1 !== "" && pos2 !== "" && pos3 !== "") {
            if (pos1 === pos2 && pos2 === pos3) {
                showWinner(pos1);
            }
        }
    }
};

// 🕒 Auto-remove oldest move
setInterval(() => {
  if (moveQueue.length > 0 && !gameOver) {
    const oldest = moveQueue.shift();
    const box = boxes[oldest.index];

    box.classList.add("removing");

    setTimeout(() => {
      box.innerText = "";
      box.disabled = false;
      box.classList.remove("removing");

      // ✅ Safe audio play
      if (removeSound) {
        removeSound.pause();
        removeSound.currentTime = 0;
        removeSound.play().catch((e) => {
          console.log("Playback error:", e);
        });
      }
    }, 400);
  }
}, 2000);


// 🔘 Button Events
newGameButton.addEventListener('click', resetGame);
resetButton.addEventListener('click', resetGame);
resetScoreboardBtn.addEventListener('click', resetScoreboard);
});