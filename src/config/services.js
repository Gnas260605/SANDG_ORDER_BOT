/**
 * Danh sách dịch vụ và bảng giá SandG Anime Expedition
 */

const SERVICES = {
  FULL_STORY: {
    code: "FULL_STORY",
    name: "FULL STORY",
    unitPrice: 25000,
    unitLabel: "Gói",
    description: "Cày trọn gói Full Story",
    displayPrice: "25.000 VNĐ / Gói",
    minQuantity: 1,
    maxQuantity: 100,
  },
  MEGUMI: {
    code: "MEGUMI",
    name: "MEGUMI",
    unitPrice: 60000,
    unitLabel: "Gói",
    description: "Dịch vụ Megumi",
    displayPrice: "60.000 VNĐ / Gói",
    minQuantity: 1,
    maxQuantity: 100,
  },
  ITACHI: {
    code: "ITACHI",
    name: "ITACHI",
    unitPrice: 50000,
    unitLabel: "Gói",
    description: "Dịch vụ Itachi",
    displayPrice: "50.000 VNĐ / Gói",
    minQuantity: 1,
    maxQuantity: 100,
  },
  KENPACHI: {
    code: "KENPACHI",
    name: "KENPACHI",
    unitPrice: 50000,
    unitLabel: "Gói",
    description: "Dịch vụ Kenpachi",
    displayPrice: "50.000 VNĐ / Gói",
    minQuantity: 1,
    maxQuantity: 100,
  },
  ICHIGO: {
    code: "ICHIGO",
    name: "ICHIGO",
    unitPrice: 15000,
    unitLabel: "Gói",
    description: "Dịch vụ Ichigo",
    displayPrice: "15.000 VNĐ / Gói",
    minQuantity: 1,
    maxQuantity: 100,
  },
  UNIT_MYTHIC_EVO: {
    code: "UNIT_MYTHIC_EVO",
    name: "UNIT MYTHIC EVO",
    unitPrice: 10000,
    unitLabel: "Con",
    description: "Cày Unit Mythic Evo (10.000 VNĐ / 1 con)",
    displayPrice: "10.000 VNĐ / 1 Con",
    minQuantity: 1,
    maxQuantity: 500,
  },
  REROLL: {
    code: "REROLL",
    name: "REROLL",
    unitPrice: 20000,
    unitLabel: "Gói (50 Reroll)",
    description: "Cày Reroll (20.000 VNĐ / 50 Reroll)",
    displayPrice: "20.000 VNĐ / 50 Reroll",
    minQuantity: 1,
    maxQuantity: 1000,
  },
  TOKEN_EVENT_ITACHI: {
    code: "TOKEN_EVENT_ITACHI",
    name: "TOKEN EVENT ITACHI",
    unitPrice: 10000,
    unitLabel: "Gói (40K Token)",
    description: "Cày Token Event Itachi (10.000 VNĐ / 40K Token)",
    displayPrice: "10.000 VNĐ / 40K Token",
    minQuantity: 1,
    maxQuantity: 1000,
  },
  RAID: {
    code: "RAID",
    name: "RAID",
    unitPrice: 1000,
    unitLabel: "Ván",
    description: "Cày Raid (1.000 VNĐ / 1 ván)",
    displayPrice: "1.000 VNĐ / 1 Ván",
    minQuantity: 1,
    maxQuantity: 10000,
  },
};

/**
 * Format số tiền sang định dạng VNĐ (ví dụ: 50.000 VNĐ)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

/**
 * Tính tổng tiền cho một đơn hàng
 */
function calculateTotal(serviceCode, quantity) {
  const service = SERVICES[serviceCode];
  if (!service) {
    throw new Error(`Mã dịch vụ không hợp lệ: ${serviceCode}`);
  }
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    throw new Error("Số lượng phải là số nguyên dương lớn hơn 0");
  }
  return service.unitPrice * qty;
}

module.exports = {
  SERVICES,
  formatCurrency,
  calculateTotal,
};
