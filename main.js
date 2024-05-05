import * as Phaser from "phaser";

import { Preloader } from "./preloader.js";
import { MainMenu } from "./menu.js";

// CHANGE: Import new minigames here.
import { Game as template } from "./minigame_template.js";
import { Game as gym  } from "./minigame_gym.js";
import { Game as snatch } from "./minigame_snatch.js";
import { Game as puzzle } from "./minigame_puzzle.js";
import { Game as sorting } from "./minigame_sorting.js";
import { Game as hike } from "./minigame_hike.js";

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
