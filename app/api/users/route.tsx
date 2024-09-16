import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import https from "https";

const prisma = new PrismaClient();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const headers = {
  Authorization: `PVEAPIToken=${process.env.TOKEN_ID}=${process.env.TOKEN}`,
  "Content-Type": "application/json",
};

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        divisi: true,
      },
    });
    return NextResponse.json(
      {
        message: "Data fetched successfully",
        data: users,
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, password, role, email, id_divisi } = await req.json();
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password minimal terdiri dari 4 karakter" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        email,
        divisi: {
          connect: { id: parseInt(id_divisi) },
        },
      },
      include: {
        divisi: true,
      },
    });

    return NextResponse.json(
      {
        message: "Data insert successfully",
        data: newUser,
        statusCode: 201,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}
