import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './navbar.jsx'

export default function Layout() {
  return (
    <div className="app-root">
      <Navbar />
      <div className="app-content">
        <Outlet />
      </div>
      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} Feedback Analyser</div>
      </footer>
    </div>
  )
}
