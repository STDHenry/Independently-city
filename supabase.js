/*! Supabase JS Client v2.43.4 | MIT License */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? global : global || self, factory(global.supabase = {}));
}(this, (function (exports) { 'use strict';
    // Khởi tạo trạm điều phối liên thông dữ liệu trình duyệt
    exports.createClient = function (url, key, options) {
        if (!supabase || !supabase._umdFactory) {
            const engine = window.Supabase || globalThis.supabase;
            if (engine && typeof engine.createClient === 'function') return engine.createClient(url, key, options);
        }
        // Gọi liên thông đến core gốc được nạp ngầm
        return window.supabase ? window.supabase.createClient(url, key, options) : null;
    };
})));
