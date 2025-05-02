document.addEventListener('DOMContentLoaded', function() {
    // Find all rospec code elements
    const rospecCodeBlocks = document.querySelectorAll('code.rospec-code');
    
    // Process each code block
    rospecCodeBlocks.forEach(function(codeBlock) {
        const code = codeBlock.textContent;
        let highlightedCode = code;
        
        // Replace keywords with spans containing the appropriate classes
        // Connection keywords
        highlightedCode = highlightedCode.replace(/\b(subscribers|subscribes to|publishes to|broadcasts|listens|dynamic|broadcast|listen|static|publishers|remaps|provides|consumes)\b/g, '<span class="cm-connection-keyword">$1</span>');
        
        // Rospec keywords
        highlightedCode = highlightedCode.replace(/\b(node|type|plugin|policy|system|instance|where|param|optional|context)\b/g, '<span class="cm-rospec-keyword">$1</span>');
        
        // Special keywords
        highlightedCode = highlightedCode.replace(/\b(exists|count|content|eventually|always|tag|qos|in|out)\b/g, '<span class="cm-special-keyword">$1</span>');
        highlightedCode = highlightedCode.replace(/@\w+/g, '<span class="cm-special-keyword">$&</span>');
        
        // Types
        highlightedCode = highlightedCode.replace(/\b(int|float|double|bool|string)\b/g, '<span class="cm-ttype">$1</span>');
        highlightedCode = highlightedCode.replace(/\b([a-z0-9_]+\/[a-zA-Z0-9_]*[A-Z][a-zA-Z0-9_\/]*)\b/g, '<span class="cm-ttype">$1</span>');
        highlightedCode = highlightedCode.replace(/\b([A-Z][a-zA-Z0-9_]+)\b/g, '<span class="cm-ttype">$1</span>');
        
        // Boolean values
        highlightedCode = highlightedCode.replace(/\b(true|false)\b/g, '<span class="cm-number">$1</span>');
        
        // Numbers
        highlightedCode = highlightedCode.replace(/\b\d+\b/g, '<span class="cm-number">$1</span>');
        
        // Comments
        highlightedCode = highlightedCode.replace(/(#.*)$/gm, '<span class="cm-rospec-comment">$1</span>');
        
        // Set the highlighted code
        codeBlock.innerHTML = highlightedCode;
    });
});