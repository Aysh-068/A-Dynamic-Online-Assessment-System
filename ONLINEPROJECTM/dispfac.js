document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/displayfaculties')
      .then(response => response.json())
      .then(data => {
        const tableBody = document.getElementById('facultyTable').getElementsByTagName('tbody')[0];
        data.forEach(faculty => {
          const row = tableBody.insertRow();
          row.insertCell(0).textContent = faculty.faculty_id;
          row.insertCell(1).textContent = faculty.facname;
          row.insertCell(2).textContent = faculty.femail;
          row.insertCell(3).textContent = faculty.fdept;
        });
      })
      .catch(error => console.error('Error fetching faculty data:', error));
  });
  