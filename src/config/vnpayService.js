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

export const createOrderService = (
  req,
  amount,
  orderInfo,
  returnUrl,
  orderId
) => {
  const vnp_Version = "2.1.0";
  const vnp_Command = "pay";
  const vnp_TxnRef = orderId;
  const vnp_IpAddr = getIpAddress(req);
  const orderType = "order-type";

  const vnp_Params = {
    vnp_Version,
    vnp_Command,
    vnp_TmnCode,
    vnp_Amount: (amount * 100).toString(),
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

  // Sử dụng hashAllFields để tính chữ ký
  const secureHash = hashAllFields(vnp_Params);

  // Tạo chuỗi query cho URL
  const sortedFields = Object.keys(vnp_Params).sort();
  const queryString = sortedFields
    .map((key) => {
      const value = vnp_Params[key];
      const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
      return `${key}=${encodedValue}`;
    })
    .join("&");

  // Debug chuỗi query và secureHash (dùng queryString thay vì signData)
  console.log("Query string for URL:", queryString);
  console.log("Calculated secureHash:", secureHash);

  return `${vnp_PayUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
};

export const orderReturnService = (req) => {
  const fields = Object.fromEntries(
    Object.entries(req.query).map(([key, value]) => [
      key,
      encodeURIComponent(value).replace(/%20/g, "+"),
    ])
  );

  const vnp_SecureHash = fields.vnp_SecureHash;
  delete fields.vnp_SecureHash;
  delete fields.vnp_SecureHashType;

  const signValue = hashAllFields(fields);
  if (signValue === vnp_SecureHash) {
    return req.query.vnp_TransactionStatus === "00" ? 1 : 0;
  }
  return -1;
};
