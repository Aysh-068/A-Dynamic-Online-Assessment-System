document.addEventListener("DOMContentLoaded", function() {
    fetch('/api/unpublished-exams')
        .then(response => response.json())
        .then(data => {
            const examList = document.getElementById('exam-list');
            data.forEach(exam => {
                const listItem = document.createElement('li');
                listItem.textContent = `Exam: ${exam.examname}`;

                const publishButton = document.createElement('button');
                publishButton.textContent = 'Publish';
                publishButton.addEventListener('click', function() {
                    publishExam(exam.examname, listItem);
                });

                listItem.appendChild(publishButton);
                examList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching exams:', error));
});

function publishExam(examname, listItem) {
    fetch(`/api/publish-course/${examname}`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            listItem.remove(); // Remove the list item directly
            showSuccessMessage(`Results for Exam ${examname} have been published.`);
        } else {
            showErrorMessage(`Error publishing results for Exam ${examname}.`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorMessage(`Failed to publish results for Exam ${examname}.`);
    });
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.classList.add('publish-success');
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('publish-error');
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
