"use client"

export default function PrintButton() {
    return (
        <button 
            onClick={() => window.print()} 
            className="idlist-create-btn"
            style={{ backgroundColor: "#5a4a32", borderColor: "#5a4a32" }}
        >
             Print ID Cards
        </button>
    )
}