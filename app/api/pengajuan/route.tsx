import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import https from "https";
import axios from "axios";
import { respondWithSuccess } from "@/app/lib/Response";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "rahasia";

interface MyJwtPayload extends JwtPayload {
  userId: number;
  role: string;
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const headers = {
  Authorization: `PVEAPIToken=${process.env.TOKEN_ID}=${process.env.TOKEN}`,
  "Content-Type": "application/json",
};

export async function POST(req: Request) {
  try {
    const token = extractTokenFromCookies(req);

    if (!token) {
      return respondWithError("Authorization token is missing", 401);
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return respondWithError("Invalid or expired token", 401);
    }

    const user = await fetchUserWithDivisi(decodedToken.userId);

    if (!user) {
      return respondWithError("User not found", 404);
    }

    const requestData = await req.json();

    console.log(requestData);

    if (requestData.jenis_pengajuan === "Perubahan") {
      console.log("masuk kesini");

      const vmResponse = await axios.get(
        `${process.env.PROXMOX_API_URL}/nodes/${requestData.node}/qemu/${requestData.vmid}/status/current`,
        {
          headers,
          httpsAgent,
        }
      );

      const vmStorage = vmResponse.data.data.maxdisk / (1024 * 1024 * 1024);

      console.log(requestData.storage);
      console.log(vmStorage);

      if (requestData.storage < vmStorage) {
        return respondWithError(`Storage tidak bisa dikecilkan`, 400);
      }
    }

    if (requestData.jenis_pengajuan === "New" && requestData.storage < 40) {
      return respondWithError("Storage tidak boleh kurang dari 40 GB", 400);
    }

    if (requestData.jenis_pengajuan === "New" && !requestData.nama_aplikasi) {
      return respondWithError("Nama aplikasi tidak boleh kosong", 400);
    }

    if (requestData.jenis_pengajuan === "Existing" && !requestData.nama_baru) {
      return respondWithError("Nama aplikasi baru tidak boleh kosong", 400);
    }

    const validationError = await validateResourceRequest(
      requestData,
      user.divisi
    );

    if (validationError) {
      return respondWithError(validationError, 400);
    }

    const pengajuan = await createPengajuan(requestData, user);

    return respondWithSuccess(
      "Berhasil membuat pengajuan server",
      pengajuan,
      200
    );
  } catch (error) {
    return respondWithError("Failed to create pengajuan", 500);
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

async function fetchUserWithDivisi(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { divisi: true },
  });
}

async function validateResourceRequest(
  requestData: any,
  divisi: any
): Promise<string | null> {
  const { cpu, ram, storage } = requestData;

  const response = await axios.get(
    `${process.env.PROXMOX_API_URL}/pools/${divisi.nama}`,
    {
      headers,
      httpsAgent,
    }
  );

  type Member = {
    maxcpu: number;
    maxmem: number;
    maxdisk: number;
  };

  const members: Member[] = response.data.data.members;

  const totalMaxCpu = members.reduce((acc, vm) => acc + vm.maxcpu, 0);
  const totalMaxMemGB = members.reduce(
    (acc, vm) => acc + vm.maxmem / (1024 * 1024 * 1024),
    0
  );
  const totalMaxDiskGB = members.reduce(
    (acc, vm) => acc + vm.maxdisk / (1024 * 1024 * 1024),
    0
  );

  const cpuReq = totalMaxCpu + cpu;
  const ramReq = Math.floor(totalMaxMemGB) + ram / 1024;
  const diskReq = Math.floor(totalMaxDiskGB) + storage;

  if (cpuReq > divisi.cpu) return "Quota cpu pada divisimu tidak mencukupi";
  if (ramReq > divisi.ram) return "Quota ram pada divisimu tidak mencukupi";
  if (diskReq > divisi.storage)
    return "Quota storage pada divisimu tidak mencukupi";

  return null;
}

async function createPengajuan(requestData: any, user: any) {
  let {
    id_template,
    cpu,
    ram,
    storage,
    segment,
    nama_aplikasi,
    tujuan_pengajuan,
    jenis_pengajuan,
    vmid,
    nama_baru,
    node,
  } = requestData;

  let server,
    vmid_old = undefined;

  if (jenis_pengajuan === "Existing") {
    server = await prisma.server.findUnique({
      where: { vmid: vmid },
    });

    vmid_old = vmid;
  }

  if (jenis_pengajuan === "New" || jenis_pengajuan === "Existing") {
    vmid = undefined;
  }

  const pengajuanData = {
    id_template,
    cpu: parseInt(cpu, 10),
    ram: parseInt(ram, 10),
    storage: parseInt(storage, 10),
    segment,
    id_user: user.id,
    status_pengajuan: "Waiting For Dept Head",
    nama_aplikasi,
    tujuan_pengajuan,
    id_divisi: user.divisi.id,
    jenis_pengajuan,
    nama_baru,
    vmid: vmid,
    vmid_old,
    nodes: node,
  };

  return prisma.pengajuan.create({
    data: pengajuanData,
    include: {
      template: true,
    },
  });
}

export async function GET(req: Request) {
  try {
    const token = extractTokenFromCookies(req);

    if (!token) {
      return respondWithError("Authorization token is missing", 401);
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return respondWithError("Invalid or expired token", 401);
    }

    const { userId, role } = decodedToken;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    let pengajuan, totalData;

    if (role === "USER") {
      [pengajuan, totalData] = await fetchPengajuanForUser(userId, skip, limit);
    } else if (role === "HEAD") {
      [pengajuan, totalData] = await fetchPengajuanForHead(userId, skip, limit);
    } else {
      return respondWithError("Access denied", 403);
    }

    return NextResponse.json(
      { pengajuan, totalData, currentPage: page },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching pengajuan:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P1001") {
        return respondWithError(
          "Database connection failed. Please try again later.",
          500
        );
      }
    }

    return respondWithError("Failed to fetch pengajuan", 500);
  }
}

async function fetchPengajuanForUser(
  userId: number,
  skip: number,
  limit: number
) {
  const pengajuan = await prisma.pengajuan.findMany({
    where: {
      id_user: userId,
    },
    orderBy: {
      tanggal_pengajuan: "desc",
    },
    include: {
      template: true,
    },
    skip: skip,
    take: limit,
  });

  const totalData = await prisma.pengajuan.count({
    where: {
      id_user: userId,
    },
  });

  return [pengajuan, totalData];
}

async function fetchPengajuanForHead(
  userId: number,
  skip: number,
  limit: number
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { divisi: true },
  });

  if (!user || !user.divisi) {
    throw new Error("User or divisi not found");
  }

  const pengajuan = await prisma.pengajuan.findMany({
    where: {
      id_divisi: user.divisi.id,
      status_pengajuan: {
        in: ["Waiting For Dept Head", "Proses pengerjaan"],
      },
    },
    orderBy: {
      tanggal_pengajuan: "desc",
    },
    skip: skip,
    take: limit,
    include: {
      user: true,
      template: true,
    },
  });

  const totalData = await prisma.pengajuan.count({
    where: {
      id_divisi: user.divisi.id,
      status_pengajuan: {
        in: ["Waiting For Dept Head", "Proses pengerjaan"],
      },
    },
  });

  return [pengajuan, totalData];
}

function respondWithError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
