import * as Phaser from "phaser";

import { Preloader } from "./preloader.js";
import { MainMenu } from "./menu.js";

// CHANGE: Import new minigames here.
import { Game as template } from "./minigame_template.js";
import { Game as gym } from "./minigame_gym.js";

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
    audio: {disableWebAudio: true},
    scene: [
        Preloader,
        MainMenu,

        // CHANGE: Add new minigames scenes here.
        template,
        gym,
    ]
};

window.game = new Phaser.Game(config);
