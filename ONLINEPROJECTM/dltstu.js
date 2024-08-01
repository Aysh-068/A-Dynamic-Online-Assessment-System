document.addEventListener('DOMContentLoaded', function () {
  const deleteForm = document.getElementById('deleteForm');
  const dltResults = document.getElementById('dltResults');

  deleteForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    const studentId = document.getElementById('studentId').value;

    fetch('/dltstu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ studentId })
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
