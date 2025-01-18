document.addEventListener("DOMContentLoaded", () => {
    const userForm = document.getElementById("userForm");
    const userTable = document.querySelector("#userTable tbody");
    const apiUrl = "https://asia-southeast2-pdfulbi.cloudfunctions.net/pdfmerger/pdfm/users";

    async function fetchUsers() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const users = await response.json();
            userTable.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.mergeCount || 0}</td>
                    <td>
                        <button class="edit" onclick="editUser('${user._id}')">Edit</button>
                        <button class="delete" onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                </tr>
            `).join('');            
        } catch (error) {
            alert(`Failed to load users. ${error.message}`);
        }
    }

    userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("userId").value;
        const name = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        const password = document.getElementById("userPassword").value;

        const userData = {
            name,
            email,
            password,
            id
        };

        try {
            const method = id ? "PUT" : "POST";
            const response = await fetch(apiUrl, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData),
            });
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            alert("User saved successfully!");
            userForm.reset();
            fetchUsers();
        } catch (error) {
            alert(`Failed to save user. ${error.message}`);
        }
    });

    // Edit user
    window.editUser = async (id) => {
        try {
            const response = await fetch(`${apiUrl}?id=${id}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            const user = await response.json();
            document.getElementById("userId").value = user._id;
            document.getElementById("userName").value = user.name;
            document.getElementById("userEmail").value = user.email;
            document.getElementById("userPassword").value = "";
        } catch (error) {
            alert(`Failed to load user details. ${error.message}`);
        }
    };

    // Delete user
    window.deleteUser = async (_id) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        console.log("Deleting user with _id:", _id); // Log for debugging
        try {
            // Send DELETE request to backend
            const response = await fetch(apiUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json", // Ensure JSON format
                },
                body: JSON.stringify({
                    id: _id, // Send _id as "id" to backend
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response from server:", errorData); // Log error for debugging
                throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
            }

            const responseData = await response.json(); // Parse successful response
            alert(responseData.message || "User deleted successfully!"); // Show server response message
            fetchUsers(); // Refresh the user list
        } catch (error) {
            console.error("Failed to delete user:", error); // Log error for debugging
            alert(`Failed to delete user. ${error.message}`);
        }
    };
    fetchUsers();
});