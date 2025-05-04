/**
 * Additional fixes specifically for the rospec code inside details tags
 * This addresses special cases in the evaluation page
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the main highlighter to finish
    setTimeout(function() {
      // Target all rospec code blocks in details tags
      document.querySelectorAll('details pre code.rospec-code, details pre code.language-rospec').forEach(function(block) {
        const html = block.innerHTML;
        
        // Fix variable names that weren't caught by the main highlighter
        let updatedHtml = html
          // Fix @qos annotations
          .replace(/@(\w+)({[^}]+})?/g, '<span class="hljs-meta">@$1</span>$2')
          
          // Fix content() function
          .replace(/(content)\(([^)]+)\)/g, '<span class="hljs-meta">$1</span>(<span class="hljs-variable">$2</span>)')
          
          // Fix count() function
          .replace(/(count)\(([^)]+)\)/g, '<span class="hljs-meta">$1</span>(<span class="hljs-variable">$2</span>)')
          
          // Fix variable names not caught earlier
          .replace(/\b([a-z][a-zA-Z0-9_]+)(?=\s*=|\s*:)/g, '<span class="hljs-variable">$1</span>')
          
          // Fix parameter names
          .replace(/param\s+([a-z][a-zA-Z0-9_]+)/g, 'param <span class="hljs-variable">$1</span>');
        
        block.innerHTML = updatedHtml;
      });
    }, 500); // Wait 500ms to ensure the main highlighter has run
  });