"use client";
import React from "react";

export default function Footer() {
	return (
		<footer style={{borderTop: "1px solid #e6e6e6", padding: "18px 20px", marginTop: 40, color: "#666", fontSize: 14}}>
			<div style={{maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
				<div>© {new Date().getFullYear()} Investair</div>
				<div style={{display: "flex", gap: 12}}>
					<a href="/about" style={{color: "#666", textDecoration: "none"}}>About</a>
					<a href="/terms" style={{color: "#666", textDecoration: "none"}}>Terms</a>
					<a href="/privacy" style={{color: "#666", textDecoration: "none"}}>Privacy</a>
				</div>
			</div>
		</footer>
	);
}

