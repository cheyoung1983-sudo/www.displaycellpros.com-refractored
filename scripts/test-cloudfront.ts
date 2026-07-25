import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

async function verifyCloudFrontSecrets() {
  const region = process.env.AWS_REGION || "us-east-1";
  const client = new SecretsManagerClient({ region });

  console.log("Checking AWS Secrets Manager for CloudFront Private Keys...");

  const secretKeys = [
    { name: "prod/cloudfront/pk-1", keyId: "pk-LHRE6C3FQAL7HR7UKFVNA72G3G6GD5MD" },
    { name: "prod/cloudfront/pk-2", keyId: "pk-APKAX3LBP6Q6HAW6HRI5" }
  ];

  for (const { name, keyId } of secretKeys) {
    try {
      const response = await client.send(new GetSecretValueCommand({ SecretId: name }));
      if (response.SecretString) {
        console.log(`[SUCCESS] Found secret '${name}' for Key ID ${keyId} (${response.SecretString.length} characters)`);
      } else {
        console.log(`[WARNING] Secret '${name}' exists but contains no SecretString data.`);
      }
    } catch (err: any) {
      console.error(`[ERROR] Unable to retrieve secret '${name}':`, err.message || err);
    }
  }
}

verifyCloudFrontSecrets();
