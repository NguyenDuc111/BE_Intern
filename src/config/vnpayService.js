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

  // Debug chuỗi query và secureHash
  console.log("Query string for URL:", queryString);
  console.log("Calculated secureHash:", secureHash);

  return `${vnp_PayUrl}?${queryString}&vnp_SecureHash=${secureHash}`;
};

export const orderReturnService = (req) => {
  // Lấy tham số query nguyên bản
  const fields = { ...req.query };

  console.log("VNPay callback raw query:", fields);

  // Lưu vnp_SecureHash và loại bỏ các trường không cần thiết
  const vnp_SecureHash = fields.vnp_SecureHash;
  delete fields.vnp_SecureHash;
  delete fields.vnp_SecureHashType;

  // Tạo chuỗi query để tính chữ ký
  const sortedFields = Object.keys(fields).sort();
  const queryString = sortedFields
    .map((key) => {
      let value = fields[key];
      // Mã hóa giá trị theo chuẩn VNPay
      value = encodeURIComponent(value).replace(/%20/g, "+");
      return `${key}=${value}`;
    })
    .join("&");

  console.log("Query string for signature:", queryString);

  // Tính chữ ký
  const signValue = hmacSHA512(vnp_HashSecret, queryString);
  console.log("Calculated signValue:", signValue);
  console.log("Received vnp_SecureHash:", vnp_SecureHash);

  if (signValue === vnp_SecureHash) {
    const transactionStatus = req.query.vnp_TransactionStatus;
    console.log("VNPay TransactionStatus:", transactionStatus);
    return transactionStatus === "00" ? 1 : 0;
  } else {
    console.log("Invalid signature");
    return -1;
  }
};
