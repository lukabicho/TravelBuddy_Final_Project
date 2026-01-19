const API_KEY = '4693ce8a4ec184b816ca1e1c0778a3aa';

async function fetchAllWeather() {
    const cards = document.querySelectorAll('.place-card');

    cards.forEach(async (card) => {
        const lat = card.getAttribute('data-lat');
        const lon = card.getAttribute('data-lon');
        const display = card.querySelector('.weather-display');

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("API Error");

            const data = await response.json();
            
            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description;
            const iconCode = data.weather[0].icon;

            // Using your requested HTML template
            display.innerHTML = `
                <div class="weather-box" style="display: flex; align-items: center; margin-top: 10px; background: #f9f9f9; border-radius: 8px; padding: 5px 10px;">
                    <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="weather" style="width: 40px; height: 40px;">
                    <div style="text-align: left; margin-left: 5px;">
                        <p style="margin: 0; font-weight: bold; font-size: 1.1rem;">${temp}°C</p>
                        <p style="margin: 0; font-size: 0.8rem; color: #666; text-transform: capitalize;">${desc}</p>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error("Error loading weather for a card:", err);
            display.innerHTML = `<p style="font-size: 10px; color: #999;">Weather unavailable</p>`;
        }
    });
}

fetchAllWeather();

const modal = document.getElementById("loginModal");
const logoutModal = document.getElementById("logoutModal");
const btn = document.getElementById("loginBtn");
const closeBtn = document.querySelector(".close-modal");
const register = document.getElementById("registerBtn");
const loginAgain = document.getElementById("loginAgain");
const loginSbmt = document.getElementById("loginSubmit");
const registerSbmt = document.getElementById("registerSubmit");
let loginMode = true;

// 1. Open modal when login button clicked
btn.onclick = function() {
    modal.style.display = "flex";
}

// 2. Close modal when 'x' is clicked
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// 3. Close modal if user clicks anywhere outside the box
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// 4. Toggle between Login and Register forms
register.onclick = function() {
    loginSbmt.style.display = "none";
    registerSbmt.style.display = "block";
    register.style.display = "none";
    loginAgain.style.display = "block";
    loginMode = false;
};

loginAgain.onclick = function() {
    loginAgain.style.display = "none";
    register.style.display = "block";
    loginSbmt.style.display = "block";
    registerSbmt.style.display = "none";
    loginMode = true;
};

// Helper: Convert a string to a SHA-256 hash (One-way encryption)
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// REGISTER FUNCTION
async function registerUser(username, password) {
    const hashedPassword = await hashPassword(password);
    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[username]) {
        alert("User already exists!");
        return;
    }

    users[username] = hashedPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration successful!");
}

// LOGIN FUNCTION
async function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const storedHash = users[username];

    if (!storedHash) {
        alert("User not found!");
        return false;
    }

    const enteredHash = await hashPassword(password);

    if (enteredHash === storedHash) {
        alert("Login successful! Welcome " + username);
        const now = new Date().getTime();
        const expirationTime = now + (5 * 60 * 1000); // 5 minutes in milliseconds

        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('sessionExpiry', expirationTime); // Store the "deadline"
        localStorage.setItem('loggedInUser', username);
        return true;
    } else {
        alert("Incorrect password!");
        return false;
    }
}

function checkSessionStatus() {
    const expiry = localStorage.getItem('sessionExpiry');
    const now = new Date().getTime();

    if (expiry && now > expiry) {
        // Session has expired!
        logoutUser();
        alert("Your session has expired. Please login again.");
    }
}

function logoutUser() {
    localStorage.removeItem('loggedInUser'); // Match the storage type here
    localStorage.removeItem('sessionExpiry');
    if (loginMode){
        btn.onclick = function() {
            modal.style.display = "none";
            logoutModal.style.display = "flex";
        }
    }
    
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) loginBtn.innerText = "Login";
    
    window.location.reload(); 
}

const authForm = document.getElementById("authForm");

authForm.onsubmit = async function(e) {
    e.preventDefault();
    
    // Grabbing the values from the inputs
    const username = authForm.querySelector('input[type="text"]').value;
    const password = authForm.querySelector('input[type="password"]').value;

    if (loginMode) {
        // Use await so the script waits for the login check to finish
        const success = await loginUser(username, password);
        
        if (success) {
            modal.style.display = "none"; // Close the popup
            updateNavForUser(username);   // Update the UI
            authForm.reset();             // Clear the input fields
        }
    } else {
        // Use await for the registration process
        await registerUser(username, password);
        
        // Optional: Automatically click 'Login' to switch the form back
        loginAgain.click(); 
        authForm.reset();
    }
};

//burger menu script
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

burger.addEventListener('click', () => {
    // Toggle the Nav Menu
    navLinks.classList.toggle('active');
    
    // Toggle the Dark Overlay
    navOverlay.classList.toggle('active');
    
    // Animate Burger to X
    burger.classList.toggle('toggle');
});

// Function to swap "Login" button for or Username
function updateNavForUser(username) {
    const loginBtn = document.getElementById("loginBtn");
    loginBtn.innerText = `Hi, ${username}`;
}

// Run check when page loads
// Replace your existing window.onload with this:
window.onload = function() {
    // 1. Immediately check if the 5-minute timer has expired
    checkSessionStatus();

    // 2. Fetch data specifically from LOCAL storage
    const storedUser = localStorage.getItem('loggedInUser');
    const expiry = localStorage.getItem('sessionExpiry');
    const now = new Date().getTime();

    // 3. If the user exists and the time is still valid, restore the UI
    if (storedUser && expiry && now < expiry) {
        console.log("Session restored for:", storedUser);
        updateNavForUser(storedUser);
    } else {
        console.log("No active session found or session expired.");
    }
};

// Keep your interval check as well
setInterval(checkSessionStatus, 30000);