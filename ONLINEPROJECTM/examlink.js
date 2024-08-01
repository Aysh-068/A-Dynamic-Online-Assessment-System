function redirectToExamLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const examLink = urlParams.get('examLink');
    if (examLink) {
      window.location.href = examLink; // Redirect to exam link from query parameter
    } else {
      alert('Missing exam link in the URL.'); // Handle missing link
    }
  }