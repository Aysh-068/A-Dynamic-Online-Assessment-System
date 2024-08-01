document.addEventListener('DOMContentLoaded', () => {
  // Fetch exam names
  fetch('/api/get-examnames')
    .then(response => response.json())
    .then(examNames => {
      displayExamNames(examNames);
    })
    .catch(error => {
      console.error('Error fetching exam names:', error);
      displayError('Error fetching exam names');
    });

  // Function to display exam names
  function displayExamNames(examNames) {
    const examsContainer = document.getElementById('examsContainer');
    examsContainer.innerHTML = '';

    examNames.forEach(exam => {
      const examButton = document.createElement('button');
      examButton.classList.add('exam-button');
      examButton.textContent = `Exam: ${exam.examname}`;
      examButton.addEventListener('click', () => {
        fetchStudents(exam.examname);
      });
      examsContainer.appendChild(examButton);
    });
  }

  // Function to fetch and display students of a selected exam
  function fetchStudents(examname) {
    fetch(`/api/get-students-by-exam/${examname}`)
      .then(response => response.json())
      .then(students => {
        displayStudents(students);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
        displayError('Error fetching students');
      });
  }

  // Function to display students in a table
  function displayStudents(students) {
    const studentsContainer = document.getElementById('studentsContainer');
    studentsContainer.innerHTML = '';

    if (students.length === 0) {
      studentsContainer.textContent = 'No students found for this exam.';
      return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = ['Student ID', 'Student Name', 'Total Marks Scored', 'Eligibility'];
    const trHead = document.createElement('tr');
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    students.forEach(student => {
      const trBody = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.textContent = student.std_id;
      trBody.appendChild(tdId);

      const tdName = document.createElement('td');
      tdName.textContent = student.stname;
      trBody.appendChild(tdName);

      const tdMarks = document.createElement('td');
      tdMarks.textContent = student.total_marks; // Use total_marks here
      trBody.appendChild(tdMarks);

      const tdEligibility = document.createElement('td');
      tdEligibility.textContent = student.total_marks >= 25 ? 'Pass' : 'Fail'; // Use total_marks here
      trBody.appendChild(tdEligibility);

      tbody.appendChild(trBody);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    studentsContainer.appendChild(table);
  }

  // Function to display error messages
  function displayError(message) {
    const errorContainer = document.getElementById('errorContainer');
    errorContainer.textContent = message;
  }
});
