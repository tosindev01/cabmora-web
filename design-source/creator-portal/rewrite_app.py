import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Replace export default function App() with function LandingPage()
content = content.replace("export default function App() {", "function LandingPage() {")

# At the top add react-router-dom imports
imports = """import { useState, useEffect, useRef, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
"""

content = re.sub(r'import \{ useState[^}]*\} from "react";', imports, content, count=1)

# At the bottom, add the new App component
new_app = """

/* ─────────────────────────────────────────────
   Root App
───────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
"""

content += new_app

with open("src/App.tsx", "w") as f:
    f.write(content)
