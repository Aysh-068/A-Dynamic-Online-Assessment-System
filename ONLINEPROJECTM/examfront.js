document.addEventListener('DOMContentLoaded', function() {
  const studentIdForm = document.getElementById('studentIdForm');
  const errorMessage = document.getElementById('errorMessage');

  studentIdForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(studentIdForm);

    // Convert form data to JSON
    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    fetch('/check-student-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid id');
      }
      return response.text();
    })
    .then(data => {
      // Redirect to home page or display success message
      window.location.href = '/facexm.html';
    })
    .catch(error => {
      errorMessage.textContent = error.message;
    });
  });
});
