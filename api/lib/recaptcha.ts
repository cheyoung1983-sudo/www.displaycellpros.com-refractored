import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

/**
 * Verifies a reCAPTCHA token using the Enterprise API.
 * @param token The generated token obtained from the client.
 * @param recaptchaAction Optional action name for verification.
 */
export async function verifyRecaptcha(token: string, recaptchaAction?: string): Promise<boolean> {
  const projectID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'displaycellpros-com';
  const recaptchaKey = process.env.VITE_RECAPTCHA_SITE_KEY || '6LeqGV0tAAAAAC_MQbIkcyZa2L-LvTNhSlmxKaLo';

  if (!token) return false;

  try {
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);

    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties || !response.tokenProperties.valid) {
      console.warn(`reCAPTCHA Enterprise: Token invalid. Reason: ${response.tokenProperties?.invalidReason}`);
      return false;
    }

    if (recaptchaAction && response.tokenProperties.action !== recaptchaAction) {
      console.warn(`reCAPTCHA Enterprise: Action mismatch. Expected ${recaptchaAction}, got ${response.tokenProperties.action}`);
      return false;
    }

    // You can adjust the score threshold as needed (e.g., 0.5)
    const score = response.riskAnalysis?.score ?? 0;
    console.log(`reCAPTCHA Enterprise Score: ${score} for action: ${response.tokenProperties.action}`);

    return score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA Enterprise verification error:', error);

    // Fallback to legacy verification if Enterprise fails (useful for transition)
    return await verifyRecaptchaLegacy(token);
  }
}

async function verifyRecaptchaLegacy(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY || '6LeqGV0tAAAAAD5aaO8C0ignXzqmI9VR9qKvubQJ';
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Legacy reCAPTCHA verification error:', error);
    return false;
  }
}
