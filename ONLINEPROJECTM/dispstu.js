document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/displaystudents')
      .then(response => response.json())
      .then(data => {
        const tableBody = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
        data.forEach(student => {
          const row = tableBody.insertRow();
          row.insertCell(0).textContent = student.std_id;
          row.insertCell(1).textContent = student.stname;
          row.insertCell(2).textContent = student.stemail;
          row.insertCell(3).textContent = student.stdept;
          row.insertCell(4).textContent = student.stclass;
        
        });
      })
      .catch(error => console.error('Error fetching student data:', error));
  });
  