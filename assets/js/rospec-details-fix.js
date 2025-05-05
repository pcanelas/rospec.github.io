/**
 * Fix for rospec highlighting in details/summary elements
 * This script runs after the page is fully loaded
 */
window.addEventListener('load', function() {
  // Helper function to add specific highlighting
  function enhanceRospecHighlighting(element) {
    if (!element) return;
    
    // Check for comments that start with # and add highlighting
    element.innerHTML = element.innerHTML.replace(
      /(#.*)$/gm, 
      '<span class="hljs-comment">$1</span>'
    );
      
    // Add specific highlight classes for context keyword
    element.innerHTML = element.innerHTML.replace(
      /(\bcontext\b)/g, 
      '<span class="hljs-meta">$1</span>'
    );
    
    // Add variable highlighting for variable names after param
    element.innerHTML = element.innerHTML.replace(
      /(\bparam\b\s+)([a-zA-Z][a-zA-Z0-9_\/]*)/g, 
      '$1<span class="hljs-variable">$2</span>'
    );
    
    // Highlight variable names after "type" keyword
    element.innerHTML = element.innerHTML.replace(
      /(\btype\b\s+)([a-zA-Z][a-zA-Z0-9_\/]*)/g, 
      '$1<span class="hljs-variable">$2</span>'
    );
    
    // Highlight variable names after "node type"
    element.innerHTML = element.innerHTML.replace(
      /(\bnode\s+type\s+)([a-zA-Z][a-zA-Z0-9_\/]*)/g, 
      '$1<span class="hljs-variable">$2</span>'
    );
    
    // Highlight @ decorator syntax - only the @name part
    element.innerHTML = element.innerHTML.replace(
      /@([a-zA-Z0-9_]+)({[^}]*})?/g, 
      '<span class="hljs-meta">@$1</span>$2'
    );
    
    // Make sure "count" and "content" and "publishers" are highlighted as special keywords
    element.innerHTML = element.innerHTML.replace(
      /\b(content|count|publishers)\b(?!\s*\()/g, 
      '<span class="hljs-meta">$1</span>'
    );
    
    // Make sure function calls like count() and content() have correct styling
    element.innerHTML = element.innerHTML.replace(
      /\b(count|content|publishers)\s*\(/g, 
      '<span class="hljs-meta">$1</span>('
    );
    
    // Highlight variable names with / in them (namespaces)
    element.innerHTML = element.innerHTML.replace(
      /\b([a-z][a-zA-Z0-9_]*)\/([a-zA-Z0-9_\/]+)\b/g,
      function(match, p1, p2) {
        // Don't match if already in a span
        if (match.includes('<span')) return match;
        return '<span class="hljs-variable">' + p1 + '/' + p2 + '</span>';
      }
    );
    
    // Fix any CSS classes for keywords that should be bold black, not orange
    element.innerHTML = element.innerHTML.replace(
      /<span class="hljs-meta">type<\/span>/g,
      '<span class="hljs-keyword">type</span>'
    );
  }

  // Wait a bit for other scripts to finish
  setTimeout(function() {
    // Find all details tags with rospec code
    const detailsElements = document.querySelectorAll('details pre code.rospec-code, details pre code.language-rospec');
    
    detailsElements.forEach(function(element) {
      enhanceRospecHighlighting(element);
    });
    
    // Also process any non-details rospec code that might need enhancement
    const allRospecCode = document.querySelectorAll('pre code.rospec-code:not(.hljs), pre code.language-rospec:not(.hljs)');
    allRospecCode.forEach(function(element) {
      enhanceRospecHighlighting(element);
    });
  }, 500);
});