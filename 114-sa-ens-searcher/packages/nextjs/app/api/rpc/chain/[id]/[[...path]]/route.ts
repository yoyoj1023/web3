import { getChainById } from "~~/utils/scaffold-alchemy/chainUtils";

export async function POST(req: Request, { params }: { params: { id: string; path: string[] } }) {
  const { id, path } = params;
  const chain = getChainById(parseInt(id));
  if (!chain) {
    return new Response(`Chain not found: ${chain}`, {
      status: 404,
    });
  }
  const rpcUrl = chain.rpcUrls.alchemy.http[0];

  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    return new Response("ALCHEMY_API_KEY is not set", {
      status: 500,
    });
  }

  // 檢查請求是否有內容
  const contentLength = req.headers.get("content-length");
  if (!contentLength || contentLength === "0") {
    return new Response("Request body is empty", {
      status: 400,
    });
  }

  let body;
  try {
    const text = await req.text();
    if (!text.trim()) {
      return new Response("Request body is empty", {
        status: 400,
      });
    }
    body = JSON.parse(text);
  } catch (error) {
    console.error("JSON parsing error:", error);
    return new Response("Invalid JSON in request body", {
      status: 400,
    });
  }

  try {
    let combinedPath;
    if (path && path.find(x => x === "signer")) {
      combinedPath = "https://api.g.alchemy.com/" + path.join("/");
    } else {
      combinedPath = rpcUrl + "/" + apiKey;
    }

    if (body.method === "alchemy_requestGasAndPaymasterAndData") {
      body.params[0].policyId = process.env.ALCHEMY_GAS_POLICY_ID;
    }

    const apiResponse = await fetch(combinedPath, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = await apiResponse.json();
    const headers = new Headers(apiResponse.headers);
    headers.delete("transfer-encoding");
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(JSON.stringify(json), {
      status: apiResponse.status,
      headers,
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error occurred", {
      status: 500,
    });
  }
}
