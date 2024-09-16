import axios, { AxiosError } from "axios";
import https from "https";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "rahasia";

interface MyJwtPayload extends JwtPayload {
  userId: number;
  role: string;
}

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = extractTokenFromCookies(req);

    if (!token) {
      return respondWithError("Authorization token is missing", 401);
    }

    const { id } = params;
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return respondWithError("Invalid or expired token", 401);
    }

    const { userId, role } = decodedToken;

    if (role !== "HEAD") {
      return respondWithError(
        "You do not have access to perform this action",
        403
      );
    }

    const {
      id_template,
      cpu,
      ram,
      storage,
      segment,
      nama_aplikasi,
      jenis_pengajuan,
      vmid,
      nama_baru,
      vmid_old,
    } = await req.json();

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const headers = {
      Authorization: `PVEAPIToken=${process.env.TOKEN_ID}=${process.env.TOKEN}`,
      "Content-Type": "application/json",
    };

    if (jenis_pengajuan === "New") {
      let ipAddress;
      let bridge: string;

      if (segment === "internal") {
        bridge = "vmbr0";
        ipAddress = await prisma.ipAddress.findFirst({
          where: {
            type: "INTERNAL",
            status: "AVAILABLE",
          },
        });
      } else if (segment === "backend") {
        bridge = "BE";
        ipAddress = await prisma.ipAddress.findFirst({
          where: {
            type: "BACKEND",
            status: "AVAILABLE",
          },
        });
      } else if (segment === "frontend") {
        bridge = "FE";
        ipAddress = await prisma.ipAddress.findFirst({
          where: {
            type: "FRONTEND",
            status: "AVAILABLE",
          },
        });
      }

      if (!ipAddress) {
        return respondWithError(
          `No available IP address found for segment ${segment}`,
          404
        );
      }

      const template = await prisma.template.findUnique({
        where: {
          id: Number(id_template),
        },
      });

      if (!template) {
        return respondWithError(
          `No available template found for id ${id_template}`,
          404
        );
      }

      await prisma.ipAddress.update({
        where: { id: ipAddress.id },
        data: { nama_server: nama_aplikasi, status: "NOT_AVAILABLE" },
      });

      const response = await prisma.pengajuan.update({
        where: { id: Number(id) },
        include: {
          template: true,
        },
        data: {
          status_pengajuan: "Proses pengerjaan",
        },
      });

      const nodesResponse = await axios.get(
        `${process.env.PROXMOX_API_URL}/nodes`,
        {
          headers,
          httpsAgent,
        }
      );

      const nodes = nodesResponse.data.data;

      let selectedNode = null;
      let minUsage = Infinity;

      for (const node of nodes) {
        const nodeStatusResponse = await axios.get(
          `${process.env.PROXMOX_API_URL}/nodes/${node.node}/status`,
          {
            headers,
            httpsAgent,
          }
        );

        const nodeStatus = nodeStatusResponse.data.data;
        const cpuUsage = nodeStatus.cpu;
        const ramUsage = nodeStatus.memory.used / nodeStatus.memory.total;

        const usageScore = cpuUsage + ramUsage;

        if (usageScore < minUsage) {
          minUsage = usageScore;
          selectedNode = node.node;
        }
      }

      if (!selectedNode) {
        return respondWithError(`No suitable node found for cloning.`, 401);
      }

      setImmediate(async () => {
        try {
          const vmListResponse = await axios.get(
            `${process.env.PROXMOX_API_URL}/cluster/resources?type=vm`,
            {
              headers,
              httpsAgent,
            }
          );

          const vmList = vmListResponse.data.data;

          let newid = 100;
          const usedIds = vmList.map((vm: { vmid: number }) => vm.vmid);

          while (usedIds.includes(newid)) {
            newid++;
          }

          const pengajuan = await prisma.pengajuan.findUnique({
            where: {
              id: Number(id),
            },
            select: {
              id_user: true,
            },
          });

          if (!pengajuan) {
            return respondWithError(`Pengajuan tidak ditemukan`, 200);
          }

          const server = await prisma.server.create({
            data: {
              vmid: newid,
              id_template: Number(id_template),
              id_user: pengajuan.id_user,
              id_ip: ipAddress.id,
              segment: segment,
            },
          });

          const user = await prisma.user.findUnique({
            where: {
              id: userId,
            },
            include: {
              divisi: true,
            },
          });

          const NamaAplikasi = nama_aplikasi.replace(/\s+/g, "-");

          const data = {
            newid,
            name: `${ipAddress.ip}-${NamaAplikasi}`,
            target: `${selectedNode}`,
            full: 1,
            pool: user?.divisi.nama,
            storage: "G350",
          };

          const clone = await axios.post(
            `${process.env.PROXMOX_API_URL}/nodes/${template.nodes}/qemu/${template.vmid}/clone`,
            data,
            { headers, httpsAgent }
          );

          let taskFinished = false;
          const upid = clone.data.data;

          const encodedUpid = encodeURIComponent(upid);
          while (!taskFinished) {
            const statusResponse = await axios.get(
              `${process.env.PROXMOX_API_URL}/nodes/${template.nodes}/tasks/${encodedUpid}/status`,
              {
                headers,
                httpsAgent,
              }
            );
            if (statusResponse.data.data.status === "stopped") {
              taskFinished = true;
            } else {
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          }

          const config = await axios.put(
            `${process.env.PROXMOX_API_URL}/nodes/${selectedNode}/qemu/${newid}/config`,
            {
              memory: ram,
              cores: cpu,
              net0: `virtio,bridge=${bridge}`,
            },
            { headers, httpsAgent }
          );

          const resize = await axios.put(
            `${process.env.PROXMOX_API_URL}/nodes/${selectedNode}/qemu/${newid}/resize`,
            {
              disk: "scsi0",
              size: `+${storage - 40}G`,
            },
            { headers, httpsAgent }
          );

          const startVm = await axios.post(
            `${process.env.PROXMOX_API_URL}/nodes/${selectedNode}/qemu/${newid}/status/start`,
            {},
            { headers, httpsAgent }
          );

          await prisma.pengajuan.update({
            where: { id: Number(id) },
            data: {
              status_pengajuan: "Selesai",
              vmid: newid,
            },
          });
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.statusText) {
              console.log(axiosError.response.statusText);
              await prisma.pengajuan.update({
                where: { id: Number(id) },
                data: {
                  status_pengajuan: "Error",
                },
              });
              return respondWithError(`${axiosError.response.statusText}`, 500);
            } else {
              console.log(axiosError.message);
            }
          } else {
            console.log("Unexpected error:", error);
          }
        }
      });

      return NextResponse.json(
        {
          message: "Server is being created it will take 10 to 15 minutes",
          data: response,
        },
        { status: 200 }
      );
    } else if (jenis_pengajuan === "Existing") {
      let ipAddress;
      if (segment === "internal") {
        ipAddress = await prisma.ipAddress.findFirst({
          where: {
            type: "INTERNAL",
            status: "AVAILABLE",
          },
        });
      } else if (segment === "backend") {
        ipAddress = await prisma.ipAddress.findFirst({
          where: {
            type: "BACKEND",
            status: "AVAILABLE",
          },
        });
      } else if (segment === "frontend") {
        ipAddress = await prisma.ipAddress.findFirst({
          where: {
            type: "FRONTEND",
            status: "AVAILABLE",
          },
        });
      }

      if (!ipAddress) {
        return respondWithError(
          `No available IP address found for segment ${segment}`,
          400
        );
      }

      const server = await prisma.server.findUnique({
        where: {
          vmid: vmid_old,
        },
        select: {
          id_template: true,
        },
      });

      if (!server) {
        return respondWithError(`Server clonig tidak ditemukan`, 404);
      }

      const response = await prisma.pengajuan.update({
        where: { id: Number(id) },
        data: {
          status_pengajuan: "Proses pengerjaan",
        },
        include: {
          template: true,
        },
      });

      const nodesResponse = await axios.get(
        `${process.env.PROXMOX_API_URL}/nodes`,
        {
          headers,
          httpsAgent,
        }
      );

      const nodes = nodesResponse.data.data;

      let selectedNode = null;
      let minUsage = Infinity;

      for (const node of nodes) {
        const nodeStatusResponse = await axios.get(
          `${process.env.PROXMOX_API_URL}/nodes/${node.node}/status`,
          {
            headers,
            httpsAgent,
          }
        );

        const nodeStatus = nodeStatusResponse.data.data;
        const cpuUsage = nodeStatus.cpu;
        const ramUsage = nodeStatus.memory.used / nodeStatus.memory.total;

        const usageScore = cpuUsage + ramUsage;

        if (usageScore < minUsage) {
          minUsage = usageScore;
          selectedNode = node.node;
        }
      }

      if (!selectedNode) {
        return respondWithError(`No suitable node found for cloning.`, 401);
      }

      setImmediate(async () => {
        try {
          const vmListResponse = await axios.get(
            `${process.env.PROXMOX_API_URL}/cluster/resources?type=vm`,
            {
              headers,
              httpsAgent,
            }
          );

          const vmList = vmListResponse.data.data;

          let newid = 100;
          const usedIds = vmList.map((vm: { vmid: number }) => vm.vmid);

          while (usedIds.includes(newid)) {
            newid++;
          }

          const pengajuan = await prisma.pengajuan.findUnique({
            where: {
              id: Number(id),
            },
            select: {
              id_user: true,
            },
          });

          if (!pengajuan) {
            return respondWithError(`Pengajuan tidak ditemukan`, 200);
          }

          await prisma.ipAddress.update({
            where: { id: ipAddress.id },
            data: { nama_server: nama_baru, status: "NOT_AVAILABLE" },
          });

          await prisma.server.create({
            data: {
              vmid: newid,
              id_template: Number(server.id_template),
              id_user: pengajuan.id_user,
              id_ip: ipAddress.id,
              segment: segment,
            },
          });

          const nodeVM =
            vmList.find((vm: { vmid: any }) => vm.vmid == vmid_old)?.node ||
            null;

          const user = await prisma.user.findUnique({
            where: {
              id: userId,
            },
            include: {
              divisi: true,
            },
          });

          const NamaAplikasi = nama_baru.replace(/\s+/g, "-");

          const data = {
            newid,
            name: `${ipAddress.ip}-${NamaAplikasi}`,
            target: `${selectedNode}`,
            full: 1,
            pool: user?.divisi.nama,
            storage: "G350",
          };

          const clone = await axios.post(
            `${process.env.PROXMOX_API_URL}/nodes/${nodeVM}/qemu/${vmid_old}/clone`,
            data,
            { headers, httpsAgent }
          );

          const upid = clone.data.data;

          const encodedUpid = encodeURIComponent(upid);

          let taskFinished = false;

          while (!taskFinished) {
            const statusResponse = await axios.get(
              `${process.env.PROXMOX_API_URL}/nodes/${nodeVM}/tasks/${encodedUpid}/status`,
              {
                headers,
                httpsAgent,
              }
            );
            if (statusResponse.data.data.status === "stopped") {
              taskFinished = true;
            } else {
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          }

          await axios.post(
            `${process.env.PROXMOX_API_URL}/nodes/${selectedNode}/qemu/${newid}/status/start`,
            {},
            { headers, httpsAgent }
          );

          await prisma.pengajuan.update({
            where: { id: Number(id) },
            data: {
              status_pengajuan: "Selesai",
              vmid: newid,
            },
          });
        } catch (error) {
          if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.statusText) {
              console.log(axiosError.response.statusText);
              await prisma.pengajuan.update({
                where: { id: Number(id) },
                data: {
                  status_pengajuan: "Error",
                },
              });
              return respondWithError(`${axiosError.response.statusText}`, 500);
            } else {
              console.log(axiosError.message);
            }
          } else {
            console.log("Unexpected error:", error);
          }
        }
      });
      return NextResponse.json(
        {
          message: "Server is being created it will take 10 to 15 minutes.",
          data: response,
        },
        { status: 200 }
      );
    } else if (jenis_pengajuan === "Perubahan") {
      try {
        const server = await prisma.server.findUnique({
          where: {
            vmid: vmid,
          },
        });

        if (!server) {
          return respondWithError(
            `Server dengan id${vmid} tidak ditemukan`,
            400
          );
        }

        let bridge: string = "";

        if (segment != server.segment) {
          let ipAddress;
          if (segment === "internal") {
            bridge = "vmbr0";
            ipAddress = await prisma.ipAddress.findFirst({
              where: {
                type: "INTERNAL",
                status: "AVAILABLE",
              },
            });
          } else if (segment === "backend") {
            bridge = "BE";
            ipAddress = await prisma.ipAddress.findFirst({
              where: {
                type: "BACKEND",
                status: "AVAILABLE",
              },
            });
          } else if (segment === "frontend") {
            bridge = "FE";
            ipAddress = await prisma.ipAddress.findFirst({
              where: {
                type: "FRONTEND",
                status: "AVAILABLE",
              },
            });
          }

          if (!ipAddress) {
            return respondWithError(
              `No available IP address found for segment ${segment}`,
              400
            );
          }

          await prisma.ipAddress.update({
            where: { id: server.id_ip },
            data: { nama_server: "", status: "AVAILABLE" },
          });

          await prisma.ipAddress.update({
            where: { id: ipAddress.id },
            data: { nama_server: nama_aplikasi, status: "NOT_AVAILABLE" },
          });

          await prisma.server.update({
            where: { vmid },
            data: { id_ip: ipAddress.id },
          });
        }

        await prisma.pengajuan.update({
          where: { id: Number(id) },
          data: {
            status_pengajuan: "Proses pengerjaan",
          },
        });

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
              `${process.env.PROXMOX_API_URL}/nodes/${node.node}/qemu/${vmid}/status/current`,
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
          return respondWithError(
            `VM with ID ${vmid} not found in any node`,
            404
          );
        }

        const vmResponse = await axios.get(
          `${process.env.PROXMOX_API_URL}/nodes/${targetNode}/qemu/${vmid}/status/current`,
          {
            headers,
            httpsAgent,
          }
        );

        const vmStorage = vmResponse.data.data.maxdisk / (1024 * 1024 * 1024);

        const configPayload: any = {
          memory: ram,
          cores: cpu,
        };

        if (segment != server.segment) {
          configPayload.net0 = `virtio,bridge=${bridge}`;
        }

        if (storage < vmStorage) {
          return respondWithError(`Storage tidak bisa dikecilkan`, 400);
        }
        const fixStorage = storage - vmStorage;

        await axios.put(
          `${process.env.PROXMOX_API_URL}/nodes/${targetNode}/qemu/${vmid}/config`,
          configPayload,
          { headers, httpsAgent }
        );

        await axios.put(
          `${process.env.PROXMOX_API_URL}/nodes/${targetNode}/qemu/${vmid}/resize`,
          {
            disk: "scsi0",
            size: `+${fixStorage}G`,
          },
          { headers, httpsAgent }
        );

        const response = await prisma.pengajuan.update({
          where: { id: Number(id) },
          data: {
            status_pengajuan: "Selesai",
          },
        });

        return NextResponse.json(
          { message: "Server successfully configured.", data: response },
          { status: 200 }
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response && axiosError.response.statusText) {
            console.log(axiosError.response.statusText);
            await prisma.pengajuan.update({
              where: { id: Number(id) },
              data: {
                status_pengajuan: "Error",
              },
            });
            return respondWithError(`${axiosError.response.statusText}`, 500);
          } else {
            console.log(axiosError.message);
          }
        } else {
          console.log("Unexpected error:", error);
        }
      }
    } else if (jenis_pengajuan === "Delete") {
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
          // Try to get VM info from the node
          await axios.get(
            `${process.env.PROXMOX_API_URL}/nodes/${node.node}/qemu/${vmid}/status/current`,
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
        await prisma.pengajuan.update({
          where: { id: Number(id) },
          data: {
            status_pengajuan: "Not Found",
          },
        });
        return respondWithError(
          `VM with ID ${vmid} not found in any node`,
          401
        );
      }

      const statusVM = await axios.get(
        `${process.env.PROXMOX_API_URL}/nodes/${targetNode}/qemu/${vmid}/status/current`,
        { headers, httpsAgent }
      );

      if (statusVM.data.data.status === "running") {
        return respondWithError(
          `Shutdown VM ${vmid} untuk menghapus server`,
          400
        );
      }

      await prisma.pengajuan.update({
        where: { id: Number(id) },
        data: {
          status_pengajuan: "Proses pengerjaan",
        },
      });

      await axios.delete(
        `${process.env.PROXMOX_API_URL}/nodes/${targetNode}/qemu/${vmid}`,
        { headers, httpsAgent }
      );

      const server = await prisma.server.findUnique({
        where: {
          vmid: vmid,
        },
      });

      if (!server) {
        return respondWithError(`Server dengan id${vmid} tidak ditemukan`, 400);
      }

      await prisma.ipAddress.update({
        where: { id: server.id_ip },
        data: { nama_server: "", status: "AVAILABLE" },
      });

      await prisma.server.delete({
        where: {
          vmid,
        },
      });

      const response = await prisma.pengajuan.update({
        where: { id: Number(id) },
        data: {
          status_pengajuan: "Selesai",
        },
      });

      return NextResponse.json(
        { message: "Server successfully deleted", data: response },
        { status: 200 }
      );
    } else {
      return respondWithError(`Pengajuanmu tidak sesuai`, 400);
    }
  } catch (error) {
    return respondWithError(`Failed to create or update vm`, 500);
  }
}

function extractTokenFromCookies(req: Request): string | undefined {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies?.token;
}

function verifyToken(token: string): MyJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as MyJwtPayload;
  } catch {
    return null;
  }
}

function respondWithError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function respondWithSuccess(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}
