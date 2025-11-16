/* =====================================================
   SIMPLE AUTH SYSTEM (localStorage only)
   ===================================================== */

function signupUser() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const pass = document.getElementById("signupPass").value.trim();

    if (!name || !email || !pass) {
        alert("Please fill all fields.");
        return;
    }

    const user = { name, email, pass };
    localStorage.setItem("mytoneUser", JSON.stringify(user));

    alert("Account created successfully! 💙");
    window.location.href = "index.html"; // Go to dashboard
}

function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    const savedUser = JSON.parse(localStorage.getItem("mytoneUser"));

    if (!savedUser || savedUser.email !== email || savedUser.pass !== pass) {
        alert("Incorrect email or password.");
        return;
    }

    alert("Login successful!");
    window.location.href = "index.html";
}

function logoutUser() {
    localStorage.removeItem("mytoneUser");
    alert("Logged out successfully!");
    window.location.href = "login.html";
}