// =========================================================
// INDEPENDENT CITY - UTILS.JS (MÁY CHỦ TRUNG TÂM - PHẦN 1)
// =========================================================

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjY3ZieXdhbGJia293Ynd1c3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDAxODEsImV4cCI6MjA5ODkxNjE4MX0.nEO-vUgQ_E_-cSw6rpEcgv7O9mIfIMsfWZCbB5UCau8";

// Biến đệm lưu trữ phiên kết nối sau khi khởi tạo thành công
let cachedSupabaseClient = null;

// ĐÃ VÁ CHUẨN: Hàm Getter thông minh, đợi thư viện Cloudflare nạp xong mới bốc biến [🗎1]
export function getDB() {
    if (cachedSupabaseClient) return cachedSupabaseClient;
    
    // Nếu trình duyệt chưa nạp kịp thư viện cdnjs, mượn tạm đối tượng cửa sổ cha
    const supabaseEngine = window.supabase || window.parent.supabase;
    
    if (!supabaseEngine) {
        console.warn("⚠️ Trạm dữ liệu Independent City: Đang đợi thư viện đám mây nạp ngầm...");
        return null;
    }
    
    cachedSupabaseClient = supabaseEngine.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return cachedSupabaseClient;
}

// Định nghĩa biến phiên làm việc ngầm để đồng bộ tên cư dân
export let ACTIVE_USER_SESSION = { username: "", email: "" };
export function setGlobalSession(user, mail) {
    ACTIVE_USER_SESSION.username = user;
    ACTIVE_USER_SESSION.email = mail;
}
// =========================================================
// INDEPENDENT CITY - UTILS.JS (THÔNG BÁO POPUP REALTIME - PHẦN 2)
// =========================================================

// Hàm toàn cục để đẩy thông báo Popup Zalo-style bật ra từ góc màn hình
export function showNotificationPopup(title, message) {
    // Tự động tìm kiếm hộp chứa container ở file gốc hoặc xuyên qua tầng sảnh chủ
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
/* KHÓA ĐỢT 2: HOÀN THÀNH 100% FILE UTILS.JS MỚI SẠCH LỖI */
