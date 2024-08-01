document.getElementById('examInputForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const facultyid = document.getElementById('facultyid').value;
  const examname = document.getElementById('examname').value;
  const duration = document.getElementById('duration').value;
  const questionNumbers = document.getElementById('questionNumbers').value;

  // Make API call to fetch questions and validate faculty ID
  fetch(`/api/questions?questionNumbers=${questionNumbers}&facultyid=${facultyid}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid faculty ID or error fetching questions');
      }
      return response.json();
    })
    .then(questions => {
      // Check if questions exist for the specified faculty and question numbers
      if (questions.error) {
        throw new Error(questions.error);
      }

      // Shuffle the array of questions
      questions = shuffleArray(questions);

      // Proceed with exam setup and submission
      const examData = {
        duration,
        examname,
        questions
      };

      fetch('/api/submit-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(examData)
      })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        // Handle exam submission response if needed

        // Construct the link with duration, question numbers, faculty ID, and exam name
        const baseUrl = window.location.origin;
        const examLink = `${baseUrl}/exam.html?duration=${duration}&questionNumbers=${questionNumbers}&facultyid=${facultyid}&examname=${encodeURIComponent(examname)}`;

        // Display the generated link
        const generatedLinkContainer = document.getElementById('generatedLinkContainer');
        const generatedLinkElement = document.getElementById('generatedLink');
        generatedLinkElement.textContent = examLink;
        generatedLinkContainer.style.display = 'block';
      })
      .catch(error => {
        console.error('Error submitting exam:', error);
        // Handle error
      });
    })
    .catch(error => {
      console.error('Error fetching questions:', error);
      alert(error.message);
    });
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function shareLink() {
  const generatedLinkElement = document.getElementById('generatedLink');
  if (generatedLinkElement) {
    const generatedLink = generatedLinkElement.textContent;

    if (navigator.share) {
      navigator.share({
        title: 'Exam Link',
        text: 'Here is the link to the exam:',
        url: generatedLink
      }).then(() => {
        console.log('Link shared successfully');
      }).catch((error) => {
        console.error('Error sharing link:', error);
      });
    } else {
      alert('Web Share API is not supported in your browser. Please copy the link manually.');
    }
  } else {
    console.error('Generated link element not found.');
  }
}
