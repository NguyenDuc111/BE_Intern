import crypto from "crypto";

export const vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
export const vnp_TmnCode = "T8SG6SXD";
export const vnp_HashSecret = "VW1YAYDJTCORJOLBHQ9WYYY00MJVNDMO";
export const vnp_Returnurl = "http://tmdt1.cholimexfood.com.vn//api/vnpay/callback";

export const getIpAddress = (req) => {
  return (
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress
  );
};

export const hmacSHA512 = (key, data) => {
  return crypto.createHmac("sha512", key).update(data).digest("hex");
};

export const hashAllFields = (fields) => {
  const sortedFields = Object.keys(fields).sort();
  const queryString = sortedFields
    .map((key) => {
      const value = fields[key];
      const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
      return `${key}=${encodedValue}`;
    })
    .join("&");
  return hmacSHA512(vnp_HashSecret, queryString);
};