import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./navbar.css"; 

export default function Navbar({
    brand = "Feedback Analyser",
    links = [
        { to: "/", label: "Home" },
        { to: "/analyze", label: "Analyze" },
        { to: "/reports", label: "Reports" },
        { to: "/settings", label: "Settings" },
    ],
}) {
    const [open, setOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
        setOpen(false);
    };

    return (
        <header className="fa-navbar">
            <div className="fa-navbar__bar">
                <NavLink to="/" className="fa-navbar__brand" aria-label={brand}>
                    <span className="fa-navbar__logo" aria-hidden>
                        {brand
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                    </span>
                    <span>{brand}</span>
                </NavLink>

                <nav className="fa-navbar__links" aria-label="Primary">
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            className={({ isActive }) =>
                                "fa-navbar__link" + (isActive ? " fa-navbar__link--active" : "")
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="fa-navbar__actions">
                    {isAuthenticated ? (
                        <div className="fa-navbar__user">
                            <span className="fa-navbar__user-name">{user?.name || user?.email}</span>
                            <button
                                onClick={handleLogout}
                                className="fa-navbar__btn"
                                aria-label="Sign out"
                            >
                                Sign out
                            </button>
                        </div>
                    ) : (
                        <NavLink to="/login" className="fa-navbar__btn">
                            Sign in
                        </NavLink>
                    )}

                    <button
                        className="fa-navbar__hamburger"
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        onClick={() => setOpen((s) => !s)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                            {open ? (
                                <path d="M6 18L18 6M6 6l12 12" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            ) : (
                                <path d="M3 7h18M3 12h18M3 17h18" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <div className="fa-navbar__mobile" role="menu" aria-label="Mobile menu">
                    <nav className="fa-navbar__links">
                        {links.map((l) => (
                            <NavLink
                                key={l.to}
                                to={l.to}
                                className={({ isActive }) =>
                                    "fa-navbar__link" + (isActive ? " fa-navbar__link--active" : "")
                                }
                                onClick={() => setOpen(false)}
                            >
                                {l.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="fa-navbar__mobile-auth">
                        {isAuthenticated ? (
                            <>
                                <div className="fa-navbar__mobile-user">
                                    {user?.name || user?.email}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="fa-navbar__btn fa-navbar__btn--mobile"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <NavLink
                                to="/login"
                                className="fa-navbar__btn fa-navbar__btn--mobile"
                                onClick={() => setOpen(false)}
                            >
                                Sign in
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
