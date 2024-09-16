"use client";
import React, { useState } from "react";
import axios from "axios";
import { VscDebugRestart } from "react-icons/vsc";
import { MdDeleteForever } from "react-icons/md";
import { BsCpu, BsMemory } from "react-icons/bs";
import { FaHardDrive } from "react-icons/fa6";
import { TfiHarddrive } from "react-icons/tfi";

interface BoxProps {
  name: string;
  node: string;
  status: string;
  maxdisk: number;
  maxmem: number;
  maxcpu: number;
  vmid: number;
  image: string;
}

const Box: React.FC<BoxProps> = ({
  name,
  node,
  status,
  maxdisk,
  maxmem,
  maxcpu,
  vmid,
  image,
}) => {
  const [iframeSrc, setIframeSrc] = useState<string>("");

  const openVncConsole = async (vmid: number, node: string) => {
    try {
      const response = await axios.post("/api/vnc", { vmid, node });
      const noVncUrl = response.data.url;
      console.log(noVncUrl);

      window.open(noVncUrl, "_blank");
    } catch (error) {
      console.error("Failed to open VNC console:", error);
      alert("Error opening VNC console.");
    }
  };

  return (
    <div className="relative bg-white shadow rounded-lg p-4 flex flex-col items-center group overflow-hidden">
      <img src={image} alt={name} className="h-16 w-16 rounded-full mb-4" />
      <div className="text-sm font-semibold mb-2">{name}</div>
      <div className="text-xs text-gray-600 mb-2">VM ID {vmid}</div>
      <div className="text-xs text-gray-600 mb-2">Node {node}</div>

      <tbody>
        <tr>
          <td>
            <div
              className={`text-xs text-white mb-2 px-2 py-1 rounded-full ${
                status === "stopped" ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {status}
            </div>
          </td>
          <td>
            <div className="text-xs text-gray-600 mb-2 flex justify-center items-center">
              <TfiHarddrive className="text-2xl mx-2" />
              <span>{maxdisk.toFixed(2)}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            {" "}
            <div className="text-xs text-gray-600 mb-2 flex justify-center items-center">
              <BsMemory className="text-2xl mx-2" />
              {maxmem.toFixed(2)}
            </div>
          </td>
          <td>
            <div className="text-xs text-gray-600 mb-2 flex justify-center items-center">
              <BsCpu className="text-2xl mx-2" />
              {maxcpu}
            </div>
          </td>
        </tr>
      </tbody>

      <div className="absolute bottom-0 w-full h-1/3 bg-black/10 flex justify-between transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300 ease-in-out">
        <button className="bg-red-400 text-white w-1/2 m-2 flex justify-center items-center rounded">
          <MdDeleteForever className="text-2xl text-white" />
        </button>
        <button className="bg-cyan-400 text-white w-1/2 m-2 flex justify-center items-center rounded">
          <VscDebugRestart className=" text-2xl text-white" />
        </button>
      </div>
    </div>
  );
};

export default Box;
