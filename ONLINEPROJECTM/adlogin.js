document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
  
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const formData = new FormData(loginForm);
  
      fetch('/login', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Invalid email or password');
        }
        return response.text();
      })
      .then(data => {
        // Redirect to home page or display success message
        window.location.href = '/adfun.html';
      })
      .catch(error => {
        errorMessage.textContent = error.message;
      });
    });
  });
  