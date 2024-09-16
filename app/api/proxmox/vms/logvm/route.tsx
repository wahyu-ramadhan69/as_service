import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, LogVM } from "@prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "rahasia";

interface MyJwtPayload extends JwtPayload {
  userId: number;
  role: string;
}

const prisma = new PrismaClient();

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

export async function GET(req: NextRequest) {
  const token = extractTokenFromCookies(req);

  if (!token) {
    return respondWithError("Authorization token is missing", 401);
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    return respondWithError("Invalid or expired token", 401);
  }

  const { userId, role } = decodedToken;

  try {
    let logs: LogVM[];

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return respondWithError("User not found", 404);
    }

    if (role === "HEAD") {
      logs = await prisma.logVM.findMany({
        where: {
          user: {
            id_divisi: user.id_divisi,
          },
        },
        include: {
          user: {
            select: {
              username: true, // Selecting the username
              divisi: {
                select: {
                  nama: true, // Selecting the division name
                },
              },
            },
          },
        },
        orderBy: {
          tanggal_activity: "desc",
        },
        take: 10,
      });
    } else if (role === "ADMIN") {
      logs = await prisma.logVM.findMany({
        orderBy: {
          tanggal_activity: "desc",
        },
        take: 20,
      });
    } else if (role === "USER") {
      logs = await prisma.logVM.findMany({
        where: {
          id_user: userId,
        },
        orderBy: {
          tanggal_activity: "desc",
        },
        take: 10,
      });
    } else {
      logs = [];
    }

    const response: ApiResponse<LogVM[]> = {
      statusCode: 200,
      message: "Successfully retrieved logs",
      data: logs,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      statusCode: 500,
      message: "Failed to retrieve logs",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
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
