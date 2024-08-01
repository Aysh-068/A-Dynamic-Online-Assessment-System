function handleCourseCreation() {
    $('#createCourseForm').submit(function(event) {
        event.preventDefault(); // Prevent default form submission behavior

        // Serialize form data
        const formData = $(this).serialize();

        // Submit form data using AJAX
        $.ajax({
            type: 'POST',
            url: '/course_create',
            data: formData,
            success: function(response) {
                // After successful course creation, reload the courses
                displayCoursesForAuthenticatedFaculty();
            },
            error: function(error) {
                console.error('Error creating course:', error);
                // Optionally, display an error message to the user
            }
        });
    });
}

// Call handleCourseCreation function when document is ready
$(document).ready(function() {
    handleCourseCreation();
    displayCoursesForAuthenticatedFaculty(); // Display courses on page load
});

// Function to fetch and display courses for the authenticated faculty
function displayCoursesForAuthenticatedFaculty() {
    const urlParams = new URLSearchParams(window.location.search);
    const facultyId = urlParams.get('facultyId');

    // Fetch courses from the server using the authenticated faculty ID
    fetch(`/courses?facultyId=${facultyId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            return response.json();
        })
        .then(courses => {
            const courseListElement = $("#coursesContainer");

            // Clear the existing content of courseListElement
            courseListElement.empty();
            courses.forEach(course => {
                const courseItem = $("<div class='class-card border p-3'></div>");
                courseItem.html(`
                    <h2 style='font-weight: bold; font-size: larger;'>Course name: ${course.coursename}</h2>
                    <p style='font-weight: bold; font-size: smaller;'>Course ID: ${course.course_id}</p>
                    <button class='btn btn-custom'>Click Here</button>
                `);
                courseItem.find('button').click(function() {
                    // Redirect to 'Fhome.html' with facultyId when the button is clicked
                    window.location.href = `Fhome.html?facultyId=${facultyId}`;
                });
                courseListElement.append(courseItem);
            });
            
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            // Optionally, display an error message to the user
        });
}
