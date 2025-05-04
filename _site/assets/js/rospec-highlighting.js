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
          'provides consumes';
        
        const ROSPEC_KEYWORDS = 
          'node type plugin type policy rules attach to message service action ' +
          'qos policy frame link hierarchy alias field from nodelet instance ' +
          'expects system ensures and or optional topic param where response ' +
          'request feedback remaps external verify plugin';
        
        const SPECIAL_KEYWORDS = 
          'exists count content eventually always tag qos in out context ' +
          'childs parents';
        
        const TYPES = 
          'int float double bool string int8 int16 int32 int64 uint8 uint16 ' +
          'uint32 uint64';
        
        return {
          name: 'rospec',
          case_insensitive: false,
          keywords: {
            keyword: ROSPEC_KEYWORDS,
            built_in: CONNECTION_KEYWORDS,
            literal: 'true false',
            type: TYPES,
            meta: SPECIAL_KEYWORDS
          },
          contains: [
            hljs.C_LINE_COMMENT_MODE,
            hljs.QUOTE_STRING_MODE,
            hljs.APOS_STRING_MODE,
            hljs.C_NUMBER_MODE,
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
              begin: /[{}:;=]/
            }
          ]
        };
      });
      
      // Find and highlight all rospec code blocks
      document.querySelectorAll('pre code.language-rospec, code.rospec-code').forEach(function(block) {
        hljs.highlightElement(block);
      });
    }
  });