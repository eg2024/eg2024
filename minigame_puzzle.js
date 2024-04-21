import { Scene } from "phaser";

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


        for (let i=0; i<12; i++) {
            let item = this.add.sprite(0, 0, "puzzle_a" + i);
            item.setInteractive({
                draggable: true,
                pixelPerfect: true,
                alphaTolerance: 1,
            });
            item.setPosition(150, 150);
            
            item.on('drag', function(pointer, dragX, dragY){
                item.setPosition(dragX, dragY);
            }, this);
            item.on('dragend', function(pointer, dragX, dragY, dropped){
            }, this);
        }
    }
}
