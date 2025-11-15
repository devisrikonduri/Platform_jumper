1. Game Title & Team Member / Role

Game Title: Platform Jumper
Team Member:  Konduri Devisri Lakshmi
Role:

Game Logic (JavaScript) ,game physics



Team Member: S.M Muskan
UI/UX Design (HTML/CSS)

Team Member: Mohamed Raihen

DOM Interactions & Debugging

2. Game Description

Platform Jumper is a simple side-scrolling browser game where the player jumps and double-jumps to avoid TNT obstacles. The game becomes faster over time, making survival and scoring more challenging.

3. How to Play

Space / Tap / Click: Jump

Press Twice: Double Jump

Avoid TNT boxes (single or stacked vertically)

Score increases with time survived

Collision = Game Over

4. Features Implemented

Start screen with instructions

3-2-1 countdown

Jump + Double jump

TNT obstacles (1 or 2 stacked)

Obstacle movement

Collision detection

Score + High Score

Game Over screen with Restart option

Hover effects

Clean UI + Player sprite

Responsive layout

5. Core Programming Concepts Used
Variables & Data Types

score (number)

isGameActive (boolean)

obstacles[] (array)

player (object)

Operators

Arithmetic: score++

Relational: if (score > highScore)

Logical: if (isGameActive && playerAlive)

Conditional Statements

Jump logic

Game state switching

Obstacle collision check

Loops

for loop for obstacles

while loop for stacked TNT creation

Nested Loops

Used for multiple-height TNT blocks

Functions (5+)

startGame()

spawnObstacle()

updateGame()

playerJump()

checkCollision()

gameOver()

resetGame()

Arrays / Objects

obstacles[] storing TNT objects

Game config object for speed, gravity, etc.

DOM Manipulation

Create/remove obstacle elements

Update score text

Toggle screens

Modify styles dynamically

Event Handling

keydown (jump)

click / touchstart (mobile jump)

Start & restart buttons

6. Game States Implemented

Start State

Countdown State

Playing State

Game Over State

7. Input & Output Handling

Input:

Space key

Mouse

Touch

Output:

Score display

HighScore display

Game Over message

8. Error Handling

No unlimited double-jumps

Prevent off-screen jump

Display toggling fixed with display: none/block

No console errors

9. Challenges Faced & Solutions
1. Double Jump Logic

Solved using jumpCount with reset after landing.

2. Stacked TNT Obstacles

Looped TNT generation (1–2 blocks).

3. Screen Overlap

Used z-index and show/hide logic.

4. Countdown Timing

Added delay using setInterval() before game loop starts.
