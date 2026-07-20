// =================================================================
// INDEPENDENT CITY NETWORK - UTILS.JS (TRẠM ĐIỀU PHỐI ĐÁM MÂY TỐI CAO)
// =================================================================

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dnRua3Buc3VsYXd4eGlnY3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTA2NjksImV4cCI6MjA5OTg2NjY2OX0.rPsGAcSt3Yv049dxUTVNaUlpw8hHEpTpr84HYv7dHEg";

let cachedSupabaseClient = null;

// Bộ nhớ đệm tập trung (Centralized State) quản lý toàn bộ dữ liệu thành phố
export let CITY_STATE = {
    LOGGED_IN_USER: "",
    USER_EMAIL: "",
    CURRENT_BALANCE: 1000000,
    GLOBAL_PRODUCTS_LIST: []
};

// Hàm Getter thông minh hoãn giờ nạp biến, chống lệch pha miligiây của trình duyệt [🗎1]
export function getDB() {
    if (cachedSupabaseClient) return cachedSupabaseClient;
    const supabaseEngine = window.supabase || window.parent.supabase;
    if (!supabaseEngine) {
        console.warn("⚠️ Trạm utils.js: Đang chờ thư viện đám mây nạp ngầm...");
        return null;
    }
    cachedSupabaseClient = supabaseEngine.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return cachedSupabaseClient;
}

// ==========================================
// THUẬT TOÁN ĐĂNG KÝ TÀI KHOẢN MẬT KHẨU TĨNH TRUYỀN THỐNG
// ==========================================
export async function registerNewCitizenCloud(username, email, password) {
    const db = getDB();
    if (!db) return { success: false, message: "Hệ thống đang kết nối đám mây, vui lòng bấm lại sau 1 giây!" };

    try {
        // Kiểm tra xem trùng lặp tên tài khoản cư dân cũ không
        const { data: existUser } = await db.from('city_users').select('username').eq('username', username);
        if (existUser && existUser.length > 0) {
            return { success: false, message: "Lỗi: Tên tài khoản này đã được sử dụng bởi cư dân khác!" };
        }

        // Khai sinh tài khoản lên bảng city_users
        await db.from('city_users').insert([{ 
            username: username, 
            email: email, 
            password: password,
            bio: "Chào mừng đến với Independent City!",
            is_hidden: false
        }]);

        // Khởi tạo ví ngân hàng mặc định cấp vốn 1.000.000 AD
        await db.from('city_bank').insert([{ 
            username: username, 
            balance: 1000000 
        }]);

        return { success: true };
    } catch (err) {
        return { success: false, message: "Trục trặc đám mây: " + err.message };
    }
}

// ==========================================
// THUẬT TOÁN ĐĂNG NHẬP MẬT KHẨU TĨNH LINH HOẠT
// ==========================================
export async function loginCitizenCloud(userOrEmail, password) {
    const db = getDB();
    if (!db) return { success: false, message: "Hệ thống đang kết nối đám mây, vui lòng bấm lại sau 1 giây!" };

    try {
        const { data: users, error } = await db
            .from('city_users')
            .select('*')
            .eq('password', password)
            .or(`username.eq."${userOrEmail}",email.eq."${userOrEmail}"`);

        if (error || !users || users.length === 0) {
            return { success: false, message: "Đăng nhập thất bại: Sai tài khoản, email hoặc mật khẩu!" };
        }

        // Đăng nhập thành công -> Găm danh tính vào bộ nhớ đệm tập trung
        const loggedUser = users[0]; // Sửa chuẩn mảng bốc hàng đầu tiên
        CITY_STATE.LOGGED_IN_USER = loggedUser.username;
        CITY_STATE.USER_EMAIL = loggedUser.email;

        return { success: true, username: loggedUser.username, email: loggedUser.email };
    } catch (err) {
        return { success: false, message: "Trục trặc đường truyền: " + err.message };
    }
}
// =================================================================
// INDEPENDENT CITY NETWORK - UTILS.JS (LOGIC NGÂN HÀNG, CHỢ, CHAT REALTIME - PHẦN 2)
// =================================================================

// ==========================================
// THUẬT TOÁN THỰC THI GIAO DỊCH CHUYỂN KHOẢN AN TOÀN
// ==========================================
export async function executeTransactionCloud(receiverInput, amountInput) {
    const db = getDB();
    if (!db) return { success: false, message: "Hệ thống chưa nạp xong cấu hình đám mây!" };

    if (receiverInput === CITY_STATE.LOGGED_IN_USER) {
        return { success: false, message: "⚠️ Lỗi: Bạn không thể tự chuyển khoản cho chính bản thân mình!" };
    }

    if (amountInput > CITY_STATE.CURRENT_BALANCE) {
        return { success: false, message: `⚠️ Từ chối: Ví không đủ! Bạn hiện chỉ có ${CITY_STATE.CURRENT_BALANCE.toLocaleString()} AD.` };
    }

    try {
        // Quét ví người nhận xem có tồn tại thực tế trên database không [🗎1]
        const { data: receiverWallet, error: checkErr } = await db.from('city_bank').select('*').eq('username', receiverInput).single();
        if (checkErr || !receiverWallet) {
            return { success: false, message: `⚠️ Không tìm thấy cư dân nào mang tên tài khoản @${receiverInput}!` };
        }

        // Bước A: Khấu trừ ví người gửi
        const newSenderBalance = CITY_STATE.CURRENT_BALANCE - amountInput;
        const { error: sendErr } = await db.from('city_bank').update({ balance: newSenderBalance }).eq('username', CITY_STATE.LOGGED_IN_USER);
        if (sendErr) return { success: false, message: "Giao dịch thất bại tại bước khấu trừ ví!" };

        // Bước B: Cộng ví người nhận
        const newReceiverBalance = receiverWallet.balance + amountInput;
        await db.from('city_bank').update({ balance: newReceiverBalance }).eq('username', receiverInput);

        CITY_STATE.CURRENT_BALANCE = newSenderBalance;
        return { success: true, newBalance: newSenderBalance };

    } catch (err) {
        return { success: false, message: "Lỗi đường truyền ngân hàng: " + err.message };
    }
}

// ==========================================
// THUẬT TOÁN ĐĂNG SẢN PHẨM MỚI KHÓA TRẦN DƯỚI 1000 AD
// ==========================================
export async function publishNewServiceCloud(title, description, imageUrl, price) {
    const db = getDB();
    if (!db) return { success: false, message: "Mất kết nối trạm dữ liệu!" };

    if (price < 1 || price > 1000) {
        return { success: false, message: "⚠️ Bị từ chối: Quy chuẩn giá bán bắt buộc phải từ 1 đến 1000 AD! [🗎1]" };
    }

    try {
        const { error } = await db.from('city_services').insert([{
            seller: CITY_STATE.LOGGED_IN_USER,
            title: title,
            description: description,
            price: price,
            image_url: imageUrl || "data:image/svg+xml;utf8,<svg xmlns='http://w3.org' width='80' height='80'><rect width='80' height='80' fill='%23001F3F'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='Arial' font-size='11'>Independent</text></svg>",
            reviews: []
        }]);

        if (error) throw error;
        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

// ==========================================
// THUẬT TOÁN MUA SẢN PHẨM LIÊN THÔNG VÍ & REVIEW 100 SAO JSONB
// ==========================================
export async function purchaseServiceCloud(prodId, sellerName, priceAmount, commentText, starsCount) {
    const db = getDB();
    if (!db) return { success: false, message: "Trạm năng lượng mây đang nghẽn!" };

    try {
        const { data: myWallet } = await db.from('city_bank').select('*').eq('username', CITY_STATE.LOGGED_IN_USER).single();
        if (!myWallet || myWallet.balance < priceAmount) {
            return { success: false, message: `Ví không đủ AD! Bạn thiếu ${priceAmount - (myWallet ? myWallet.balance : 0)} AD.` };
        }

        const { data: sellerWallet } = await db.from('city_bank').select('*').eq('username', sellerName).single();
        if (!sellerWallet) return { success: false, message: "Ví người bán không tồn tại hoặc bị đóng băng!" };

        // Khấu trừ tài khoản người mua và cộng tài khoản người bán [🗎1]
        await db.from('city_bank').update({ balance: myWallet.balance - priceAmount }).eq('username', CITY_STATE.LOGGED_IN_USER);
        await db.from('city_bank').update({ balance: sellerWallet.balance + priceAmount }).eq('username', sellerName);

        // Nhồi mảng nhận xét JSONB giới hạn 100 lượt [🗎1]
        const { data: prodData } = await db.from('city_services').select('reviews').eq('id', prodId).single();
        let currentReviews = prodData?.reviews || [];
        if (currentReviews.length >= 100) currentReviews.shift(); // Shift xóa review cũ nhất nếu chạm mốc 100
        
        currentReviews.push({ reviewer: CITY_STATE.LOGGED_IN_USER, stars: starsCount, comment: commentText });
        await db.from('city_services').update({ reviews: currentReviews }).eq('id', prodId);

        return { success: true };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

// ==========================================
// HÀM TOÀN CỤC ĐỂ ĐẨY THÔNG BÁO POPUP TOAST RA GÓC MÀN HÌNH
// ==========================================
export function showNotificationPopup(title, message) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const popup = document.createElement('div');
    popup.style.cssText = `
        background-color: #001F3F; color: #ffffff; padding: 15px; width: 280px;
        border: 1px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateY(20px); opacity: 0; transition: all 0.3s ease-in-out;
        font-family: 'Segoe UI', Arial, sans-serif; display: flex; flex-direction: column; gap: 5px;
    `;

    popup.innerHTML = `
        <div style="font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">${title}</div>
        <div style="font-size: 12px; color: #cbd5e0; word-break: break-word;">${message}</div>
    `;

    container.appendChild(popup);
    setTimeout(() => { popup.style.transform = 'translateY(0)'; popup.style.opacity = '1'; }, 50);
    setTimeout(() => {
        popup.style.transform = 'translateY(-20px)'; popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 300);
    }, 4000);
}
/* KHÓA ĐỢT 2: HOÀN THÀNH 100% TRẠM ĐIỀU PHỐI UTILS.JS SẠCH SẼ, CHUẨN KIẾN TRÚC MÁY CHỦ THUẦN */
