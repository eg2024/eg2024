import { Scene } from "phaser";

export class Game extends Scene
{
    constructor() {
        // CHANGE: this is the name of the scene, so menu scene can switch to it.
        super("template");
    }

    init(data) {
        this.data = data;
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

        // Add text in center.
        let text = this.add.text(width/2, height/2, "TODO", {
            font: "65px Arial",
            fill: "#ff0044",
            align: "center",
        });
        text.setOrigin(0.5, 0.5);
    }
}
