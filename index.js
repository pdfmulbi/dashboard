const API_BASE = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger"; // Base URL API

// Fetch all users
async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE}/pdfm/get/users`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
        });
        if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
        const users = await response.json();
        populateUserTable(users);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Populate the user table
function populateUserTable(users) {
    const tableBody = document.querySelector("#user-table tbody");
    tableBody.innerHTML = ""; // Clear existing rows
    users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.isSupport ? "Yes" : "No"}</td>
            <td>${new Date(user.lastMergeTime).toLocaleString()}</td>
            <td>${user.mergeCount}</td>
            <td>
                <button class="edit" onclick="editUser('${user.id}')">Edit</button>
                <button class="delete" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Save a new or edited user
async function saveUser(event) {
    event.preventDefault();
    const userId = document.getElementById("user-id").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const isSupport = document.getElementById("isSupport").checked;

    const payload = { name, email, password, isSupport };
    if (userId) payload.id = userId;

    const method = userId ? "PUT" : "POST";
    const url = userId
        ? `${API_BASE}/pdfm/update/users`
        : `${API_BASE}/pdfm/create/users`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            mode: "cors",
        });
        if (!response.ok) throw new Error(`Failed to save user: ${response.status}`);
        document.getElementById("user-form").reset();
        fetchUsers();
    } catch (error) {
        console.error("Error saving user:", error);
    }
}

// Delete a user
async function deleteUser(userId) {
    try {
        const payload = { id: userId };
        const response = await fetch(`${API_BASE}/pdfm/delete/users`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            mode: "cors",
        });
        if (!response.ok) throw new Error(`Failed to delete user: ${response.status}`);
        fetchUsers();
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Edit a user
async function editUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/pdfm/getoneadmin/users?id=${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
        });
        if (!response.ok) throw new Error(`Failed to fetch user details: ${response.status}`);
        const user = await response.json();

        document.getElementById("user-id").value = user.id;
        document.getElementById("name").value = user.name;
        document.getElementById("email").value = user.email;
        document.getElementById("password").value = "";
        document.getElementById("isSupport").checked = user.isSupport;
    } catch (error) {
        console.error("Error editing user:", error);
    }
}

// Initialize event listeners
document.getElementById("user-form").addEventListener("submit", saveUser);

// Load all users on page load
fetchUsers();
