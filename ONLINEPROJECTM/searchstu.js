document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const facultyName = document.getElementById('studentName').value;
  
    fetch('/searchstu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: facultyName })
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById('searchResults').innerHTML = `<p>${data.error}</p>`;
      } else {
        const faculty = data[0]; // Assuming you only want to display details of the first faculty found
        const tableHtml = `
          <table>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
            </tr>
            <tr>
              <td>${faculty.stname}</td>
              <td>${faculty.stdept}</td>
              <td>${faculty.stemail}</td>
            </tr>
          </table>
        `;
        document.getElementById('searchResults').innerHTML = tableHtml;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('searchResults').innerHTML = `<p>Error fetching faculty details. Please try again later.</p>`;
    });
  });
  