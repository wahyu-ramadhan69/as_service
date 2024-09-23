import express from "express";
import LdapAuth from "ldapauth-fork";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

const ldapConfig = (username) => ({
  url: process.env.LDAP_URL,
  bindDN: process.env.LDAP_BIND_DN,
  bindCredentials: process.env.LDAP_BIND_PASSWORD,
  searchBase: process.env.LDAP_SEARCH_BASE,
  searchFilter: `(sAMAccountName=${username})`,
  reconnect: true,
});

// Route autentikasi
app.post("/auth", async (req, res) => {
  const { username, password } = req.body;

  try {
    const auth = new LdapAuth(ldapConfig(username));

    const user = await new Promise((resolve, reject) => {
      auth.authenticate(username, password, (err, user) => {
        if (err && err.name === "InvalidCredentialsError") {
          return reject({ errorType: "invalidPassword" });
        }
        if (!user) {
          return reject({ errorType: "userNotFound" });
        }
        resolve(user);
      });
    });

    if (user) {
      let role = "";

      if (user.title === "Staff") {
        role = "USER";
      } else if (user.title === "Departemen Head") {
        role = "HEAD";
      }

      const token = jwt.sign(
        {
          username: user.sAMAccountName,
          role,
          divisi: user.department,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Login berhasil",
        data: { token },
        status: 200,
      });
    }
  } catch (err) {
    if (err.errorType === "userNotFound") {
      return res
        .status(404)
        .json({ error: "User tidak ditemukan", status: 404 });
    }
    if (err.errorType === "invalidPassword") {
      return res.status(401).json({ error: "Invalid password", status: 401 });
    }
    return res.status(500).json({ error: "Server error", status: 500 });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});
