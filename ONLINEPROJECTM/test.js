// API call to fetch questions
fetch(`/api/questions?questionNumbers=${questionNumbers}`)
  .then(response => response.json())
  .then(questions => {
    // Total number of questions
    const totalQuestions = questions.length;

    // Define variables for pagination
    let currentPage = 1;
    const questionsPerPage = 5;
    let currentQuestions = questions.slice(0, questionsPerPage); // Initial 5 questions

    // Function to display current set of questions
    function displayQuestions() {
      const questionsContainer = document.getElementById('questionsContainer');
      questionsContainer.innerHTML = '';

      currentQuestions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');

        // Create question text element
        const questionText = document.createElement('p');
        questionText.textContent = `Question ${index + 1 + (currentPage - 1) * questionsPerPage}: ${question.qstn}`;
        questionElement.appendChild(questionText);

        // Create options with radio buttons
        for (let i = 1; i <= 4; i++) {
          const optionLabel = document.createElement('label');
          const optionInput = document.createElement('input');
          optionInput.type = 'radio';
          optionInput.name = `answer${index}`; // Use index for radio button name
          optionInput.value = question[`op${i}`];

          // Update userAnswers object on radio button selection
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
      });
    }

    // Function to handle submit button click
    function handleSubmitClick() {
      // Send user answers to server for current page
      sendUserAnswersToServer(userAnswers);

      // Check if there are more questions
      if (currentPage < Math.ceil(totalQuestions / questionsPerPage)) {
        currentPage++;
        currentQuestions = questions.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage);
        displayQuestions();
        // Deactivate submit button and activate next button
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('nextBtn').disabled = false;
      } else {
        // Final page reached, display only submit button
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('nextBtn').style.display = 'none'; // Hide next button
      }
    }

    // Function to handle next button click
    function handleNextClick() {
      currentPage++;
      currentQuestions = questions.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage);
      displayQuestions();
      // Deactivate next button and activate submit button if not on final page
      document.getElementById('nextBtn').disabled = true;
      if (currentPage < Math.ceil(totalQuestions / questionsPerPage)) {
        document.getElementById('submitBtn').disabled = false;
      }
    }