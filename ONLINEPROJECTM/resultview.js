document.getElementById('resultForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  
  const studentId = document.getElementById('studentId').value;
  const semester = document.getElementById('semester').value;

  const response = await fetch(`/results?studentId=${studentId}&semester=${semester}`);
  const data = await response.json();

  let resultsContainer = document.getElementById('results');

  if (!data.examTaken) {
      resultsContainer.innerHTML = data.message || 'No results found.';
      return;
  }

  let correctAnswers = 0;
  let wrongAnswers = 0;

  data.results.forEach(result => {
      if (result.markscored === 1) correctAnswers++;
      else wrongAnswers++;
  });

  let totalMarks = correctAnswers;
  let eligibility = totalMarks >= 25 ? 'Pass' : 'Fail';
  let eligibilityClass = totalMarks >= 25 ? 'pass' : 'fail';

  resultsContainer.innerHTML = `<p>Total Correct Answers: ${correctAnswers}</p>
                                <p>Total Wrong Answers: ${wrongAnswers}</p>
                                <p>Total Marks Scored: ${totalMarks}</p>
                                <p class="eligibility ${eligibilityClass}">Eligibility: ${eligibility}</p>`;
});
