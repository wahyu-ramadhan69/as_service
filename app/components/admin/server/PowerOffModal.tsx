import React from "react";
import { useState } from "react";
import { GrPowerShutdown } from "react-icons/gr";

interface Member {
  name: string;
  node: string;
  status: string;
  maxdisk: number;
  maxmem: number;
  maxcpu: number;
  vmid: number;
  image: string;
}

interface PowerOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseSubmit: () => void;
  data: Member | null;
}

const PowerOffModal: React.FC<PowerOffModalProps> = ({
  isOpen,
  onClose,
  onCloseSubmit,
  data,
}) => {
  const [tujuan, setTujuan] = useState("");
  const [statusPowerOff, setStatusPowerOff] = useState(false);
  if (!isOpen) return null;

  const handlePowerOff = async () => {
    try {
      setStatusPowerOff(true);
      const response = await fetch(`/api/proxmox/vms/poweroff/${data?.vmid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node: data?.node,
          tujuan,
        }),
      });
      if (response.ok) {
        setTujuan("");
        setStatusPowerOff(false);
        onCloseSubmit();
      } else {
        console.error("Failed to delete divisi:", response.statusText);
        setTujuan("");
      }
    } catch (error) {
      console.error("Error during deletion:", error);
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
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Confirm PowerOff
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="mt-2 px-1">
              <p className="text-sm my-2">
                Apakah anda yakin ingin matikan vm {data?.vmid} tulis alasannya
                :
              </p>

              <div className="mb-4">
                <textarea
                  id="tujuan_pengajuan"
                  name="tujuan_pengajuan"
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Tujuan mematikan server(opsional)"
                  required
                  rows={4} // Adjust the number of rows to control the height of the textarea
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePowerOff}
                  className="bg-red-500 flex justify-center items-center hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {statusPowerOff === true ? (
                    <svg
                      className="animate-spin h-5 w-5 text-gray-500"
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
                  ) : (
                    <GrPowerShutdown className="text-2xl text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerOffModal;