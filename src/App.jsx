import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import foundSound from "./found.wav";
import wordsData from "./words.json";

// Grid and styling constants
const GRID_SIZE = 10;
const CELL_SIZE = 40; // should match your CSS settings for .cell
const GAP = 2; // should match your CSS grid gap
const TOTAL_SIZE = CELL_SIZE + GAP;
const WORD_COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300"];

// Helper: Shuffle an array in place using Fisher-Yates algorithm
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Generate the grid with words placed randomly.
// Accepts an array of words to place.
const generateGrid = (words) => {
  let grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(""));

  let wordPositions = {};

  // Possible directions: [dx, dy]
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
    [-1, 0],
    [0, -1],
    [-1, -1],
    [1, -1],
  ];

  // Place a single word in the grid
  const placeWord = (word) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      attempts++;
      // Pick a random starting position
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      // Shuffle directions to try each in random order
      const shuffledDirections = shuffleArray([...directions]);

      for (const [dx, dy] of shuffledDirections) {
        // Check boundaries for word placement in this direction
        if (
          row + dy * (word.length - 1) >= 0 &&
          row + dy * (word.length - 1) < GRID_SIZE &&
          col + dx * (word.length - 1) >= 0 &&
          col + dx * (word.length - 1) < GRID_SIZE
        ) {
          let valid = true;
          let positions = [];

          // Check each letter's cell
          for (let i = 0; i < word.length; i++) {
            const currentRow = row + dy * i;
            const currentCol = col + dx * i;
            if (grid[currentRow][currentCol] !== "") {
              valid = false;
              break;
            }
            positions.push(`${currentRow}-${currentCol}`);
          }

          // If valid, place the word and save its positions
          if (valid) {
            wordPositions[word] = positions;
            for (let i = 0; i < word.length; i++) {
              grid[row + dy * i][col + dx * i] = word[i];
            }
            placed = true;
            break; // exit directions loop, word placed!
          }
        }
      }
    }
  };

  // Place each word from the selected list
  words.forEach(placeWord);

  // Fill in remaining cells with random letters
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  return { grid, wordPositions };
};

const App = () => {
  // Theme selection and word list state
  const [selectedTheme, setSelectedTheme] = useState("animals");
  const [currentWords, setCurrentWords] = useState([]);

  // Game state
  const [gridData, setGridData] = useState({ grid: [], wordPositions: {} });
  const [selectedCells, setSelectedCells] = useState([]);
  const [startCell, setStartCell] = useState(null);
  const [directionVector, setDirectionVector] = useState(null);
  const [foundWords, setFoundWords] = useState(new Set());
  const [foundWordPositions, setFoundWordPositions] = useState({});
  const [foundLines, setFoundLines] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastWordTime, setLastWordTime] = useState(0);
  const [wordTimes, setWordTimes] = useState([]);

  // When the theme changes, choose 10 random words from that group.
  useEffect(() => {
    const themeWords = wordsData[selectedTheme];
    const shuffled = [...themeWords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    setCurrentWords(selected);
  }, [selectedTheme]);

  // Regenerate grid whenever the current word list changes.
  useEffect(() => {
    if (currentWords.length > 0) {
      setGridData(generateGrid(currentWords));
      setFoundWords(new Set());
      setFoundWordPositions({});
      setFoundLines([]);
      setTimer(0);
      setIsRunning(false);
      setGameStarted(false);
    }
  }, [currentWords]);

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const startGame = () => {
    setGridData(generateGrid(currentWords));
    setFoundWords(new Set());
    setFoundWordPositions({});
    setFoundLines([]);
    setIsRunning(false);
    setGameStarted(true);
    setLastWordTime(0);
    setWordTimes([]);
    setTimer(0);
    setSelectedCells([]);
    setStartCell(null);
    setDirectionVector(null);
  };

  const playSound = () => {
    const foundAudio = new Audio(foundSound);
    foundAudio.play().catch((error) => console.log("Audio play error:", error));
  };

  // Mouse event handlers for grid selection
  const handleMouseDown = (row, col) => {
    setSelectedCells([[row, col]]);
    setStartCell([row, col]);
    setDirectionVector(null);
    setIsDragging(true);
  };

  const handleMouseEnter = (row, col) => {
    if (!isDragging) return;
    if (selectedCells.some(([r, c]) => r === row && c === col)) return;

    if (selectedCells.length === 1) {
      const dx = Math.sign(col - startCell[1]);
      const dy = Math.sign(row - startCell[0]);
      if (dx === 0 && dy === 0) return;
      setDirectionVector([dy, dx]); // Lock in the direction as [rowDiff, colDiff]
      setSelectedCells((prev) => [...prev, [row, col]]);
      return;
    }

    if (directionVector) {
      const lastCell = selectedCells[selectedCells.length - 1];
      const expectedRow = lastCell[0] + directionVector[0];
      const expectedCol = lastCell[1] + directionVector[1];
      if (row === expectedRow && col === expectedCol) {
        setSelectedCells((prev) => [...prev, [row, col]]);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    validateSelection();
    setSelectedCells([]);
    setStartCell(null);
    setDirectionVector(null);
  };

  // Validate the selection; if matching a word, add an overlay line, update found words, etc.
  const validateSelection = () => {
    const selectedLetters = selectedCells
      .map(([r, c]) => gridData.grid[r][c])
      .join("");

    let matchedWord = null;
    currentWords.forEach((word) => {
      if (
        selectedLetters === word ||
        selectedLetters === word.split("").reverse().join("")
      ) {
        matchedWord = word;
      }
    });

    if (matchedWord) {
      const start = selectedCells[0];
      const end = selectedCells[selectedCells.length - 1];
      const color =
        WORD_COLORS[currentWords.indexOf(matchedWord) % WORD_COLORS.length];

      // Add overlay line for a smoothly drawn found word
      setFoundLines((prev) => [
        ...prev,
        {
          word: matchedWord,
          startRow: start[0],
          startCol: start[1],
          endRow: end[0],
          endCol: end[1],
          color: color,
        },
      ]);

      setFoundWords((prev) => {
        const newFoundWords = new Set([...prev, matchedWord]);
        const timeTaken = timer - lastWordTime;
        const updatedWordTimes = [...wordTimes, timeTaken];
        setWordTimes(updatedWordTimes);
        setLastWordTime(timer);
        setFoundWordPositions((prevPositions) => ({
          ...prevPositions,
          [matchedWord]: gridData.wordPositions[matchedWord],
        }));
        if (!isRunning) setIsRunning(true);
        if (newFoundWords.size === currentWords.length) {
          setIsRunning(false);
          const avgTime =
            updatedWordTimes.length > 0
              ? updatedWordTimes.reduce((sum, t) => sum + t, 0) /
                updatedWordTimes.length
              : 0;
          alert(
            `🎉 Congrats! You found all words in ${timer} seconds!\n📊 Avg Time Per Word: ${avgTime.toFixed(
              2
            )} seconds`
          );
          startGame();
        }
        return newFoundWords;
      });

      playSound();
    }
  };

  return (
    <div className="container" onMouseUp={handleMouseUp}>
      <h1>Word Quest</h1>

      {/* Theme Selector */}
      <div className="theme-selector" style={{ marginBottom: "20px" }}>
        <label htmlFor="theme" className="theme-label">
          Select Theme:
        </label>
        <select
          id="theme"
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="theme-dropdown"
        >
          {Object.keys(wordsData).map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="instructions">
        Click and drag across the letters to select a word.
      </div>
      <button onClick={startGame} disabled={gameStarted}>
        Start Game
      </button>
      <div className="timer">Time: {timer}s</div>

      {/* Game Area (Grid and Side Panel) */}
      <div className="game-area">
        <div className="main-panel">
          <div className="grid">
            {gridData.grid.flatMap((row, rowIndex) =>
              row.map((letter, colIndex) => {
                const isSelected = selectedCells.some(
                  ([r, c]) => r === rowIndex && c === colIndex
                );
                const highlightColor = isSelected ? "#87cefa" : "transparent";
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="cell"
                    style={{ backgroundColor: highlightColor }}
                  >
                    <p
                      className="letter"
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    >
                      {letter}
                    </p>
                  </div>
                );
              })
            )}

            {/* Overlay lines for found words */}
            {foundLines.map((line, index) => {
              const startX = line.startCol * TOTAL_SIZE + CELL_SIZE / 2;
              const startY = line.startRow * TOTAL_SIZE + CELL_SIZE / 2;
              const endX = line.endCol * TOTAL_SIZE + CELL_SIZE / 2;
              const endY = line.endRow * TOTAL_SIZE + CELL_SIZE / 2;
              const dx = endX - startX;
              const dy = endY - startY;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return (
                <div
                  key={index}
                  className="found-line"
                  style={{
                    position: "absolute",
                    top: startY,
                    left: startX,
                    width: length,
                    height: 6,
                    backgroundColor: line.color,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: "0 50%",
                    borderRadius: 3,
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="side-panel">
          <h3>Find These Words:</h3>
          <ul className="word-list">
            {currentWords.map((word, index) => (
              <li
                key={index}
                className={foundWords.has(word) ? "found" : ""}
                style={{ color: WORD_COLORS[index % WORD_COLORS.length] }}
              >
                {word}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
