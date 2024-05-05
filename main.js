import * as Phaser from "phaser";

// CHANGE: Import new minigames here.
import { Game as template } from "./minigame_template.js";
import { Game as gym  } from "./minigame_gym.js";
import { Game as snatch } from "./minigame_snatch.js";
import { Game as puzzle } from "./minigame_puzzle.js";
import { Game as sorting } from "./minigame_sorting.js";
import { Game as hike } from "./minigame_hike.js";


class Preloader extends Phaser.Scene
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
            "puzzle_img0": "puzzle_erik0.png",
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

            // Hike assets
            "hike_logo": "hike_sprite1.png",
            "hike_player1": "hike_erik.png",
            "hike_player2": "hike_gabca.png",
            "hike_player3": "hike_klara.png",
            "hike_background": "hike_background.webp",
            "hike_dino": "hike_dino.png",
            "hike_treestump": "hike_treestump.png",
            "hike_rock": "hike_rock.png",
            "hike_tree": "hike_tree.png",
            "hike_funicular": "hike_funicular.png",
            "hike_pterodactyl": "hike_pterodactyl.png",
            "hike_geometry_dash": "hike_geometry_dash.png",

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

class MainMenu extends Phaser.Scene
{
    constructor() {
        super("menu");
    }

    create() {
        this.cameras.main.setBackgroundColor(0xffffff);

        const width = this.game.config.width;
        const height = this.game.config.height;
        const logo_size = 200;

        this.add.image(width/2, logo_size/2, "main_logo");

        // Render buttons for minigames in a 2x2 grid.
        let minigames = ["gym", "sorting", "snatch", "puzzle", "hike"];

        const ncols = 2, nrows = 3, size = 145, space = 5;
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

class Intro extends Phaser.Scene
{
    constructor() {
        super("intro");
    }

    init(data) {
        this.data = data;
    }

    create() {
        this.scene.bringToTop();

        const width = this.game.config.width;
        const height = this.game.config.height;

        let bg = this.add.rectangle(0, 0, width, height, 0xf0f0f0).setOrigin(0, 0);
        bg.alpha = 0.95;

        this.add.text(
            width/8, 200, this.data["text"],
            {
                font: "24px Lato",
                fill: "#440080",
                align: "justify",
                wordWrap: { width: width * 6/8, useAdvancedWrap: true },
            },
        );

        this.add.rectangle(
            width*2/8, height*4/5, 100, 100, 0x800000
        ).setInteractive().on("pointerdown", () => {
            this.data["minigame"].scene.stop();
            this.scene.start("menu");
        });

        this.add.rectangle(
            width*6/8, height*4/5, 100, 100, 0x008000
        ).setInteractive().on("pointerdown", () => {
            this.scene.stop();
            this.data["minigame"].scene.resume();
        });
    }
}

class GameOver extends Phaser.Scene
{
    constructor() {
        super("gameover");
    }

    init(data) {
        this.data = data;
    }

    create() {
        this.scene.bringToTop();

        const width = this.game.config.width;
        const height = this.game.config.height;

        let bg = this.add.rectangle(0, 0, width, height, 0xf0f0f0).setOrigin(0, 0);
        bg.alpha = 0.80;

        this.add.text(
            width/8, 200, this.data["text"],
            {
                font: "24px Lato",
                fill: "#440080",
                align: "justify",
                wordWrap: { width: width * 6/8, useAdvancedWrap: true },
            },
        );

        this.add.rectangle(
            width*2/8, height*4/5, 100, 100, 0x800000
        ).setInteractive().on("pointerdown", () => {
            this.data["minigame"].scene.stop();
            this.scene.start("menu");
        });

        this.add.rectangle(
            width*6/8, height*4/5, 100, 100, 0x008000
        ).setInteractive().on("pointerdown", () => {
            this.data["minigame"].scene.restart({"restart": true});
            this.scene.stop();
        });
    }
}


const config = {
    type: Phaser.AUTO,
    width: 320,
    height: 640,
    parent: "game",
    backgroundColor: "#ffffff",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps: {
        // Lets not waste mobile battery.
        target: 30,
        //limit: 50,
        forceSetTimeOut: true,
    },
    render: {
        //desynchronized: true,
        //antialias: true,
    },
    audio: {disableWebAudio: true},
    scene: [
        Preloader,
        MainMenu,
        Intro,
        GameOver,

        // CHANGE: Add new minigames scenes here.
        template,
        gym,
        snatch,
        sorting,
        puzzle,
        hike,
    ]
};

window.game = new Phaser.Game(config);
window.Phaser = Phaser;
