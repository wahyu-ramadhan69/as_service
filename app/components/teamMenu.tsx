"use client";

import React, { useState } from "react";

const teamsData = [
  {
    id: 1,
    name: "Graph API",
    title: "Development Team",
    email: "graphapi@example.com",
    role: "Admin",
  },
  {
    id: 2,
    name: "Component Design",
    title: "Design Team",
    email: "componentdesign@example.com",
    role: "Member",
  },
  {
    id: 3,
    name: "Templates",
    title: "Template Team",
    email: "templates@example.com",
    role: "Admin",
  },
  {
    id: 4,
    name: "React Components",
    title: "Component Team",
    email: "reactcomponents@example.com",
    role: "Owner",
  },
];

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (team: {
    name: string;
    title: string;
    email: string;
    role: string;
  }) => void;
}

const AddTeamModal: React.FC<AddTeamModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({ name, title, email, role });
    onClose();
  };

  if (!isOpen) return null;

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
                Add Team
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
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="name"
                  >
                    Team Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="title"
                  >
                    Team Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="role"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Dev">Dev</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TeamMenu() {
  const [teams, setTeams] = useState(teamsData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTeam = (team: {
    name: string;
    title: string;
    email: string;
    role: string;
  }) => {
    setTeams([...teams, { id: teams.length + 1, ...team }]);
  };

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Teams</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add Team
          </button>
        </div>
        <AddTeamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTeam}
        />
        <p className="text-sm text-gray-600 mb-4">
          A list of all the teams including their name, title, members, email,
          and role.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  CPU
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  RAM
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {team.name}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {team.title}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {team.email}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm">
                    {team.role}
                  </td>
                  <td className="px-6 py-4 border-b border-gray-200 text-sm text-blue-500 hover:text-blue-700 cursor-pointer">
                    Edit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
