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
            "heart_full": "heart_full.png",
            "heart_empty": "heart_empty2.png",

            // Snatch
            "snatch_logo": "snatch_logo.png",
            "snatch_good0": "snatch_berry.png",
            "snatch_good1": "snatch_candy1.png",
            "snatch_bad0": "snatch_pill_60px.png",
            "snatch_bad1": "snatch_bluepill_70x42.png",
            "snatch_bad2": "snatch_earring1.png",

            // Gym assets
            "gym_logo": "gym_logo.png",
            "gym_player_up": "gym_erik_up.png",
            "gym_player_down": "gym_erik_down.png",
            "gym_buddy_up": "gym_erik_up.png",
            "gym_buddy_down": "gym_erik_down.png",

            // Puzzle assets
            "puzzle_logo": "puzzle_logo.png",
            "puzzle_img1": "puzzle_img1.png",
            "puzzle_a0": "puzzle_pieces/piece0.png",
            "puzzle_a1": "puzzle_pieces/piece1.png",
            "puzzle_a2": "puzzle_pieces/piece2.png",
            "puzzle_a3": "puzzle_pieces/piece3.png",
            "puzzle_a4": "puzzle_pieces/piece4.png",
            "puzzle_a5": "puzzle_pieces/piece5.png",
            "puzzle_a6": "puzzle_pieces/piece6.png",
            "puzzle_a7": "puzzle_pieces/piece7.png",
            "puzzle_a8": "puzzle_pieces/piece8.png",
            "puzzle_a9": "puzzle_pieces/piece9.png",
            "puzzle_a10": "puzzle_pieces/piece10.png",
            "puzzle_a11": "puzzle_pieces/piece11.png",

            // Sorting assets
            "sorting_logo": "sorting_logo.png",
            "sorting_freezerbox": "sorting_freezerbox.png",
            "sorting_wardrobe": "sorting_wardrobe.png",

            // Knit assets
            "knit_logo": "knit_logo.png",

            // Template level assets
            "template_logo": "template_logo.png",
        }
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        for (let k in images)
            this.load.image(k, images[k]);
    }

    create() {
        this.scene.start(location.hash.substr(1) || "menu");
    }
}
