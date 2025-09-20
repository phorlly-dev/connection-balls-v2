import * as React from "react";

// Lazy load the Phaser game
const PhaserGame = React.lazy(() => import("./PhaserGame"));
const Header = React.lazy(() => import("./Header"));
const Footer = React.lazy(() => import("./Footer"));

const Content = ({ player, onLogout }) => {
    const phaserRef = React.useRef();

    return (
        <div className="game-container">
            {/* HEADER */}
            <Header player={player} onLogout={onLogout} />

            {/* GAME BOARD */}
            <main className="phaser-wrapper">
                <PhaserGame ref={phaserRef} player={player} />
            </main>

            {/* FOOTER */}
            <Footer />
        </div>
    );
};

export default Content;
