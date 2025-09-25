import { emitEvent, emitEvents, onEvent } from "../../hooks/remote";
import { audio, hintText, start, status } from "../consts";
import { pointerDown, pointerMove, pointerUp } from "../utils/controller";
import { playSound } from "../utils/helper";
import { initLevel } from "../utils/payload";
import { setDelay, setStatus } from "../utils/state";

class GameEngine extends Phaser.Scene {
    constructor() {
        super(start);

        // Declare properties
        this.balls = [];
        this.paths = [];
        this.currentPath = null;
        this.isDragging = false;
        this.ballRadius = 25;
        this.level = 1;
        this.score = 0;
        this.player = null;
        this.lineGraphics = null;
    }

    init() {
        emitEvent("current-scene-ready", this);
        onEvent("firebase-data-loaded", (data) => this.resetGame(data));
    }

    create() {
        // --- Graphics object for lines ---
        this.lineGraphics = this.add.graphics();

        // --- Setup game level ---
        initLevel(this, this.level);
        this.control();

        // --- Audio ---
        this.sound.play(audio.key.bg, { loop: true, volume: 0.5 });

        // --- Input listeners (once, not per frame) ---
        this.input.on("pointerdown", this.handlePointerDown, this);
        this.input.on("pointermove", this.handlePointerMove, this);
        this.input.on("pointerup", this.handlePointerUp, this);
    }

    resetGame(data = {}) {
        this.player = data.player;
        this.level = data.level || 1;
        console.log(this.level);

        this.score = data.score || 0;
    }

    control() {
        onEvent("sound", (mute) => {
            this.sound.mute = mute;
            this.sound.play(audio.key.close);
        });
        onEvent("reset", () => {
            initLevel(this, this.level);
            playSound(this, audio.key.click);
        });
        onEvent("hint", () => {
            setStatus(hintText, "blue");
            playSound(this, audio.key.click);
            setDelay(this, { callback: () => setStatus(status) });
        });
    }
    // --- INPUT HANDLING ---
    handlePointerDown(pointer) {
        // Change cursor when drawing starts
        this.input.setDefaultCursor("crosshair");

        pointerDown(this, pointer);
    }

    handlePointerMove(pointer) {
        pointerMove(this, pointer);
    }

    handlePointerUp(pointer) {
        // Reset cursor back to normal
        this.input.setDefaultCursor("default");

        pointerUp(this, pointer);
    }

    update() {
        //Auto sync UI
        this.syncUI();
    }

    syncUI() {
        emitEvents({
            events: ["level", "score"],
            args: [this.level, this.score],
        });
    }

    // --- Cleanup when scene stops ---
    shutdown() {
        this.input.removeAllListeners();
        this.sound.stopAll();
        if (this.lineGraphics) this.lineGraphics.clear();
    }
}

export default GameEngine;
