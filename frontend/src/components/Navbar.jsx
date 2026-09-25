import "./Navbar.css";
function Navbar() {
    return (
        <header className="navbar">
            <nav className="navbar-container">

                <a href="/" className="logo">
                    Wedding Photo Finder
                </a>

                <ul className="nav-links">
                    <li>
                        <a href="/">Home</a>
                    </li>

                    <li>
                        <a href="#how-it-works">How It Works</a>
                    </li>

                    <li>
                        <a href="/login" className="login-link">
                            Photographer Login
                        </a>
                    </li>
                </ul>

            </nav>
        </header>
    );
}

export default Navbar;