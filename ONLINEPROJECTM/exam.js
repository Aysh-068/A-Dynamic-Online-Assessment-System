const urlParams = new URLSearchParams(window.location.search);
const duration = urlParams.get('duration');
const questionNumbers = urlParams.get('questionNumbers');
const facultyid = urlParams.get('facultyid'); 
const examname = urlParams.get('examname');// Get the faculty ID from the URL

// Function to format time in minutes and seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Variables for timer
let timerInterval;
let remainingSeconds = parseInt(duration) * 60; // Convert duration to seconds
let userAnswers = []; // Define userAnswers in the global scope

// Update timer display on the page
function updateTimerDisplay() {
  const timerElement = document.getElementById('timer');
  timerElement.textContent = formatTime(remainingSeconds);
  remainingSeconds--;

  // Display warning box when timer reaches 00:00
  if (remainingSeconds === 0) {
    displayTimeUpWarning();
    lockPage();
    //handleTimerCompletion();
  }
}

// Function to display a warning box when time is up
function displayTimeUpWarning() {
  clearInterval(timerInterval); // Stop timer

  const warningBox = document.createElement('div');
  warningBox.classList.add('warning-box');
  warningBox.textContent = 'Time Up! Exam has ended. Please submit your answers.';

  // Create and add "Submit" button
  const submitButton = document.createElement('button');
  submitButton.textContent = 'Submit';
  submitButton.addEventListener('click', function() {
    handleTimerCompletion();
  });
  warningBox.appendChild(submitButton);

  document.body.appendChild(warningBox);
}

// Function to lock the exam page
function lockPage() {
  // Disable all radio buttons
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach(radioButton => radioButton.disabled = true);

  // Disable submit button
  const submitButton = document.getElementById('submitBtn');
  submitButton.disabled = true;
}

// Function to handle timer completion
function handleTimerCompletion() {
  clearInterval(timerInterval);
  console.log('Exam time is up! Submitting your answers...');
  sendUserAnswersToServer();  // Submit answers on timer expiration
}

// Handle student info form submission
document.getElementById('studentInfoForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission behavior

  const studentId = document.getElementById('studentId').value;
  const studentClass = document.getElementById('class').value;

  if (studentId && studentClass) {
    // Check if the student has already taken the exam
    fetch(`/api/check-exam-result?studentId=${studentId}&studentClass=${studentClass}&examname=${examname}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.examTaken) {
          // Display warning if the exam has already been taken
          const warningBox = document.createElement('div');
          warningBox.classList.add('warning-box');
          warningBox.textContent = 'You have already attended the exam.';
          document.body.appendChild(warningBox);
        } else {
          // Hide the student info form and show the exam container
          document.getElementById('studentInfoContainer').style.display = 'none';
          document.getElementById('examContainer').style.display = 'block';

          // Make API call to fetch questions
          fetch(`/api/questions?questionNumbers=${questionNumbers}&facultyid=${facultyid}`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.json();
            })
            .then(questions => {
              // Display questions with options
              displayQuestions(questions);

              // Start timer
              timerInterval = setInterval(updateTimerDisplay, 1000); // Update timer every second
            })
            .catch(error => {
              console.error('Error fetching questions:', error);
              // Handle error
            });
        }
      })
      .catch(error => {
        console.error('Error checking exam status:', error);
        // Handle error
      });
  } else {
    alert('Please provide both Student ID and Class.');
  }
});

function displayQuestions(questions) {
  const questionsContainer = document.getElementById('questionsContainer');
  userAnswers = []; // Initialize userAnswers

  // Shuffle the questions (assuming shuffleArray exists)
  questions = shuffleArray(questions);
  
  // Clear previous questions if any
  questionsContainer.innerHTML = '';

  // Iterate over shuffled questions and create HTML elements
  questions.forEach((question, index) => {
    const questionElement = document.createElement('div');
    questionElement.classList.add('question');

    const questionText = document.createElement('p');
    questionText.textContent = `Question ${index + 1}: ${question.qstn}`;
    questionElement.appendChild(questionText);

    for (let i = 1; i <= 4; i++) {
      const optionLabel = document.createElement('label');
      const optionInput = document.createElement('input');
      optionInput.type = 'radio';
      optionInput.name = `answer${index}`; // Use index for radio button name
      optionInput.value = question[`op${i}`];

      optionInput.addEventListener('change', () => {
        if (optionInput.checked) {
          userAnswers[index].selectedOption = i;
          console.log(`Question ID: ${question.qstn_id}, Selected Option: ${i}`);
        }
      });

      optionLabel.appendChild(optionInput);
      optionLabel.appendChild(document.createTextNode(question[`op${i}`]));
      questionElement.appendChild(optionLabel);
      questionElement.appendChild(document.createElement('br'));
    }

    questionsContainer.appendChild(questionElement);

    // Create and add an object to userAnswers for this question
    userAnswers.push({ qstn_id: question.qstn_id, selectedOption: null }); // Add qstn_id and initialize selectedOption
  });

  document.getElementById('examForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission behavior
    sendUserAnswersToServer(); // Send user answers to server
  });

  updateTimerDisplay();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sendUserAnswersToServer() {
  const studentId = document.getElementById('studentId').value;
  const studentClass = document.getElementById('class').value;
  // Fetch facultyid from URL
  const urlParams = new URLSearchParams(window.location.search);
  const facultyid = urlParams.get('facultyid');

  fetch('/api/submit-user-answers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userAnswers, studentId, studentClass, facultyid, examname })
  })
  .then(response => response.json())
  .then(data => {
    console.log('User answers submitted successfully:', data);
    displaySubmissionSuccess();
    lockPage();
    clearInterval(timerInterval);
    window.location.href = 'final.html';  // Redirect to final page after submission
  })
  .catch(error => {
    console.error('Error submitting user answers:', error);
    alert('An error occurred while submitting the exam. Please try again.');
  });
}

function displaySubmissionSuccess() {
  const successWindow = document.createElement('div');
  successWindow.classList.add('success-window');
  successWindow.textContent = 'Exam Submitted Successfully!';
  document.body.appendChild(successWindow);
}
