import { audio, colors, status } from "../consts";
import { drawPath, isTooEasy, playSound, setOrCutScore } from "./helper";
import {
    playConnectEffect,
    playLevelCompleteEffect,
    setDelay,
    setStatus,
    setSubtitle,
    setTitle,
} from "./state";

const Payloads = {
    initLevel(scene, level) {
        scene.currentLevel = level;
        setTitle(scene.currentLevel);

        scene.balls.forEach((ball) => ball.destroy());
        scene.balls = [];
        scene.paths = [];
        scene.isDragging = false;
        scene.currentPath = null;
        scene.lineGraphics.clear();

        const levelConfig = generateLevelConfig(scene, level);

        levelConfig.balls.forEach((config) => {
            const colorInfo = colors.find((c) => c.key === config.color);
            const ballContainer = scene.add
                .container(config.x, config.y)
                .setSize(scene.ballRadius * 2, scene.ballRadius * 2)
                .setScale(0.8)
                .setInteractive();

            const mainCircle = scene.add
                .circle(0, 0, scene.ballRadius * 1.2, colorInfo.hex)
                .setStrokeStyle(3, 0xbdc3c7);
            const highlight = scene.add.circle(-8, -8, 8, 0xffffff, 0.7);
            ballContainer.add([mainCircle, highlight]);

            ballContainer.id = config.id;
            ballContainer.colorKey = config.color;
            ballContainer.colorHex = colorInfo.hex;
            ballContainer.connected = false;
            ballContainer.connectedTo = null;
            ballContainer.mainCircle = mainCircle;

            scene.balls.push(ballContainer);
        });

        setStatus(status);
    },
    generateLevelConfig(scene, level) {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;

        // --- Random 3–4 colors each level ---
        const numColors = Phaser.Math.Between(3, 4);
        setSubtitle(numColors);

        // --- Balls per color (max 2) ---
        const ballsPerColor = Math.min(2 + Math.floor(level / 24), 2);

        // --- Limit total balls by screen size ---
        const maxBalls = Math.floor(
            (gameWidth * gameHeight) / (scene.ballRadius * 8 * scene.ballRadius)
        );
        scene.totalBalls = Math.min(numColors * ballsPerColor, maxBalls);

        const minDistance = scene.ballRadius * 3 + 5;
        const margin = scene.ballRadius * 2;

        // --- Adaptive spacing rule ---
        const sameColorMinDistance = Math.max(
            scene.ballRadius * 4,
            Math.max(gameWidth, gameHeight) / (2.5 + Math.floor(level / 8))
        );

        let positions = [];
        let ballConfig = [];
        let attempts = 0;

        do {
            positions = [];
            attempts = 0;

            // --- Generate random positions ---
            while (positions.length < scene.totalBalls && attempts < 6000) {
                const x = Phaser.Math.Between(margin, gameWidth - margin);
                const y = Phaser.Math.Between(margin, gameHeight - margin);

                let isValid = true;
                for (const pos of positions) {
                    if (
                        Phaser.Math.Distance.Between(x, y, pos.x, pos.y) <
                        minDistance
                    ) {
                        isValid = false;
                        break;
                    }
                }

                if (isValid) positions.push({ x, y });
                attempts++;
            }

            // --- Assign colors safely ---
            ballConfig = [];
            const availableColors = [...colors];
            Phaser.Utils.Array.Shuffle(positions);

            if (positions.length < scene.totalBalls) continue; // retry

            for (let i = 0; i < numColors; i++) {
                const color = availableColors[i];

                for (let j = 0; j < ballsPerColor; j++) {
                    const idx = i * ballsPerColor + j;
                    if (!positions[idx]) continue;

                    // enforce same-color spacing
                    if (j > 0) {
                        const partner = ballConfig.find(
                            (b) => b.color === color.key
                        );
                        if (partner) {
                            const dist = Phaser.Math.Distance.Between(
                                positions[idx].x,
                                positions[idx].y,
                                partner.x,
                                partner.y
                            );

                            if (dist < sameColorMinDistance) continue;
                        }
                    }

                    ballConfig.push({
                        x: positions[idx].x,
                        y: positions[idx].y,
                        color: color.key,
                        id: `${color.key}${j + 1}`,
                    });
                }
            }
        } while (ballConfig.length < scene.totalBalls || isTooEasy(ballConfig));

        return { balls: ballConfig };
    },
    checkCompletion(scene, { startBall, endBall, color }) {
        if (scene.balls.every((ball) => ball.connected)) {
            setStatus(
                `🎉 You win!. Level ${scene.currentLevel} Complete!`,
                "green"
            );
            playSound(scene, audio.key.win);
            playLevelCompleteEffect(scene, scene.currentLevel);
            setOrCutScore(scene, scene.totalBalls);
            scene.currentLevel++;
            setDelay(scene, {
                callback: () => initLevel(scene, scene.currentLevel),
            });
        } else {
            setStatus("✅ Great connection!", "blue");
            setOrCutScore(scene, scene.totalBalls);
            playSound(scene, audio.key.connect);
            playConnectEffect(scene, { startBall, endBall, color });
        }
    },
    drawAllPaths(scene) {
        scene.lineGraphics.clear();
        const allPaths = scene.currentPath
            ? [...scene.paths, scene.currentPath]
            : scene.paths;
        allPaths.forEach((path) => drawPath(scene, path));
    },
    getBallAt(scene, x, y) {
        return scene.balls.find(
            (ball) =>
                Phaser.Math.Distance.Between(x, y, ball.x, ball.y) <
                scene.ballRadius
        );
    },
    updateBallStyle(ball) {
        ball.mainCircle.setStrokeStyle(
            ball.connected ? 4 : 3,
            ball.connected ? 0x2c3e50 : 0xbdc3c7
        );
    },
};

export const {
    initLevel,
    generateLevelConfig,
    checkCompletion,
    drawAllPaths,
    getBallAt,
    updateBallStyle,
} = Payloads;
