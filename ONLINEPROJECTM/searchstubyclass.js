document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const studentClass = document.getElementById('studentClass').value;
  
    fetch('/searchstubyclass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ class: studentClass })
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
              <th>Class</th>
              <th>Email</th>
            </tr>
            ${data.map(student => `
              <tr>
                <td>${student.stname}</td>
                <td>${student.stclass}</td>
                <td>${student.stemail}</td>
              </tr>
            `).join('')}
          </table>
        `;
        document.getElementById('searchResults').innerHTML = tableHtml;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('searchResults').innerHTML = `<p>Error fetching student details. Please try again later.</p>`;
    });
  });
  