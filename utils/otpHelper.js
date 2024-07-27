const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many OTP requests created from this IP, please try again after 15 minutes',
});

// Store requestId and phone number in-memory (for simplicity)
const otpRequests = {};

// Function to send OTP
async function sendOTP(phone) {
  try {
    if (!phone) {
      return 'Phone number is required';
    }
    const resp = await fetch(`https://api-devp-otp-2704.hubtel.com/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${process.env.HUBTEL_USERNAME}:${process.env.HUBTEL_PASSWORD}`).toString('base64'),
      },
      body: JSON.stringify({
        senderId: 'MySenderId',
        phoneNumber: phone,
        countryCode: 'GH',
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw `Failed to send OTP: ${data.message}`;
    }

    otpRequests[data.data.requestId] = { phone, prefix: data.data.prefix };
    console.log(`Stored requestId: ${data.data.requestId}, phone: ${phone}`);
    return data.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return 'Internal Server Error';
  }
}

// Function to verify OTP
async function verifyOTP(requestId, prefix, code) {
  try {
    const otpRequest = otpRequests[requestId];
    if (!otpRequest) {
      return 'Invalid requestId';
    }

    console.log(`Retrieved otpRequest for requestId: ${requestId}`);

    const { phone } = otpRequest;

    const resp = await fetch(`https://api-devp-otp-2704.hubtel.com/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${process.env.HUBTEL_USERNAME}:${process.env.HUBTEL_PASSWORD}`).toString('base64'),
      },
      body: JSON.stringify({
        requestId,
        prefix,
        code,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Failed to verify OTP: ${text}`);
      return `Failed to verify OTP: ${text}`;
    }

    let data;
    try {
      const contentType = resp.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await resp.json();
      } else {
        data = { message: await resp.text() };
      }
    } catch (error) {
      console.error('Failed to parse JSON response:', await resp.text());
      return error;
    }

    console.log('OTP verification response:', data);
    delete otpRequests[requestId]; // Clean up after successful verification
    return 'OTP is valid';
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return 'Invalid OTP';
  }
}

// Function to resend OTP
async function resendOTP(requestId) {
  try {
    const otpRequest = otpRequests[requestId];
    if (!otpRequest) {
      return 'Invalid requestId';
    }

    console.log(`Retrieved otpRequest for requestId: ${requestId}`);

    const { phone } = otpRequest;

    const resp = await fetch(`https://api-devp-otp-2704.hubtel.com/otp/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${process.env.HUBTEL_USERNAME}:${process.env.HUBTEL_PASSWORD}`).toString('base64'),
      },
      body: JSON.stringify({ requestId }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`Failed to resend OTP: ${text}`);
      return `Failed to resend OTP: ${text}`;
    }

    const data = await resp.json();
    console.log('OTP resend response:', data);
    return 'OTP resent successfully';
  } catch (error) {
    console.error('Error resending OTP:', error);
    return 'Failed to resend OTP';
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
  resendOTP,
  limiter,
};
