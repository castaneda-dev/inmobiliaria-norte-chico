import { NextResponse } from 'next/server';
import crypto from 'crypto';
import QRCode from 'qrcode';

// Base32 Decode Helper (RFC 4648)
function base32Decode(base32Str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let cleaned = base32Str.replace(/=+$/, '').toUpperCase();
  let bits = '';
  let hex = '';

  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substring(i, i + 8);
    hex += parseInt(chunk, 2).toString(16).padStart(2, '0');
  }

  return Buffer.from(hex, 'hex');
}

// Generate TOTP Code (RFC 6238)
function generateTOTP(secretBase32, timeStepSeconds = 30, windowOffset = 0) {
  try {
    const key = base32Decode(secretBase32);
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epoch / timeStepSeconds) + windowOffset;

    // Convert timeStep to 8-byte big-endian Buffer
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(0, 0);
    buffer.writeUInt32BE(timeStep, 4);

    // HMAC-SHA1
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(buffer);
    const digest = hmac.digest();

    // Dynamic Truncation
    const offset = digest[digest.length - 1] & 0x0f;
    const codeInt =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const code = (codeInt % 1000000).toString().padStart(6, '0');
    return code;
  } catch (err) {
    console.error("TOTP Generation Error:", err);
    return null;
  }
}

// Verify TOTP Code with tolerance window [-1, 0, +1]
function verifyTOTP(secretBase32, inputCode) {
  const cleanCode = inputCode.trim();
  for (let offset of [-1, 0, 1]) {
    const validCode = generateTOTP(secretBase32, 30, offset);
    if (validCode && validCode === cleanCode) {
      return true;
    }
  }
  return false;
}

export async function GET(req) {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   req.headers.get('x-real-ip') || 
                   '127.0.0.1';

  // Secreto Base32 de la empresa o por defecto (16 caracteres base32)
  const totpSecret = process.env.CRM_TOTP_SECRET || 'JBSWY3DPEHPK3PXP';
  const issuer = 'Inmobiliaria Norte Chico';
  const accountName = 'CRM Admin';

  const otpauthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${totpSecret}&issuer=${encodeURIComponent(issuer)}`;

  let qrCodeDataUrl = '';
  try {
    qrCodeDataUrl = await QRCode.toDataURL(otpauthUri, {
      margin: 2,
      width: 280,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (e) {
    console.error("Error generating QR code data URL:", e);
    qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(otpauthUri)}`;
  }

  return NextResponse.json({
    ip: clientIp,
    allowed_ips_configured: Boolean(process.env.CRM_ALLOWED_IPS),
    totp_secret: totpSecret,
    otpauth_uri: otpauthUri,
    qr_code_url: qrCodeDataUrl,
  });
}

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Código 2FA requerido' }, { status: 400 });
    }

    const cleanCode = code.trim();
    const totpSecret = process.env.CRM_TOTP_SECRET || 'JBSWY3DPEHPK3PXP';
    const customMasterPin = process.env.CRM_2FA_PIN;

    // 1. Validar contra Google Authenticator (TOTP dinámico de tu celular)
    const isTotpValid = verifyTOTP(totpSecret, cleanCode);

    // 2. Validar contra PIN Maestro personalizado si está definido explícitamente en Vercel
    const isMasterPinValid = Boolean(customMasterPin && cleanCode === customMasterPin.trim());

    if (isTotpValid || isMasterPinValid) {
      return NextResponse.json({ 
        success: true, 
        message: isTotpValid ? 'Verificación Google Authenticator exitosa' : 'Verificación PIN Maestro exitosa' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Código de 6 dígitos inválido o expirado. Consulta tu app Google Authenticator.' 
      }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Error en la verificación 2FA' }, { status: 500 });
  }
}
