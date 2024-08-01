const form = document.querySelector('#signupForm');

form.addEventListener('submit', (e) => {
  // Prevent the form from submitting
  e.preventDefault();

  // Get the form data
  const formData = new FormData(form);

  // Convert FormData to JSON object
  const jsonObject = {};
  formData.forEach((value, key) => {
    jsonObject[key] = value;
  });

  // Send a POST request to the server with the JSON data
  fetch('/facsignup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Set content type to JSON
    },
    body: JSON.stringify(jsonObject), // Convert JSON object to string
  })
  .then((response) => {
    // If the response is successful, redirect the user to the login page
    if (response.ok) {
      window.location.href = 'flogin.html';
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
