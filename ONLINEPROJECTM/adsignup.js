// Get the form element
const form = document.querySelector('form');

// Add an event listener to the form
form.addEventListener('submit', (e) => {
  // Prevent the form from submitting
  e.preventDefault();

  // Get the form data
  const formData = new FormData(form);

  // Send a POST request to the server with the form data
  fetch('/signup', {
    method: 'POST',
    body: formData,
  })
  .then((response) => {
    // If the response is successful, redirect the user to the login page
    if (response.ok) {
      window.location.href = 'adminlogin.html';
    } else {
      // If the response is not successful, show an error message
      const errorMessage = document.createElement('p');
      errorMessage.textContent = 'An error occurred. Please try again.';
      errorMessage.style.color = 'red';
      form.insertBefore(errorMessage, form.firstChild);
      setTimeout(() => {
        errorMessage.remove();
      }, 5000);
    }
  })
  .catch((error) => {
    // If there is an error with the request, show an error message
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'An error occurred. Please try again.';
    errorMessage.style.color = 'red';
    form.insertBefore(errorMessage, form.firstChild);
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  });
});