import crypto from "crypto";

export const vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
export const vnp_TmnCode = "T8SG6SXD"; // C?p nh?t n?u c?n
export const vnp_HashSecret = "VW1YAYDJTCORJOLBHQ9WYYY00MJVNDMO"; // C?p nh?t n?u c?n
export const vnp_Returnurl = "http://tmdt1.cholimexfood.com.vn/api/vnpay/callback";


export const getIpAddress = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    "127.0.0.1"
  );
};

export const hmacSHA512 = (key, data) => {
  return crypto.createHmac("sha512", key).update(data, "utf-8").digest("hex");
};

export const hashAllFields = (fields) => {
  const sortedFields = Object.keys(fields).sort();
  const queryString = sortedFields
    .map((key) => `${key}=${fields[key]}`) // Không encode khi hash
    .join("&");
  return hmacSHA512(vnp_HashSecret, queryString);
};