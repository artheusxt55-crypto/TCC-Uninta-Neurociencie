import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuraAI from "./pages/AuraAI";
import LabPage from "./pages/LabPage";
import LoginPage from "./pages/LoginPage";

/* =========================================================
 * APP — ROTEADOR
 *
 * A Home (LabPage) e seus módulos vivem em ./pages/LabPage e
 * ./components/home. Rotas inalteradas: /login, /aura e a Home
 * como fallback (/*).
 * ========================================================= */

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/" element={<LoginPage />} />

                <Route path="/aura" element={<AuraAI />} />
                <Route path="/aura/" element={<AuraAI />} />

                <Route path="/*" element={<LabPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
