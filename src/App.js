import './App.css';
import React from 'react';
import Photobooth from "./components/Photobooth";
import "./styles/global.css";

const logoSrc = "/assets/logo/jiggleduo-logo.png";

function App() {
  return (
    <div className="App" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      
      {/* HEADER */}
      <div style={{
        width: "100%",
        maxWidth: "1200px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "20px 32px",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        borderRadius: "0 0 20px 20px"
      }}>
        <img 
          src={logoSrc} 
          alt="logo"
          style={{ width: 70, borderRadius: 12 }}
        />
        <h1 style={{
          fontFamily: "CantikaCute",
          color: "#d17b88",
          margin: 0,
          fontSize: 28,
          letterSpacing: 1
        }}>
          Photobooth
        </h1>
      </div>

      {/* MAIN */}
      <div style={{
        flex: "1",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 0"
      }}>
        <Photobooth />
      </div>

    </div>
  );
}

export default App;