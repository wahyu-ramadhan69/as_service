import React from "react";
import { useState } from "react";
import { GoScreenFull } from "react-icons/go";
import { GrPowerShutdown } from "react-icons/gr";
import { IoIosClose } from "react-icons/io";
import { VscDebugRestart, VscDebugStart } from "react-icons/vsc";

interface Member {
  name: string;
  node: string;
  status: string;
  maxdisk: number;
  maxmem: number;
  maxcpu: number;
  vmid: number;
  image: string;
  ip: string;
}

interface ConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Member | null;
}

const ConsoleModal: React.FC<ConsoleModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [port, setPort] = useState(null);
  const [password, setPassword] = useState(null);
  if (!isOpen) return null;

  const goFullScreen = () => {
    const iframe = document.getElementById(
      "console-iframe"
    ) as HTMLIFrameElement | null;

    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else {
        console.error("Fullscreen API is not supported");
      }
    } else {
      console.error("Iframe element not found");
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch(`/api/proxmox/console`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node: data?.node,
          vmid: data?.vmid,
        }),
      });

      const response = await res.json();
      setPort(response.port);
      setPassword(response.password);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${
            port && password ? "sm:max-w-7xl" : "sm:max-w-lg"
          } sm:w-full`}
        >
          <div className="bg-white px-4 pt-5 pb-4 relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {data?.name} {data?.ip}
              </h3>
              <div className="flex justify-center items-center">
                <button
                  onClick={goFullScreen}
                  className="flex justify-center items-center text-gray-400 hover:text-gray-600 focus:outline-none bg-green-400 p-1 rounded-full mr-1"
                >
                  <GoScreenFull className="text-gray-600 text-sm" />
                </button>
                <button
                  onClick={onClose}
                  className=" flex justify-center items-center text-gray-400 hover:text-gray-600 focus:outline-none p-1 bg-red-400 rounded-full"
                >
                  <IoIosClose className="text-gray-600 text-sm" />
                </button>
              </div>
            </div>

            <div className="flex justify-center items-center">
              {port && password ? (
                <div className="w-full max-w-7xl mt-4">
                  <iframe
                    id="console-iframe"
                    src={`http://192.168.1.132:${port}/vnc.html?password=${encodeURIComponent(
                      password
                    )}&autoconnect=true&resize=scale`}
                    width="100%"
                    height="700px"
                    className="border border-gray-300 rounded"
                    title="VM Console"
                  ></iframe>
                </div>
              ) : (
                <button
                  className="bg-sky-400 px-4 py-2 text-white rounded-lg"
                  onClick={handleConnect}
                >
                  Open Console
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsoleModal;
