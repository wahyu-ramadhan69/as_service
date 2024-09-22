import { NextResponse } from "next/server";
import ldap from "ldapjs";
import jwt from "jsonwebtoken";
import { respondWithError, respondWithSuccess } from "@/app/lib/Response";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia";

// Fungsi untuk mencari DN pengguna
async function searchUserDN(client: ldap.Client, username: string) {
  const searchOptions: ldap.SearchOptions = {
    filter: `(sAMAccountName=${username})`,
    scope: "sub",
    attributes: ["dn", "title", "department"], // Meminta atribut tertentu
  };

  const baseDN = "OU=group,DC=BCAFWIFI,DC=CO,DC=ID"; // DN untuk pencarian user

  return new Promise<{ dn: string; jobTitle: string; department: string }>(
    (resolve, reject) => {
      client.search(baseDN, searchOptions, (err, res) => {
        if (err) {
          return reject({
            message: "Gagal mencari pengguna: " + err.message,
            status: 500,
          });
        }

        let userDN = "";
        let jobTitle = "N/A";
        let department = "N/A";

        res.on("searchEntry", (entry) => {
          userDN = entry.dn.toString();
          const jobTitleAttr = entry.attributes.find(
            (attr) => attr.type === "title"
          );
          const departmentAttr = entry.attributes.find(
            (attr) => attr.type === "department"
          );

          jobTitle = jobTitleAttr ? jobTitleAttr.values[0] : "N/A";
          department = departmentAttr ? departmentAttr.values[0] : "N/A";
        });

        res.on("error", (err) => {
          return reject({
            message: "Kesalahan saat pencarian: " + err.message,
            status: 500,
          });
        });

        res.on("end", () => {
          if (userDN) {
            resolve({ dn: userDN, jobTitle, department });
          } else {
            reject({ message: "Pengguna tidak ditemukan", status: 404 });
          }
        });
      });
    }
  );
}

async function authenticateWithLDAP(username: string, password: string) {
  const client = ldap.createClient({
    url: "ldap://192.168.29.12",
  });

  const adminDN = "CN=Tri Ade Putra,OU=staff,OU=group,DC=BCAFWIFI,DC=CO,DC=ID";
  const adminPassword = "1234Qwer";

  return new Promise<{
    authenticated: boolean;
    jobTitle: string;
    department: string;
  }>(async (resolve, reject) => {
    client.bind(adminDN, adminPassword, async (err) => {
      if (err) {
        client.unbind();
        return reject({
          message: "Bind LDAP gagal: " + err.message,
          status: 500,
        });
      }

      try {
        const userDN = await searchUserDN(client, username);

        client.bind(userDN.dn, password, (err) => {
          if (err) {
            client.unbind();
            return reject({
              message: "Incorrect password",
              status: 401,
            });
          } else {
            resolve({
              authenticated: true,
              jobTitle: userDN.jobTitle,
              department: userDN.department,
            });
            client.unbind();
          }
        });
      } catch (error) {
        client.unbind();
        reject(error);
      }
    });
  });
}

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username dan password harus diisi" },
      { status: 400 }
    );
  }

  try {
    const result = await authenticateWithLDAP(username, password);
    if (result.authenticated) {
      let role = "";
      if (result.jobTitle === "Staff") {
        role = "USER";
      } else if (result.jobTitle === "Departemen Head") {
        role = "HEAD";
      }

      const token = jwt.sign(
        { username, role, divisi: result.department },
        JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      const response = respondWithSuccess("Login successful", { token }, 200);
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60,
      });

      return response;
    } else {
      return NextResponse.json({ error: "Autentikasi gagal" }, { status: 401 });
    }
  } catch (error) {
    const { message, status } = error as { message: string; status: number };
    return respondWithError(message, status);
  }
}
