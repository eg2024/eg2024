import { Scene } from "phaser";

export class Game extends Scene
{
    constructor() {
        super("gym");
    }

    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Set background
        this.cameras.main.setBackgroundColor(0xffffff);

        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) { this.scene.start("menu"); }, this);

        // Add score text.
        let score = 0;
        let text = this.add.text(
            width/2, 40,
            "" + score, {
            font: "65px Arial",
            fill: "#ff0044",
            align: "center"
        });
        text.setOrigin(0.5, 0.5);


        let erik = this.add.sprite(width/2, height/2, "gym_erik_down");
        erik.setInteractive();
        erik.on("pointerdown", function (pointer) {
            erik.setTexture("gym_erik_up");
            score += 1;
            text.setText("" + score);
        }, this);

        erik.on("pointerup", function (pointer) {
            erik.setTexture("gym_erik_down");
        }, this);
    }
}
