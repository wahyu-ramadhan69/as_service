import { NextResponse } from "next/server";
import axios from "axios";
import https from "https";
import { respondWithSuccess } from "@/app/lib/Response";

export async function POST(request: Request) {
  const { static_ip, gateway_ip, node, vmid } = await request.json();

  const command = [
    "sh",
    "-c",
    `
      # Determine the correct YAML file for netplan configuration
      if [ -f /etc/netplan/00-installer-config.yaml ]; then
        netplan_file="/etc/netplan/00-installer-config.yaml"
      elif [ -f /etc/netplan/50-cloud-init.yaml ]; then
        netplan_file="/etc/netplan/50-cloud-init.yaml"
      else
        echo "No suitable netplan configuration file found."
        exit 1
      fi

      # Configure network settings using netplan
      sudo tee $netplan_file > /dev/null <<EOL
      network:
        version: 2
        renderer: networkd
        ethernets:
          ens160:
            dhcp4: no
            addresses:
              - ${static_ip}/24
            routes:
              - to: default
                via: ${gateway_ip}
            nameservers:
              addresses:
                - 192.168.29.12
                - 192.168.29.101
      EOL

      sudo chmod 600 $netplan_file

      # Apply network configuration
      sudo netplan apply > /dev/null
      echo "Network settings updated successfully."
    `,
  ];

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const headers = {
    Authorization: `PVEAPIToken=${process.env.TOKEN_ID}=${process.env.TOKEN}`,
    "Content-Type": "application/json",
  };

  try {
    const execResponse = await axios.post(
      `${process.env.PROXMOX_API_URL}/nodes/${node}/qemu/${vmid}/agent/exec`,
      {
        command: command,
      },
      {
        headers,
        httpsAgent,
      }
    );

    const pid = execResponse.data.data.pid;

    await new Promise((resolve) => setTimeout(resolve, 5000));
    const resultResponse = await axios.get(
      `${process.env.PROXMOX_API_URL}/nodes/${node}/qemu/${vmid}/agent/exec-status?pid=${pid}`,
      {
        headers,
        httpsAgent,
      }
    );

    const output = resultResponse.data.data["out-data"];

    return respondWithSuccess(
      "Berhasil melakukan sinkronisasi IP Address",
      output,
      200
    );
  } catch (error) {
    console.error("Error executing command:", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
}
