# Word Quest (Work In Progress)

**Word Quest** is a responsive, web-based word search puzzle game built with React. It features a dynamic 10×10 grid with randomly placed words, smooth drag selection with a sleek overlay line for found words, and themed word lists loaded from a configurable JSON file.

## Features

- **Dynamic Grid Generation:** Randomly placed words in various orientations (horizontal, vertical, diagonal) on a 10×10 grid.
- **Theme-Based Word Lists:** Choose from multiple categories (animals, foods, holiday, countries) via a styled dropdown.
- **Customizable Categories:** Easily add or edit word categories by modifying the `words.json` file. The app will randomly select words from the list to generate a new game.
- **Smooth Drag Selection:** Highlight words by dragging across the grid, with a smooth line overlay indicating a found word.
- **Timer & Performance Tracking:** Track how long you take to complete the puzzle.
- **Modern & Responsive UI:** Clean, intuitive design that works well on desktop and mobile devices.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 10 or higher)
- npm or yarn

### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/marcusjv85/word_quest.git
   cd word_quest
   
2. **Install Dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash 
    yarn install
    ```
3. Start the development server:

    ```bash
    npm start
    ```
    or
    ```bash
    yarn start
    ```
4. Open [localhost:5173](http://localhost:5173/) in your browser to start playing.

## Customizing Word Categories
The game loads word categories from a JSON file named `words.json`. The file follows this format:
   ```json       
      {
    "animals": ["CAT", "DOG", "HORSE", "TIGER", "LION", ...],
    "foods": ["APPLE", "BANANA", "PIZZA", "PASTA", "SUSHI", ...],
    "holiday": ["CHRISTMAS", "EASTER", "HALLOWEEN", "NEWYEAR", "VALENTINE", ...],
    "countries": ["USA", "CHINA", "INDIA", "JAPAN", "RUSSIA", ...]
      }
   ```
      
### To add or modify categories:

  1. Add a new key (e.g., "sports") or update an existing one with an array of uppercase words.

  2. Save your changes.

Restart the app, the new or updated category will appear in the dropdown selector
### Contributing
Contributions, bug reports, or feature suggestions are welcome! Please feel free to open an issue or submit a pull request. For major changes, it’s best to discuss them in an issue first.

## License
This project is licensed under the MIT License.

