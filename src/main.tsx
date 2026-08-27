import React from "react";
import ReactDOM from "react-dom/client";

function App() {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#090614",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Arial",
                fontSize: "30px",
            }}
        >
            NEURO-EDU FUNCIONANDO
        </div>
    );
}

ReactDOM.createRoot(
    document.getElementById("root")!
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
