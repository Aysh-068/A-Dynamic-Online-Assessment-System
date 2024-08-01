document.addEventListener('DOMContentLoaded', function () {
  const deleteForm = document.getElementById('deleteForm');
  const dltResults = document.getElementById('dltResults');

  deleteForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    const facultyId = document.getElementById('facultyId').value;

    fetch('/dltfac', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ facultyId })
    })
    .then(response => response.text())
    .then(data => {
      dltResults.textContent = data;
    })
    .catch(error => {
      console.error('Error:', error);
      dltResults.textContent = 'Error occurred while deleting';
    });
  });
});
