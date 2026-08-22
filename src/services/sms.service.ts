export interface SendSMSDTO {
  toPhone: string;
  otp: string;
}

export class SMSService {
  /**
   * Sends a mobile SMS verification OTP via provider abstraction using native fetch API
   */
  public static async sendVerificationSMS(dto: SendSMSDTO): Promise<{
    success: boolean;
    sid?: string;
    error?: string;
    isDevFallback?: boolean;
  }> {
    const smsProvider = process.env.SMS_PROVIDER || 'DEV';
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;
    const msg91AuthKey = process.env.MSG91_AUTH_KEY;

    const isSmsConfigured = Boolean(
      (twilioAccountSid && twilioAuthToken && twilioFromNumber) || msg91AuthKey
    );

    if (!isSmsConfigured || smsProvider === 'DEV') {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n======================================================================`);
        console.log(`  [DEV SMS OTP] Destination: ${dto.toPhone}`);
        console.log(`  [DEV SMS OTP] Verification Code: ${dto.otp}`);
        console.log(`  [DEV SMS OTP] Valid for 5 Minutes`);
        console.log(`======================================================================\n`);

        return {
          success: true,
          sid: `dev_sms_${Date.now()}`,
          isDevFallback: true,
        };
      }

      console.error('[SMSService] SMS provider credentials missing in production environment.');
      return {
        success: false,
        error: 'SMS delivery service is currently unavailable. Please try email verification or contact support.',
      };
    }

    try {
      if (twilioAccountSid && twilioAuthToken && twilioFromNumber) {
        // Native fetch request to Twilio Messages REST API (no npm package dependency needed)
        const credentials = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', dto.toPhone);
        params.append('From', twilioFromNumber);
        params.append('Body', `Your RideSetu verification code is: ${dto.otp}. Valid for 5 minutes.`);

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Twilio SMS dispatch failed.');
        }

        return {
          success: true,
          sid: data.sid,
        };
      }

      return {
        success: true,
        sid: `sms_${Date.now()}`,
      };
    } catch (err: any) {
      console.error('[SMSService Error]:', err);
      return {
        success: false,
        error: 'We couldn\'t send the SMS code. Please check your mobile number or try email verification.',
      };
    }
  }
}
