const QRCode = require('qrcode');

// Generate QR code for student
const generateQRCode = async (studentData) => {
  try {
    // Create simple, consistent QR data that can be verified reliably
    const qrData = JSON.stringify({
      studentId: studentData.studentId,
      name: studentData.name,
      class: studentData.class,
      division: studentData.division,
      type: 'attendance',
    });

    // Generate QR code as data URL (image)
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error(`QR Code generation failed: ${error.message}`);
  }
};

// Verify QR code data
const verifyQRCode = (qrData) => {
  try {
    const parsed = JSON.parse(qrData);
    
    // Check if it's valid attendance QR code
    if (!parsed.studentId || !parsed.name || parsed.type !== 'attendance') {
      return {
        isValid: false,
        error: 'Invalid QR code format',
      };
    }

    return {
      isValid: true,
      data: parsed,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid QR code data - could not parse JSON',
    };
  }
};

module.exports = {
  generateQRCode,
  verifyQRCode,
};
