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
let gameMode = "PvP"; // or "AI"

removeSound.volume = 0.8;

document.getElementById("mode-ai").addEventListener("click", () => {
    gameMode = "ai";
    resetGame();
});

document.getElementById("mode-multiplayer").addEventListener("click", () => {
    gameMode = "multiplayer";
    resetGame();
});

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

const scores = {
    X: 1,
    O: -1,
    tie: 0
};

function checkWinner(board) {
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    if (board.every(cell => cell !== "")) {
        return "tie";
    }

    return null;
}

function minimax(board, depth, isMaximizing) {
    let result = checkWinner(board);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function aiMove() {
    let board = Array.from(boxes).map(box => box.innerText);
    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "X";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== -1) {
        boxes[move].innerText = "X";
        boxes[move].disabled = true;
        moveQueue.push({ index: move, value: "X" });
        checkWin();
        turnO = true;
        document.getElementById('turn-indicator').innerText = `Turn: O`;
    }
}

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
    document.getElementById('turn-indicator').innerText = `Turn: O`;
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

        if (gameMode === "multiplayer") {
            box.innerText = turnO ? "O" : "X";
            box.disabled = true;
            moveQueue.push({ index: index, value: box.innerText });
            checkWin();
            turnO = !turnO;
            document.getElementById('turn-indicator').innerText = `Turn: ${turnO ? 'O' : 'X'}`;
        } 
        else if (gameMode === "ai") {
            if (!turnO) return;

            box.innerText = "O";
            box.disabled = true;
            moveQueue.push({ index: index, value: box.innerText });
            checkWin();

            turnO = false;

            if (!gameOver) {
                setTimeout(aiMove, 500);
            }
        }
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
        box.classList.remove("win");
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

        if (pos1 !== "" && pos1 === pos2 && pos2 === pos3) {
            // Highlight the winning boxes
            pattern.forEach(index => {
                boxes[index].classList.add("win");
            });

            showWinner(pos1);
            return;
        }
    }

    // Check for tie
    if ([...boxes].every(box => box.innerText !== "") && !gameOver) {
        msg.innerText = "It's a Tie!";
        msgContainer.classList.remove('hide');
        gameOver = true;
        showNewGameButton();
    }
};


setInterval(() => {
  if (moveQueue.length > 0 && !gameOver) {
    const oldest = moveQueue.shift();
    const box = boxes[oldest.index];

    box.classList.add("removing");

    setTimeout(() => {
      box.innerText = "";
      box.disabled = false;
      box.classList.remove("removing");

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

newGameButton.addEventListener('click', resetGame);
resetButton.addEventListener('click', resetGame);
resetScoreboardBtn.addEventListener('click', resetScoreboard);
});
