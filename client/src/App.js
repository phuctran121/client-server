import React, { useState, useEffect } from "react";
import AddUser from "./components/AddUser";
import UserList from "./components/UserList";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiUrl = process.env.REACT_APP_API_URL;
  console.log("API URL:", apiUrl);
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken && !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // If we have an access token, try to use it
        if (accessToken) {
          const response = await fetch(`${apiUrl}/api/objects`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUsers(data);
            setIsAuthenticated(true);
            setError(null);
          } else if (response.status === 401 && refreshToken) {
            // Access token expired, try to refresh
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              // Retry fetching data with new token
              await fetchUsers();
            }
          } else {
            // Other error or no refresh token
            handleLogout();
          }
        } else if (refreshToken) {
          // Only refresh token exists, try to get a new access token
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            // Fetch data with new token
            await fetchUsers();
          }
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, []);

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${apiUrl}/api/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      handleLogout();
      return false;
    }
  };

  const handleApiError = async (error, retryFunction) => {
    if (error.status === 401) {
      // Token might be expired, try to refresh
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request
        return retryFunction();
      }
    }
    throw error;
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/objects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw { status: response.status };
      }

      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (error) {
      try {
        await handleApiError(error, fetchUsers);
      } catch (finalError) {
        setError("Failed to fetch users. Please try logging in again.");
        console.error("Error fetching users:", finalError);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const url = editingId
        ? `${apiUrl}/api/objects/${editingId}`
        : `${apiUrl}/api/objects`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw { status: response.status };
      }

      await fetchUsers();
      setEditingId(null);
      setError(null);
    } catch (error) {
      try {
        await handleApiError(error, () => handleSubmit(formData));
      } catch (finalError) {
        setError("Failed to save user. Please try again.");
        console.error("Error saving user:", finalError);
      }
    }
  };

  const handleEdit = (user) => {
    console.log("Editing user:", user);
    setEditingId(user._id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/objects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) {
        throw { status: response.status };
      }

      await fetchUsers();
      setError(null);
    } catch (error) {
      try {
        await handleApiError(error, () => handleDelete(id));
      } catch (finalError) {
        setError("Failed to delete user. Please try again.");
        console.error("Error deleting user:", finalError);
      }
    }
  };

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    fetchUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
    setUsers([]);
    setError(null);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Find the user being edited
  const userToEdit = editingId ? users.find((u) => u._id === editingId) : null;
  console.log("User to edit:", userToEdit);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Student Management System</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      {error && <div className="error-message">{error}</div>}
      <main>
        <AddUser
          onSubmit={handleSubmit}
          editingId={editingId}
          initialData={userToEdit}
          onCancel={() => setEditingId(null)}
        />
        <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />
      </main>
    </div>
  );
}

export default App;
