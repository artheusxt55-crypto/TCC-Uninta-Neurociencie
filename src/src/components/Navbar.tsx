
import React from "react";
import { Brain } from "lucide-react";

export default function Navbar() {
    return (
        <header className="neuro-navbar">
            <div className="neuro-navbar-inner">

                <a href="/" className="neuro-logo">
                    <span className="neuro-logo-icon">
                        <Brain size={18} />
                    </span>

                    <span>
                        NEURO<span>-EDU</span>
                    </span>
                </a>

                <button className="neuro-create-account">
                    Criar conta
                </button>

            </div>
        </header>
    );
}
