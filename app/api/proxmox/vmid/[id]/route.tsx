import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import https from "https";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const headers = {
    Authorization: `PVEAPIToken=${process.env.TOKEN_ID}=${process.env.TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    // Fetch nodes list
    const nodesResponse = await axios.get(
      `${process.env.PROXMOX_API_URL}/nodes`,
      {
        headers,
        httpsAgent,
      }
    );

    const nodes = nodesResponse.data.data;

    let targetNode = null;
    for (const node of nodes) {
      try {
        await axios.get(
          `${process.env.PROXMOX_API_URL}/nodes/${node.node}/qemu/${id}/status/current`,
          {
            headers,
            httpsAgent,
          }
        );
        targetNode = node.node;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!targetNode) {
      return respondWithError(`VM with ID ${id} not found in any node`, 404);
    }

    const vmResponse = await axios.get(
      `${process.env.PROXMOX_API_URL}/nodes/${targetNode}/qemu/${id}/status/current`,
      {
        headers,
        httpsAgent,
      }
    );

    const config = await axios.get(
      `${process.env.PROXMOX_API_URL}/nodes/${targetNode}/qemu/${id}/config`,
      {
        headers,
        httpsAgent,
      }
    );

    if (!vmResponse.data) {
      return respondWithError("VM status data is empty", 500);
    }

    const data = {
      targetNode,
      vmStatus: vmResponse.data.data,
    };

    return NextResponse.json(
      { message: `Berhasil mengambil informasi VM dengan ID ${id}`, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching VM information:", error);
    return NextResponse.json(
      { error: "Failed to fetch VM information" },
      { status: 500 }
    );
  }
}

function respondWithError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function respondWithSuccess(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}
