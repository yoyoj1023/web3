export async function GET() {
  const apiKey = process.env.ALCHEMY_API_KEY;
  const policyId = process.env.ALCHEMY_GAS_POLICY_ID;

  return Response.json({
    apiKeyPresent: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "Not set",
    policyIdPresent: !!policyId,
    policyId: policyId || "Not set",
    nodeEnv: process.env.NODE_ENV,
  });
}
