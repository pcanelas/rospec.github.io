/**
 * Simple, reliable toggle functionality for specifications
 */
document.addEventListener('DOMContentLoaded', function() {
    // Get all toggle buttons
    var buttons = document.querySelectorAll('.spec-toggle');
    
    // Add click event to each button
    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        // Get the specification ID from the data attribute
        var specId = this.getAttribute('data-spec-id');
        var specRow = document.getElementById('spec-' + specId);
        
        // Check if the row is visible
        if (window.getComputedStyle(specRow).display === 'table-row') {
          // If visible, hide it
          specRow.style.display = 'none';
          this.textContent = 'Show Specification';
          this.classList.remove('active');
        } else {
          // First, hide all specification rows
          var allRows = document.querySelectorAll('.spec-row');
          allRows.forEach(function(row) {
            row.style.display = 'none';
          });
          
          // Reset all buttons
          var allButtons = document.querySelectorAll('.spec-toggle');
          allButtons.forEach(function(btn) {
            btn.textContent = 'Show Specification';
            btn.classList.remove('active');
          });
          
          // Then show this row
          specRow.style.display = 'table-row';
          this.textContent = 'Hide Specification';
          this.classList.add('active');
        }
      });
    });
  });