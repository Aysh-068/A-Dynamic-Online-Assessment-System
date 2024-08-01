document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const facultyDept = document.getElementById('facultyDept').value;
  
    fetch('/searchfacbydept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ dept: facultyDept })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        document.getElementById('searchResults').innerHTML = `<p>${data.error}</p>`;
      } else {
        const tableHtml = `
          <table>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Email</th>
            </tr>
            ${data.map(faculty => `
              <tr>
                <td>${faculty.facname}</td>
                <td>${faculty.fdept}</td>
                <td>${faculty.femail}</td>
              </tr>
            `).join('')}
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
  