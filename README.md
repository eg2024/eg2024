# EG Game

## Running
cd GIT_REPO
python3 -m http.server 8000
http://localhost:8000

## Basic
* We are using phaser as a game engine. Check examples in https://labs.phaser.io/
* We are targeting web mobile for random attends at a wedding:
  * We will keep the display fixed to a certain aspect ratio and number of pixels.
  * Games should only use touch input.
  * Don't expect people to be able to click with precision or in the borders.

## Add a minigame:
* Copy minigame_template into new file.
* Modify main.js to 
* Add assets in preloader.
* Create very basic figures in small pngs with expected size.
* We can improve the quality of the images after.
* Consider keeping the background empty.
