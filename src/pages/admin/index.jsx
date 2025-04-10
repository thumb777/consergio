import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Search,
  UserRound,
  MoreHorizontal,
  Lock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "aos/dist/aos.css";
import AOS from "aos";

// Static credentials - in a real app, these would be in a secure environment
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "consergio123"
};

function AdminHome() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const usernameRef = useRef();
  const passwordRef = useRef();

  // Check authentication status on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      setShowLoginDialog(true);
    }
  }, []);

  // Fetch waitlist users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/waitlist/users`
        );
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users");
        setLoading(false);
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dropdown menu
  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  // Filter and sort users
  const filteredAndSortedUsers = [...users]
    .filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Render sort icon based on current sort configuration
  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4" />
      ) : (
        <ChevronDown className="ml-2 h-4 w-4" />
      );
    }
    return <ChevronDown className="ml-2 h-4 w-4 opacity-30" />;
  };

  // Handle edit user
  const handleEditClick = (user) => {
    setEditingUser({
      id: user.id,
      firstName: user.first_name,
      email: user.email_address,
      country: user.country,
      state: user.state,
      status: user.status
    });
    setIsEditModalOpen(true);
    setDropdownOpen(null);
  };

  // Handle update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/api/waitlist/users/${editingUser.id}`,
        editingUser
      );
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? {
              ...user,
              first_name: editingUser.firstName,
              email_address: editingUser.email,
              country: editingUser.country,
              state: editingUser.state,
              status: editingUser.status
            }
          : user
      ));

      setIsEditModalOpen(false);
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
    setDropdownOpen(null);
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/waitlist/users/${userToDelete.id}`
      );
      
      // Update local state
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Get values directly from the refs when form is submitted
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      localStorage.setItem("adminAuthenticated", "true");
      toast.success("Login successful!");
    } else {
      toast.error("Invalid credentials!");
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    setShowLoginDialog(true);
    toast.info("Logged out successfully");
  };

  // Edit Modal Component
  const EditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>
        <form onSubmit={handleUpdateUser}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={editingUser.firstName}
                onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={editingUser.country}
                onChange={(e) => setEditingUser({...editingUser, country: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                value={editingUser.state}
                onChange={(e) => setEditingUser({...editingUser, state: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={editingUser.status}
                onChange={(e) => setEditingUser({...editingUser, status: e.target.value === 'true'})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Delete User</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete {userToDelete?.first_name}? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Login Dialog Component
  const LoginDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Lock className="h-12 w-12 text-gray-700" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              ref={usernameRef}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              ref={passwordRef}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );

  // Update the action buttons in the table row
  const renderActionButtons = (user) => (
    <div className="relative">
      <button
        onClick={() => toggleDropdown(user.id)}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <MoreHorizontal className="h-5 w-5 text-gray-500" />
      </button>
      {dropdownOpen === user.id && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10"
        >
          <div className="py-1">
            <button
              onClick={() => handleEditClick(user)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              Edit user
            </button>
          </div>
          <div className="py-1">
            <button
              onClick={() => handleDeleteClick(user)}
              className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
            >
              Delete user
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-[100vw] bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8]">
        <ToastContainer />
        {showLoginDialog && <LoginDialog />}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen w-[100vw] flex items-center justify-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8]">
        <div className="text-2xl font-serif">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-[100vw] flex items-center justify-center bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8]">
        <div className="text-2xl font-serif text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[100vw] flex flex-col bg-gradient-to-b from-[#FFFFFF] to-[#FCE5D8] p-4">
      <ToastContainer />
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium mb-2">Users Overview</h2>
            <div className="flex items-center">
              <div className="bg-gray-100 p-3 rounded-full mr-3">
                <UserRound className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold">
                  {filteredAndSortedUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold">Users List</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-8 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("first_name")}
                  >
                    <div className="flex items-center">
                      First Name
                      {renderSortIcon("first_name")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("email_address")}
                  >
                    <div className="flex items-center">
                      Email
                      {renderSortIcon("email_address")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("country")}
                  >
                    <div className="flex items-center">
                      Country
                      {renderSortIcon("country")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("state")}
                  >
                    <div className="flex items-center">
                      State
                      {renderSortIcon("state")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("created_at")}
                  >
                    <div className="flex items-center">
                      Created At
                      {renderSortIcon("created_at")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.length > 0 ? (
                  filteredAndSortedUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email_address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                        {renderActionButtons(user)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredAndSortedUsers.length} of {users.length} users
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add modals */}
      {isEditModalOpen && <EditModal />}
      {isDeleteModalOpen && <DeleteModal />}
    </div>
  );
}

export default AdminHome;
