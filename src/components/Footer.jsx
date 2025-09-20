import * as React from "react";
import { emitEvent, offEvents, onEvents } from "../hooks/remote";

const Footer = () => {
    const [color, setColor] = React.useState(3);
    const [messages, setMessages] = React.useState({
        text: "Draw flexible lines to connect same colors!",
        color: "black",
    });

    // Listen for Phaser events and update state
    React.useEffect(() => {
        const events = ["color", "status"];
        const callbacks = [
            (data = 3) => setColor(data),
            (data = {}) => setMessages((prev) => ({ ...prev, ...data })),
        ];

        onEvents({ events, callbacks });
        return () => offEvents({ events, callbacks });
    }, [color]);

    return (
        <footer className="game-footer mt-1">
            <section className="text-muted fw-medium small">
                Draw curved lines • Connect same colors •{" "}
                <span className="text-primary fw-bold fs-6">{color}</span>{" "}
                colors
            </section>

            <section className="controls">
                <button
                    onClick={() => emitEvent("hint")}
                    className="control-btn hint-btn rounded-circle"
                    title="View Info"
                >
                    <i className="fa fa-question-circle" aria-hidden="true"></i>
                </button>
                <button
                    onClick={() => emitEvent("reset")}
                    className="control-btn reset-btn rounded-circle"
                    title="Reset Game"
                >
                    <i className="fa fa-refresh" aria-hidden="true"></i>
                </button>
            </section>

            <div className="status" style={{ color: messages.color }}>
                {messages.text}
            </div>
        </footer>
    );
};

export default Footer;
