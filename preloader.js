import { Scene } from "phaser";

export class Preloader extends Scene
{
    constructor() {
        super("preloader");
    }

    init() {
        // Show a progress bar while loading assets.
        const width = this.game.config.width;
        const height = this.game.config.height;
        const bar_w = width*0.8;
        const bar_h = 32
        const color = 0x881111;

        this.add.rectangle(width/2, height/2, bar_w, bar_h).setStrokeStyle(1, color);
        const bar = this.add.rectangle(width/2 - bar_w/2, height/2, 0, bar_h, color);

        this.load.on("progress", (progress) => {
            bar.width = bar_w * progress;
            bar.x = width/2 - bar.width/2;
        });
    }

    preload() {
        let images = {
            // Main menu assets
            "main_logo": "main_logo.png",
            "back": "back.png",

            // Gym assets
            "gym_logo": "gym_logo.png",
            "gym_erik_up": "gym_erik_up.png",
            "gym_erik_down": "gym_erik_down.png",

            // Template level assets
            "template_logo": "template_logo.png",
        }
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        for (let k in images)
            this.load.image(k, images[k]);
    }

    create() {
        this.scene.start("menu");
    }
}