// script.js

document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission

  // Get username and password from the form
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;

  // You may want to perform validation here

  // Perform authentication (e.g., check against a database)
  if (username === 'admin' && password === 'password') {
      // Authentication successful
      document.getElementById('message').textContent = 'Login successful! Redirecting...';
      // Redirect to a new page or perform any desired action
      setTimeout(function() {
          window.location.href = 'dashboard.html'; // Redirect to dashboard page
      }, 2000); // Redirect after 2 seconds
  } else {
      // Authentication failed
      document.getElementById('message').textContent = 'Invalid username or password';
  }
});