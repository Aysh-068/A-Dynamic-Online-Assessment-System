$(document).ready(function() {
    // Delete course event
    $('.delete-course').click(function() {
        var courseId = $(this).data('course-id');
        // Send AJAX request to delete the course
        $.ajax({
            url: '/delete-course',
            type: 'POST',
            data: { id: courseId },
            success: function(response) {
                // If deletion is successful, remove the course from the UI
                $('#course-' + courseId).remove();
            },
            error: function(xhr, status, error) {
                console.error(error);
                // Handle error if deletion fails
            }
        });
    });
});
