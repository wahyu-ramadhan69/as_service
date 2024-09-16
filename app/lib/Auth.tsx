import jwt from "jsonwebtoken";

interface MyJwtPayload {
  userId: string;
  role: string;
}

export function extractAndVerifyToken(req: Request): MyJwtPayload | null {
  const JWT_SECRET = process.env.JWT_SECRET as string;

  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  const token = cookies?.token;
  if (!token) return null;

  // Verifikasi token
  try {
    return jwt.verify(token, JWT_SECRET) as MyJwtPayload;
  } catch {
    return null;
  }
}
