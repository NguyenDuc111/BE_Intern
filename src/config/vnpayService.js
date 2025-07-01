import {
  vnp_PayUrl,
  vnp_TmnCode,
  vnp_HashSecret,
  vnp_Returnurl,
  hashAllFields,
  getIpAddress,
  hmacSHA512,
} from "../config/vnpayConfig.js";
import { format } from "date-fns";

process.env.TZ = 'Asia/Ho_Chi_Minh';

export const createOrderService = (
  req,
  amount,
  orderInfo,
  returnUrl,
  orderId
) => {
  const vnp_Version = "2.1.0";
  const vnp_Command = "pay";
  const vnp_TxnRef = orderId.toString(); // chắc chắn là chuỗi
  const vnp_IpAddr = getIpAddress(req);
  const orderType = "other"; // có thể đặt thành 'other' nếu không xác định rõ loại

  const vnp_Params = {
    vnp_Version,
    vnp_Command,
    vnp_TmnCode,
    vnp_Amount: (parseInt(amount) * 100).toString(), // integer * 100
    vnp_CurrCode: "VND",
    vnp_TxnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr,
    vnp_CreateDate: format(new Date(), "yyyyMMddHHmmss"),
    vnp_ExpireDate: format(new Date(Date.now() + 15 * 60000), "yyyyMMddHHmmss"),
  };

  // Sắp xếp và ký như tài liệu
  const sortedKeys = Object.keys(vnp_Params).sort();
  let signData = "";
  sortedKeys.forEach((key, index) => {
    const value = vnp_Params[key];
    if (index !== 0) signData += "&";
    signData += `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
  });

  const secureHash = hmacSHA512(vnp_HashSecret, signData);

  const queryString = sortedKeys
    .map((key) => {
      const value = encodeURIComponent(vnp_Params[key]).replace(/%20/g, "+");
      return `${key}=${value}`;
    })
    .join("&");

  console.log("Query string for URL:", queryString);
  console.log("Calculated secureHash:", secureHash);

  return `${vnp_PayUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
};


export const orderReturnService = (req) => {
  // Lấy raw query từ VNPay
  const fields = { ...req.query };

  const vnp_SecureHash = fields.vnp_SecureHash;
  delete fields.vnp_SecureHash;
  delete fields.vnp_SecureHashType;

  const sortedKeys = Object.keys(fields).sort();
  const queryString = sortedKeys
    .map((key) => {
      let value = fields[key] ?? ""; // tránh undefined
      value = encodeURIComponent(value).replace(/%20/g, "+");
      return `${key}=${value}`;
    })
    .join("&");

  const signValue = hmacSHA512(vnp_HashSecret, queryString);

  console.log("✅ Callback query string:", queryString);
  console.log("✅ VNPay secure hash:", vnp_SecureHash);
  console.log("✅ Calculated hash:", signValue);

  if (signValue === vnp_SecureHash) {
    return req.query.vnp_TransactionStatus === "00" ? 1 : 0;
  } else {
    console.warn("❌ Invalid VNPay signature");
    return -1;
  }
};
