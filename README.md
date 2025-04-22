
# Maze Game

A simple maze game written in javascript using webgl and glMatrix. 

Demo: https://nvt500.github.io/MazeGame/

It randomly generates a maze with a cubes as walls with a dungeon wall texture. At the end of the maze is a cube with a key texture which is the goal of the game.

# How the maze generates

A path is made by randomly choosing a direction to go to as long as it is not next to another point of the path or is a wall. Then the same principal is used for branches but by randomly choosing a starting point on the main path.

The maze takes in parameters which can be changed on the page.

 - Map Width & Map Height
    - the dimensions of the maze
 - Minimum Path Length & Maximum Path Length
    - the main path is generated first by randomly choosing directions until it is stuck or hits the maximum length
 - Number of inner branches, Minimum length of inner branch, & Maximum length of inner branch
    - The inner branches are paths generated on the main path by having their start be a random part of the main path
 - Number of outer branches, Minimum length of outer branch, & Maximum length of outer branch
    - Outer branches are the same as inner branches but generate on the inner branches rather than the outer branches

# Texture Sources

Dungeon wall texture:
- [@ThatsPrettyNeat](https://www.pixilart.com/thatsprettyneat) - https://www.pixilart.com/art/dungeon-wall-texture-9e8e240693123e6

Dungeon floor texture: 
- [@soulshadow](https://www.pixilart.com/soulshadow) - https://www.pixilart.com/art/brick-tile-sr22a5bca1ce8aws3

Key texture:
- [@SaloonBuffoon](https://www.pixilart.com/saloonbuffoon) - https://www.pixilart.com/art/skeleton-key-sr26f18728940aws3
