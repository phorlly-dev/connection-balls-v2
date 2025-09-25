import * as Phaser from "phaser";
import { emitEvent } from "../../hooks/remote";
import { colors } from "../consts";

const States = {
    setStatus(text, color = "") {
        emitEvent("status", { text, color });
    },
    setTitle(level) {
        emitEvent("level", level);
    },
    setPoints(score) {
        emitEvent("score", score * 5);
    },
    setSubtitle(counter) {
        emitEvent("color", counter);
    },
    playConnectEffect(scene, { startBall, endBall, color }) {
        // Pulse balls
        scene.tweens.add({
            targets: [startBall.mainCircle, endBall.mainCircle],
            scale: 1.3,
            duration: 150,
            yoyo: true,
            ease: "Sine.easeInOut",
        });

        // Animate path highlight
        const g = scene.add.graphics();
        g.lineStyle(14, color, 1).strokePoints(
            [
                new Phaser.Math.Vector2(startBall.x, startBall.y),
                new Phaser.Math.Vector2(endBall.x, endBall.y),
            ],
            false,
            true
        );
        scene.tweens.add({
            targets: g,
            alpha: 0,
            duration: 500,
            onComplete: () => g.destroy(),
        });

        const message = Phaser.Utils.Array.GetRandom([
            "Great!",
            "Perfect!",
            "Awesome!",
            "Fantastic!",
            "Cool!",
        ]);

        // --- NEW: Popup text ---
        const text = makeText(scene, {
            message: `✨ ${message}`,
            x: (startBall.x + endBall.x) / 2,
            y: (startBall.y + endBall.y) / 2,
            fontSize: "20px",
            color: "#27ae60",
        });

        scene.tweens.add({
            targets: text,
            y: text.y - 40, // float up
            alpha: 0,
            duration: 2000,
            ease: "Cubic.easeOut",
            onComplete: () => text.destroy(),
        });
    },
    setDelay(scene, { delay = 1600, callback }) {
        scene.time.delayedCall(delay, callback);
    },
    playLevelCompleteEffect(scene, level) {
        // Flash message
        const { width, height } = scene.scale;
        const text = makeText(scene, {
            message: `🎉 Level ${level} Completed!`,
            x: width / 2,
            y: height / 2,
        });

        scene.tweens.add({
            targets: text,
            scale: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 2,
            onComplete: () => text.destroy(),
        });

        const emitterConfig = {
            x: { min: 0, max: scene.sys.game.config.width },
            y: 0,
            lifespan: 1500,
            speedY: { min: 200, max: 400 },
            scale: { start: 0.6, end: 0 },
            quantity: 4,
            blendMode: "ADD",
        };

        colors.forEach((c) => {
            const emitter = scene.add.particles(
                0,
                0,
                `particle_${c.key}`,
                emitterConfig
            );
            setDelay(scene, {
                callback: () => {
                    emitter.stop();
                    emitter.destroy(); // safe cleanup
                },
            });
        });
    },
    makeText(scene, { message, x, y, fontSize = "24px", color = "#3fb976ff" }) {
        return scene.add
            .text(x, y, message, {
                fontSize,
                fontStyle: "bold",
                color,
                stroke: "#ffffff",
            })
            .setOrigin(0.5);
    },
};

export const {
    setStatus,
    setTitle,
    setPoints,
    setSubtitle,
    playConnectEffect,
    setDelay,
    playLevelCompleteEffect,
    makeText,
} = States;
