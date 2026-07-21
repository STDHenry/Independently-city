// =================================================================
// INDEPENDENT CITY NETWORK - KHO 1 (GATEWAY) - UTILS.JS
// =================================================================

const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dnRua3Buc3VsYXd4eGlnY3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyOTA2NjksImV4cCI6MjA5OTg2NjY2OX0.rPsGAcSt3Yv049dxUTVNaUlpw8hHEpTpr84HYv7dHEg";

let cachedSupabaseClient = null;

// Hàm Getter hoãn giờ nạp biến, đợi thư viện đám mây nạp xong mới bốc biến [🗎1]
export function getDB() {
    if (cachedSupabaseClient) return cachedSupabaseClient;
    const supabaseEngine = window.supabase || window.parent.supabase;
    if (!supabaseEngine) {
        console.warn("⚠️ Trạm Gateway utils.js: Đang đợi thư viện đám mây nạp ngầm...");
        return null;
    }
    cachedSupabaseClient = supabaseEngine.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return cachedSupabaseClient;
}

// THUẬT TOÁN TOÁN HỌC TỰ SINH CHUỖI TOKEN ID NGẪU NHIÊN SIÊU BẢO MẬT
function generateRandomTokenID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'IC_TOKEN_';
    for (let i = 0; i < 24; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token + '_' + Date.now(); // Khóa đuôi thời gian để mã token độc nhất vô nhị
}

// =========================================================
// CHỨC NĂNG A: XỬ LÝ ĐĂNG KÝ TÀI KHOẢN MẬT KHẨU TĨNH MỚI
// =========================================================
export async function registerCitizenCloud(username, email, password) {
    const db = getDB();
    if (!db) return { success: false, message: "Hệ thống đang kết nối đám mây, vui lòng đợi 1 giây rồi bấm lại!" };

    try {
        // Quét bảng city_users xem Username này đã bị cư dân khác chiếm trước chưa
        const { data: existUser } = await db.from('city_users').select('username').eq('username', username);
        if (existUser && existUser.length > 0) {
            return { success: false, message: "Lỗi: Tên tài khoản này đã được sử dụng bởi cư dân khác!" };
        }

        // Chèn thẳng tài khoản mật khẩu tĩnh truyền thống vào bảng city_users trên mây [🗎1]
        await db.from('city_users').insert([{ 
            username: username, 
            email: email, 
            password: password,
            bio: "Chào mừng đến với Independent City!",
            is_hidden: false
        }]);

        // ĐỒNG BỘ CẤP VỐN: Khởi tạo ví tiền cấp hạn mức vốn 1.000.000 AD trong city_bank [🗎1]
        await db.from('city_bank').insert([{ 
            username: username, 
            balance: 1000000 
        }]);

        return { success: true };
    } catch (err) {
        return { success: false, message: "Trục trặc ghi nhận dữ liệu: " + err.message };
    }
}

// =========================================================
// CHỨC NĂNG B: LÕI THUẬT TOÁN ĐĂNG NHẬP SINGLE SIGN-ON (SSO) TỰ CHẾ
// =========================================================
export async function loginCitizenAndCreateSession(userOrEmail, password) {
    const db = getDB();
    if (!db) return { success: false, message: "Hệ thống đang kết nối đám mây, vui lòng đợi 1 giây rồi bấm lại!" };

    try {
        // So khớp mật khẩu tĩnh linh hoạt gõ Tên hoặc Email đều lọt lưới [🗎1]
        const { data: users, error } = await db
            .from('city_users')
            .select('*')
            .eq('password', password)
            .or(`username.eq."${userOrEmail}",email.eq."${userOrEmail}"`);

        if (error || !users || users.length === 0) {
            return { success: false, message: "⚠️ Đăng nhập thất bại: Sai tài khoản, email hoặc mật khẩu bảo mật!" };
        }

        const loggedUser = users[0]; // Bốc chính xác hàng dữ liệu đầu tiên lọt mảng
        
        // 1. Kích nổ hàm sinh mã Token ID ngẫu nhiên ngầm
        const sessionToken = generateRandomTokenID();

        // 2. Thọc lệnh chèn thẳng mã chip danh tính này lên bảng trung gian city_sessions trên mây [🗎1]
        await db.from('city_sessions').insert([{
            username: loggedUser.username,
            token: sessionToken
        }]);

        // 3. Trả kết quả thành công kèm Token để Frontend bắt bài luân chuyển trang
        return { success: true, username: loggedUser.username, token: sessionToken };

    } catch (err) {
        return { success: false, message: "Lỗi kết nối trạm dữ liệu: " + err.message };
    }
}
/* KHÓA ĐỢT 1: BỘ NÃO TIỆN ÍCH KHO 1 ĐÃ XONG VỮNG CHÃI. ĐỢT 2 SẼ KHỞI TẠO KHUNG XƯƠNG FILE INDEX.HTML MẶT TIỀN */
