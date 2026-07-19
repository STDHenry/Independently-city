// =========================================================
// INDEPENDENT CITY - UTILS.JS (MÁY CHỦ TRUNG TÂM)
// =========================================================

// Hệ thống tự động bốc biến toàn cục 'supabase' từ link nhúng Cloudflare ở file chủ
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dnRua3Buc3VsYXd4eGlnY3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTA2NjksImV4cCI6MjA5OTg2NjY2OX0.rPsGAcSt3Yv049dxUTVNaUlpw8hHEpTpr84HYv7dHEg";

export const clientDB = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export let ACTIVE_USER_SESSION = { username: "", email: "" };
export function setGlobalSession(user, mail) {
    ACTIVE_USER_SESSION.username = user;
    ACTIVE_USER_SESSION.email = mail;
}

export function showNotificationPopup(title, message) {
    const container = document.getElementById('notification-container') || window.parent.document.getElementById('notification-container');
    if (!container) return;

    const popup = document.createElement('div');
    popup.style.cssText = `
        background-color: #001F3F; color: #ffffff; padding: 15px; width: 280px;
        border: 1px solid #ffffff; border-radius: 0px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateY(20px); opacity: 0; transition: all 0.3s ease-in-out;
        font-family: 'Segoe UI', Arial, sans-serif; display: flex; flex-direction: column; gap: 5px;
    `;

    popup.innerHTML = `
        <div style="font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</div>
        <div style="font-size: 12px; color: #cbd5e0; word-break: break-word;">${message}</div>
    `;

    container.appendChild(popup);

    setTimeout(() => {
        popup.style.transform = 'translateY(0)';
        popup.style.opacity = '1';
    }, 50);

    setTimeout(() => {
        popup.style.transform = 'translateY(-20px)';
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }, 4000);
}
