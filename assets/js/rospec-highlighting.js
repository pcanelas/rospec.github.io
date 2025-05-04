/**
 * Custom syntax highlighting for rospec code blocks
 */
document.addEventListener('DOMContentLoaded', function() {
    // Define the rospec language for highlight.js
    if (window.hljs) {
      // Define rospec language grammar
      window.hljs.registerLanguage('rospec', function(hljs) {
        const CONNECTION_KEYWORDS = 
          'subscribers subscribes to publishes to broadcasts listens dynamic ' +
          'broadcast listen static publishers remapping to calls service ' +
          'provides consumes subscribes';
        
        const ROSPEC_KEYWORDS = 
          'node plugin policy rules attach message service action ' +
          'qos frame link hierarchy field from nodelet instance ' +
          'expects system ensures and or optional topic param where response ' +
          'request feedback remaps external verify setting type alias context';
        
        const SPECIAL_KEYWORDS = 
          'exists count content eventually always tag qos in out ' +
          'childs parents default';
        
        const TYPES = 
          'int float double bool string int8 int16 int32 int64 uint8 uint16 ' +
          'uint32 uint64 Natural Hertz';
        
        return {
          name: 'rospec',
          case_insensitive: false,
          keywords: {
            keyword: ROSPEC_KEYWORDS,
            built_in: CONNECTION_KEYWORDS,
            literal: 'true false KeepLast',
            type: TYPES,
            meta: SPECIAL_KEYWORDS
          },
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            hljs.C_NUMBER_MODE,
            {
              // Match variable names with namespaces
              className: 'variable',
              begin: /\b[a-z][a-zA-Z0-9_\/]*(?=\s*[=])/
            },
            {
              // Match decorators starting with @
              className: 'meta',
              begin: /@[a-zA-Z0-9_]+/,
              end: /({[^}]*})?/,
              starts: {
                end: /\s/,
                returnEnd: true
              }
            },
            {
              className: 'class',
              // Match ROS message types like std_msgs/String
              begin: /\b([a-z0-9_]+\/[a-zA-Z0-9_]*[A-Z][a-zA-Z0-9_\/]*)\b/
            },
            // Other capitalized types
            {
              className: 'class',
              begin: /\b([A-Z][a-zA-Z0-9_]+)\b/
            },
            // Operator
            {
              className: 'operator',
              begin: /[{}:;=<>!]/
            }
          ]
        };
      });
      
      // Find and highlight all rospec code blocks
      document.querySelectorAll('pre code.language-rospec, code.rospec-code').forEach(function(block) {
        hljs.highlightElement(block);
        
        // Apply additional custom styling after highlighting
        // This helps with dynamic variable highlighting that hljs might miss
        let content = block.innerHTML;
        
        // Highlight underscore as variable
        content = content.replace(/\b(_)\b/g, '<span class="hljs-variable">$1</span>');
        
        // Replace @ decorator syntax - only color the @name part
        content = content.replace(/@([a-zA-Z0-9_]+)({[^}]*})?/g, 
          '<span class="hljs-meta">@$1</span>$2');
        
        // Make sure "count" and "content" and "publishers" are highlighted as special keywords
        content = content.replace(
          /\b(content|count|publishers|default)\b(?!\s*\()/g, 
          '<span class="hljs-meta">$1</span>'
        );
        
        // Make sure function calls "content()", "count()" and "publishers()" have the right styling
        content = content.replace(
          /\b(content|count|publishers)\s*\(/g,
          '<span class="hljs-meta">$1</span>('
        );
        
        // Better highlight variable names after param
        content = content.replace(
          /(<span class="hljs-keyword">param<\/span>\s+)([a-zA-Z0-9_\/]+)/g, 
          '$1<span class="hljs-variable">$2</span>'
        );
        
        // Highlight variables after context
        content = content.replace(
          /(<span class="hljs-meta">context<\/span>\s+)([a-zA-Z0-9_\/]+)/g, 
          '$1<span class="hljs-variable">$2</span>'
        );
        
        // Highlight variables after field
        content = content.replace(
          /(<span class="hljs-keyword">field<\/span>\s+)([a-zA-Z0-9_\/]+)/g, 
          '$1<span class="hljs-variable">$2</span>'
        );
        
        // Highlight variable names with namespaces after type
        content = content.replace(
          /(<span class="hljs-keyword">type<\/span>\s+)([a-zA-Z0-9_\/]+)/g, 
          '$1<span class="hljs-variable">$2</span>'
        );
        
        // Highlight variable names after "node type"
        content = content.replace(
          /(<span class="hljs-keyword">node<\/span>\s+<span class="hljs-keyword">type<\/span>\s+)([a-zA-Z0-9_\/]+)/g, 
          '$1<span class="hljs-variable">$2</span>'
        );
        
        // More generalized highlighting for variable names - match any
        // variable-looking identifiers that aren't already highlighted
        content = content.replace(
          /\b([a-z][a-zA-Z0-9_]+)(?![^<]*>|[^<>]*<\/)/g, 
          function(match, p1) {
            // Skip if it's a keyword or already highlighted
            if (/keyword|meta|type|class|variable|built_in|literal/.test(match)) {
              return match;
            }
            // Skip certain patterns
            if (/\b(to|where|node|type|param|context|field|optional|double|bool|string|int|float)\b/.test(p1)) {
              return match;
            }
            return '<span class="hljs-variable">' + p1 + '</span>';
          }
        );
        
        // Fix variable names with namespaces in various contexts
        content = content.replace(
          /([a-zA-Z0-9_]+)\/([a-zA-Z0-9_\/]+)/g,
          function(match, p1, p2) {
            // Don't match if already in a span
            if (match.includes('<span')) return match;
            return '<span class="hljs-variable">' + p1 + '/' + p2 + '</span>';
          }
        );
        
        // Make variables after ":" be colored like types
        content = content.replace(
          /:\s+([a-zA-Z0-9_\/]+)/g,
          function(match, p1) {
            // Don't match if already in a span
            if (match.includes('<span')) return match;
            return ': <span class="hljs-type">' + p1 + '</span>';
          }
        );
        
        // Make true/false the same color as numbers (light blue)
        content = content.replace(
          /<span class="hljs-literal">(true|false)<\/span>/g,
          '<span class="hljs-number">$1</span>'
        );
        
        // Fix "alias" to be bold black like "type", not orange
        content = content.replace(
          /<span class="hljs-meta">alias<\/span>/g,
          '<span class="hljs-keyword">alias</span>'
        );
              
        block.innerHTML = content;
      });
    }
  });