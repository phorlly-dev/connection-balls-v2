import * as Phaser from "phaser";
import GameEngine from "./scenes/Game";
import Boot from "./scenes/Boot";
import Preload from "./scenes/Preload";
import { bg, height, width } from "./consts";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig

const config = {
    type: Phaser.AUTO,
    backgroundColor: bg,
    width,
    height,
    // scale: {
    //     mode: Phaser.Scale.FIT,
    //     autoCenter: Phaser.Scale.CENTER_BOTH,
    //     width: width,
    //     height: height,
    // },
    physics: {
        default: "arcade",
        debug: false,
        arcade: {
            gravity: { y: 200 },
        },
    },
    scene: [Boot, Preload, GameEngine],
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
