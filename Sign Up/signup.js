// signup.js
document.getElementById('signupButton').addEventListener('click', function() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if(!username || !email || !password){
        alert("Please fill in all the fields.");
        return;
    }

     // ** Email validation condition added here **
     if (!email.includes("@")) {
        alert("Please enter a valid email address.");
        return; // Exit the function if the email is invalid
    }

    // Check if password is at least 4 characters long
    if (password.length < 4) {
        alert("Password must be at least 4 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Add your signup logic here (e.g., send data to a server)
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    // You could also redirect the user after successful signup
    window.location.href = "file:///C:/Users/indir/OneDrive/Desktop/TO-DO MANAGER/New folder/home page/home.html";
});