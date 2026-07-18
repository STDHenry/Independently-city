// =========================================================
// INDEPENDENT CITY - UTILS.JS (MÁY CHỦ TRUNG TÂM - PHẦN 1)
// =========================================================

// Chìa khóa kết nối đám mây Supabase dùng chung toàn bộ hệ thống Independent City
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dnRua3Buc3VsYXd4eGlnY3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTA2NjksImV4cCI6MjA5OTg2NjY2OX0.rPsGAcSt3Yv049dxUTVNaUlpw8hHEpTpr84HYv7dHEg";

// Xuất (Export) biến kết nối clientDB để mọi file .js khác đều dùng chung một bộ não
export const clientDB = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Định nghĩa biến phiên làm việc ngầm để đồng bộ tên cư dân giữa các Iframe
export let ACTIVE_USER_SESSION = {
    username: "",
    email: ""
};

// Hàm tiện ích để thiết lập danh tính cư dân sau khi Auth thành công
export function setGlobalSession(user, mail) {
    ACTIVE_USER_SESSION.username = user;
    ACTIVE_USER_SESSION.email = mail;
}
// =========================================================
// INDEPENDENT CITY - UTILS.JS (THÔNG BÁO POPUP REALTIME - PHẦN 2)
// =========================================================

// Hàm toàn cục để đẩy thông báo Popup Zalo-style bật ra từ góc màn hình
export function showNotificationPopup(title, message) {
    // Tự động tìm kiếm hộp chứa container ở file gốc hoặc xuyên qua kính Iframe cha
    const container = document.getElementById('notification-container') || window.parent.document.getElementById('notification-container');
    if (!container) return;

    // Tự động tạo khối HTML bao bọc thông báo mới tinh
    const popup = document.createElement('div');
    popup.style.cssText = `
        background-color: #001F3F; 
        color: #ffffff; 
        padding: 15px; 
        width: 280px;
        border: 1px solid #ffffff; 
        border-radius: 0px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateY(20px); 
        opacity: 0; 
        transition: all 0.3s ease-in-out;
        font-family: 'Segoe UI', Arial, sans-serif; 
        display: flex; 
        flex-direction: column; 
        gap: 5px;
    `;

    // Đổ ruột dữ liệu văn bản vào khối
    popup.innerHTML = `
        <div style="font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</div>
        <div style="font-size: 12px; color: #cbd5e0; word-break: break-word;">${message}</div>
    `;

    container.appendChild(popup);

    // Kích hoạt hiệu ứng mượt mà đẩy khối giật ngược lên từ góc dưới
    setTimeout(() => {
        popup.style.transform = 'translateY(0)';
        popup.style.opacity = '1';
    }, 50);

    // Tự động đếm ngược 4 giây để thu hồi và xóa bay màu khối thông báo
    setTimeout(() => {
        popup.style.transform = 'translateY(-20px)';
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }, 4000);
}
/* KHÓA ĐỢT 4: HOÀN THÀNH FILE UTILS.JS. ĐỢT 5 CHÚNG TA SẼ BẮT ĐẦU CHUYỂN SANG FILE TRUNG TÂM INDEX.HTML */

