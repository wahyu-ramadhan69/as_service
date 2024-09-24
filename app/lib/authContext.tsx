"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
    authWith: string
  ) => Promise<void>;
  logout: () => void;
}

interface DecodedToken {
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setIsAuthenticated(true);
        if (
          (decodedToken.role === "ADMIN" && pathname.startsWith("/admin")) ||
          (decodedToken.role === "HEAD" && pathname.startsWith("/head")) ||
          (decodedToken.role === "USER" && pathname.startsWith("/user"))
        ) {
          return;
        }
        navigateToRole(decodedToken.role);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        router.push("/auth/login");
      }
    } else {
      router.push("/auth/login");
    }
  }, [router, pathname]);

  const navigateToRole = (role: string) => {
    switch (role) {
      case "USER":
        if (!pathname.startsWith("/user")) {
          router.push("/user");
        }
        break;
      case "HEAD":
        if (!pathname.startsWith("/head")) {
          router.push("/head");
        }
        break;
      case "ADMIN":
        if (!pathname.startsWith("/admin")) {
          router.push("/admin");
        }
        break;
      default:
        console.error("Invalid role");
        router.push("/auth/login");
    }
  };

  const login = async (
    username: string,
    password: string,
    authWith: string
  ) => {
    try {
      const response = await fetch(
        `${
          authWith === "BCAFWIFI"
            ? "http://localhost:3000/auth"
            : "/api/auth/login"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const { data } = result;
        const { token } = data;

        if (token) {
          localStorage.setItem("token", token);

          if (authWith === "BCAFWIFI") {
            Cookies.set("token", token, {
              expires: 1 / 24,
              secure: true,
            });
          }
          try {
            const decodedToken: DecodedToken = jwtDecode(token);
            setIsAuthenticated(true);
            navigateToRole(decodedToken.role);
          } catch (error) {
            localStorage.removeItem("token");
            toast.error("Invalid token");
          }
        } else {
          toast.error("Token not found");
        }
      } else {
        toast.error(result.error || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error logging in", error);
      toast.error("Error logging in");
    }
  };

  const logout = async () => {
    try {
      // Panggil API logout ke server
      const response = await fetch("/api/auth/logout", {
        method: "POST", // atau gunakan 'DELETE' jika Anda pakai method DELETE
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        // se
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        router.push("/auth/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
