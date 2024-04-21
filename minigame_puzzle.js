import { Scene } from "phaser";

function shuffleArray(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}  

export class Game extends Scene
{
    constructor() {
        // CHANGE: this is the name of the scene, so menu scene can switch to it.
        super("puzzle");
    }

    create() {
        // Check examples in https://labs.phaser.io/
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Set background
        this.cameras.main.setBackgroundColor(0xffffff);

        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) { this.scene.start("menu"); }, this);

        const areTwoPiecesTogether = (pieceA, pieceB) => {
            const areAdjencentPieces = ((pieceA.originalX == pieceB.originalX && Math.abs(pieceA.originalY - pieceB.originalY) < 2) ||
            (pieceA.originalY == pieceB.originalY && Math.abs(pieceA.originalX - pieceB.originalX) < 2));

            if (!areAdjencentPieces) {
                return false;
            }

            const dx = Math.abs(pieceA.x - pieceB.x);
            const dy = Math.abs(pieceA.y - pieceB.y);

            return (dx + dy) < 10;
        }

        const setPositionToPieces = (pieces, x, y) => {
            pieces.forEach(piece => {
                piece.setPosition(x, y);
            });
        }

        const setIdToPieces = (pieces, id) => {
            pieces.forEach(piece => {
                piece.id = id;
            })
        }


        const initialPositions = [...Array(12).keys()];
        shuffleArray(initialPositions);

        const pieces = [];
        const startingPositionX = 150;
        const startingPositionY = 170;
        const pieceSize = 67;

        for (let i=0; i<12; i++) {
            let item = this.add.sprite(0, 0, "puzzle_a" + i);

            item.id = i;
            item.originalX = i%3;
            item.originalY = Math.floor(i/3);

            item.setInteractive({
                draggable: true,
                pixelPerfect: true,
                alphaTolerance: 1,
            });

            const initialPosition = initialPositions[i];
            const initialX = Math.floor(initialPosition/6);
            const initialY = initialPosition%6;

            const startX = (startingPositionX - pieceSize + 30) + (200 * initialX) - item.originalX * pieceSize;
            const startY = startingPositionY + ((pieceSize + 30) * initialY) - item.originalY * pieceSize;

            // item.setPosition(150, 170);
            item.setPosition(startX, startY);
            
            item.on('drag', function(pointer, dragX, dragY){
                setPositionToPieces(pieces[item.id], dragX, dragY);
            }, this);
            item.on('dragend', function(pointer, dragX, dragY, dropped){
                pieces[item.id].forEach(piece => {
                    for (const [key, value] of Object.entries(pieces)) {
                        const basePiece = value[0];

                        if (item.id == basePiece.id) {
                            continue;
                        }
    
                        if (areTwoPiecesTogether(piece, basePiece)) {
                            setPositionToPieces(pieces[item.id], basePiece.x, basePiece.y)
                            pieces[basePiece.id] = pieces[basePiece.id].concat(pieces[item.id]);
                            setIdToPieces(pieces[basePiece.id], basePiece.id);
                        }
                    }
                });
            }, this);

            pieces[i] = [item];
        }
    }
}
