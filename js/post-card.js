$(function() {
  $('.post-item-card').click(function(e) {
    window.location.href = $(this).attr('post-path');
  });
})
