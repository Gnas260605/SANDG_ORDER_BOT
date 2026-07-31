/**
 * Utilities kiểm tra và làm sạch dữ liệu đầu vào
 */

const { SERVICES } = require("../config/services");

/**
 * Kiểm tra số lượng có hợp lệ hay không
 */
function validateQuantity(quantityStr, serviceCode) {
  const service = SERVICES[serviceCode];
  if (!service) {
    return { valid: false, message: "Dịch vụ không tồn tại trong hệ thống." };
  }

  const num = Number(quantityStr);
  if (!Number.isInteger(num) || num <= 0) {
    return { valid: false, message: "Số lượng phải là một số nguyên dương lớn hơn 0." };
  }

  if (num < service.minQuantity || num > service.maxQuantity) {
    return {
      valid: false,
      message: `Số lượng cho dịch vụ ${service.name} phải nằm trong khoảng từ ${service.minQuantity} đến ${service.maxQuantity}.`,
    };
  }

  return { valid: true, value: num };
}

/**
 * Kiểm tra thời gian mong muốn
 */
function validateExpectedTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") {
    return { valid: false, message: "Thời gian mong muốn không được để trống." };
  }

  const trimmed = timeStr.trim();
  if (trimmed.length < 2 || trimmed.length > 100) {
    return { valid: false, message: "Thời gian mong muốn phải từ 2 đến 100 ký tự (ví dụ: '2 tiếng', 'Trong ngày')." };
  }

  return { valid: true, value: sanitizeText(trimmed) };
}

/**
 * Kiểm tra và làm sạch ghi chú
 */
function validateNote(noteStr) {
  if (!noteStr || typeof noteStr !== "string") {
    return { valid: true, value: "Không có" };
  }

  const trimmed = noteStr.trim();
  if (trimmed.length > 500) {
    return { valid: false, message: "Ghi chú không được vượt quá 500 ký tự." };
  }

  return { valid: true, value: sanitizeText(trimmed) || "Không có" };
}

/**
 * Làm sạch văn bản chống injection và định dạng lỗi
 */
function sanitizeText(text) {
  if (!text) return "";
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/[`*\\]/g, "")
    .trim();
}

/**
 * Làm sạch văn bản cho file transcript .txt
 */
function sanitizeForTranscript(text) {
  if (!text) return "";
  return text.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u024F\u1EA0-\u1EF9\n\t]/g, "");
}

module.exports = {
  validateQuantity,
  validateExpectedTime,
  validateNote,
  sanitizeText,
  sanitizeForTranscript,
};
