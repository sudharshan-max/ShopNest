const crypto = require('crypto');

const orderId   = "order_SQLxtyP3JIsRHk"; // from Step 3
const paymentId = "pay_TestPayment123456";    // any fake value
const secret    = "NETk6HP1NzRzufOYZ7KYfDMb";     // from application.properties

const signature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

console.log(signature);