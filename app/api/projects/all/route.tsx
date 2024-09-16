import https from "https";
import axios from "axios";

export async function GET(req: Request) {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const headers = {
    Authorization: `PVEAPIToken=${process.env.TOKEN_ID}=${process.env.TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(
      `${process.env.PROXMOX_API_URL}/cluster/resources?type=vm`,
      {
        headers,
        httpsAgent,
      }
    );

    const vms = response.data.data;

    return new Response(JSON.stringify(vms), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching VMs:", error);
    return new Response(JSON.stringify({ error: "Error fetching VMs" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
