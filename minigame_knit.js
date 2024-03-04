import { Scene } from "phaser";

export class Game extends Scene
{
    constructor() {
        super("knit");
    }

    create() {
        // Check examples in https://labs.phaser.io/
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Set background
        this.cameras.main.setBackgroundColor(0xffffff);

        // Add score text.
        let score = 0;
        let text = this.add.text(
            width/2, 60,
            "" + score, {
            font: "65px Arial",
            fill: "#440080",
            align: "center"
        });
        text.setOrigin(0.5, 0.5);

        //  We need 1 extra pointers, as we only get 1 by default
        this.input.addPointer(1);
        const left = this.add.rectangle(0, 0, width/2, height, 0x008800, 0.1);
        const right = this.add.rectangle(width/2, 0, width/2, height, 0x000088, 0.1);
        left.setOrigin(0, 0);
        right.setOrigin(0, 0);
        left.setInteractive();
        right.setInteractive();

        this.left_down = false;
        this.right_down = false;

        left.on('pointerdown',  pointer => this.left_down = true, this);
        left.on('pointerup',    pointer => this.left_down = false, this);
        right.on('pointerdown', pointer => this.right_down = true, this);
        right.on('pointerup',   pointer => this.right_down = false, this);

        // Graphics to render tracks.
        this.graphics = this.add.graphics();

        // Add back button.
        let back = this.add.image(width - 40, 40, "back");
        back.setInteractive();
        back.on("pointerdown", function (p) { this.scene.start("menu"); }, this);        
    }

    update() {
        let graphics = this.graphics;
        graphics.clear();

        const width = this.game.config.width;
        const height = this.game.config.height;

        graphics.fillStyle(0xff0000, 0.1);
        graphics.fillCircle(width*1/4, height*3/4, this.left_down ? 40 : 10);
        graphics.fillCircle(width*3/4, height*3/4, this.right_down ? 40 : 10);
    }

    drawTrack(graphics, record, y, t, max_t, width, r) {
        for (let i=0; i!=record.length; i++) {
            let [x1, x2, color] = record[i];
            if(x2 == 0) { x2 = t; }
            x1 = x1/max_t * width;
            x2 = x2/max_t * width;

            graphics.fillStyle(color);
            graphics.fillEllipse(x1, y, 4, 2*r);
            graphics.fillRect(x1, y-r, x2-x1, 2*r);
            graphics.fillEllipse(x2, y, 4, 2*r);
        }
    }

}
