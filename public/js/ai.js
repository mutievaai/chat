// public/js/ai.js
$(document).ready(function() {
  $('#ai-form').on('submit', function(event) {
    event.preventDefault();
    
    const userInput = $('#user-input').val();
    
    $.ajax({
      type: 'POST',
      url: '/process-ai-request',
      data: JSON.stringify({ userInput: userInput }),
      contentType: 'application/json',
      success: function(response) {
        if (response.success) {
          $('#ai-response').html('<p>' + response.generateResponse + '</p>');
        } else {
          console.error("Error from server:", response.error);
          $('#ai-response').html('<p>Error generating lyrics. Please try again.</p>');
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error("AJAX error:", textStatus, errorThrown);
        $('#ai-response').html('<p>Error generating lyrics. Please try again.</p>');
      }
    });
  });
});
