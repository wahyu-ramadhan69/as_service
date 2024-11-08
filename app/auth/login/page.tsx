"use client";

import React, { useState } from "react";
import { useAuth } from "../../lib/authContext"; // Sesuaikan dengan path authContext Anda
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authWith, setAuthWith] = useState("BCAFWIFI");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    login(username, password, authWith);
    setLoading(false);
  };
  return (
    <div className="lg:flex bg-white">
      <ToastContainer />
      {/* Bagian kiri untuk form login */}
      <div className="lg:w-1/2 xl:max-w-screen-sm">
        <div className="py-12 bg-white lg:bg-white flex justify-center lg:justify-start lg:px-12">
          <div className="cursor-pointer flex items-center">
            <div>
              <img src="/proxmox.png" className="w-6" />
            </div>
            <div className="text-lg text-indigo-800 tracking-wide ml-2 font-semibold">
              Self Service
            </div>
          </div>
        </div>

        <div className="mt-10 px-12 sm:px-24 md:px-48 lg:px-12 lg:mt-16 xl:px-24 xl:max-w-2xl">
          <h2 className="text-center text-4xl text-indigo-900 font-display font-semibold lg:text-left xl:text-5xl xl:text-bold">
            Log in
          </h2>

          <div className="mt-12">
            <form onSubmit={handleSubmit}>
              <div>
                <div className="text-sm font-bold text-gray-700 tracking-wide">
                  Authentication Method
                </div>
                <select
                  className="w-full text-sm py-2 border-b border-gray-300  text-gray-700 focus:outline-none focus:border-indigo-500"
                  value={authWith}
                  onChange={(e) => setAuthWith(e.target.value)}
                  required
                >
                  <option value="BCAFWIFI">BCAF</option>
                  <option value="LOCAL">LOCAL</option>
                </select>
              </div>

              <div className="mt-8">
                <div className="text-sm font-bold text-gray-700 tracking-wide">
                  Username
                </div>
                <input
                  className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold text-gray-700 tracking-wide">
                    Password
                  </div>
                </div>
                <input
                  className="w-full text-lg py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mt-10">
                {loading ? (
                  <div className="flex justify-center items-center">
                    <svg
                      className="animate-spin h-7 w-7 text-purple-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <button
                    className="bg-indigo-500 text-gray-100 p-4 w-full rounded-full tracking-wide font-semibold font-display focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg"
                    type="submit"
                  >
                    Log In
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bagian kanan untuk gambar ilustrasi */}
      <div className="hidden lg:flex items-center justify-center bg-indigo-100 flex-1 h-screen">
        <div className="max-w-xs transform duration-200 hover:scale-150 cursor-pointer">
          <img
            src="/proxmox.png"
            alt="Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
