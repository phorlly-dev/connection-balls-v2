import * as React from "react";
import { emitEvent, offEvents, onEvents } from "../hooks/remote";
import { formatNumber } from "../hooks/format";

const Header = ({ player, onLogout }) => {
    const [muted, setMuted] = React.useState(false);
    const [score, setScore] = React.useState(0);
    const [level, setLevel] = React.useState(1);

    // Listen for Phaser events and update state
    React.useEffect(() => {
        const events = ["score", "level"];
        const callbacks = [
            (data = 0) => setScore(data),
            (data = 1) => setLevel(data),
        ];

        onEvents({ events, callbacks });
        return () => offEvents({ events, callbacks });
    }, [score, level]);

    return (
        <header className="header container mb-1">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                {/* Left: Player, Score, Level */}
                <section className="d-flex flex-wrap align-items-center gap-5 mb-2 mb-md-0">
                    <div className="h6 mb-0 d-flex align-items-center ms-1">
                        <i className="fa fa-user me-1" aria-hidden="true"></i>
                        <span className="fw-semibold text-primary text-capitalize ms-1">
                            {player}
                        </span>
                    </div>

                    <div className="h6 fw-semibold mb-0">
                        Score:
                        <span className="fw-bold text-success ms-1">
                            {formatNumber(score)}
                        </span>
                    </div>

                    <div className="h6 mb-0 text-muted">
                        Level:
                        <span className="fw-bold ms-1 text-primary">
                            {level}
                        </span>
                    </div>
                </section>

                {/* Right: Controls */}
                <section className="d-flex align-items-center gap-3">
                    {/* Sound toggle button */}
                    <button
                        onClick={() => {
                            const newMute = !muted;
                            setMuted(newMute);
                            emitEvent("sound", newMute);
                        }}
                        title="Toggle sound on/off"
                        aria-label="Toggle sound"
                        className={`control-btn btn-sm rounded-circle ${
                            muted ? "muted" : "volume"
                        }`}
                    >
                        <i
                            className={`fa ${
                                muted ? "fa-volume-mute" : "fa-volume-up"
                            }`}
                            aria-hidden="true"
                        ></i>
                    </button>

                    {/* Exit button */}
                    <button
                        onClick={onLogout}
                        title="Exit from game"
                        aria-label="Exit"
                        className="control-btn btn-sm off rounded-circle"
                    >
                        <i className="fa fa-power-off"></i>
                    </button>
                </section>
            </div>
        </header>
    );
};

export default Header;
