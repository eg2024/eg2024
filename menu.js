import { Scene } from "phaser";

export class MainMenu extends Scene
{
    constructor() {
        super("menu");
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        const width = this.game.config.width;
        const height = this.game.config.height;
        const logo_size = 250;

        this.add.image(width/2, logo_size/2, "main_logo");

        // Render buttons for minigames in a 2x2 grid.
        let minigames = ["gym", "knit", "template", "template"];

        const ncols = 2, nrows = 2, size = 145, space = 10;
        const cx = width/2, cy = logo_size + (height - logo_size)/2;
        const sx = cx - (ncols*size + (ncols-1)*space)/2 + size/2;
        const sy = cy - (nrows*size + (nrows-1)*space)/2 + size/2;
        const dd = size + space;

        for (let i = 0; i != minigames.length; i+=1) {
            const row = i % 2;
            const col = (i / 2) >> 0;
            const x = sx+row*dd;
            const y = sy+col*dd;

            let obj = this.add.image(x, y, minigames[i] + "_logo");
            obj.setInteractive();
            obj.on("pointerdown", function (pointer) {
                this.scene.start(minigames[i]);
            }, this);
        }
    }
}
