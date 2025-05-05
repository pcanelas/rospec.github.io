require 'rouge'

# Only define the lexer if Rouge is available and the lexer isn't already defined
if defined?(Rouge) && !Rouge::Lexers.const_defined?(:Rospec)
  module Rouge
    module Lexers
      class Rospec < RegexLexer
        title "Rospec"
        desc "Domain Specification Language for ROS-based Robot Software"
        
        tag 'rospec'
        filenames '*.rspec', '*.rospec'
        mimetypes 'text/x-rospec'
        
        # Match your existing CodeMirror mode categories
        connection_keywords = %w(
          subscribers subscribes\ to publishes\ to broadcasts listens dynamic 
          broadcast listen static publishers remapping\ to calls\ service 
          provides consumes
        )
        
        rospec_keywords = %w(
          node type plugin\ type policy rules attach\ to message service action 
          qos\ policy frame link hierarchy alias field from nodelet instance 
          expects system ensures and or optional topic param where response 
          request feedback remaps external\ verify plugin
        )
        
        special_keywords = %w(
          exists count content eventually always tag qos in out context 
          childs parents
        )
        
        types = %w(
          int float double bool string int8 int16 int32 int64 uint8 uint16 
          uint32 uint64
        )
        
        state :root do
          rule %r/\s+/m, Text::Whitespace
          rule %r/#.*$/, Comment::Single  # This is the updated line for # comments
          
          # Connection keywords
          rule %r/\b(#{connection_keywords.join('|')})\b/, Keyword::Declaration
          
          # Rospec keywords
          rule %r/\b(#{rospec_keywords.join('|')})\b/, Keyword
          
          # Special keywords
          rule %r/\b(#{special_keywords.join('|')})\b/, Keyword::Pseudo
          rule %r/@\w+/, Keyword::Pseudo
          
          # Types
          rule %r/\b(#{types.join('|')})\b/, Name::Class
          
          # Message types (ROS message types like std_msgs/String)
          rule %r/\b([a-z0-9_]+\/[a-zA-Z0-9_]*[A-Z][a-zA-Z0-9_\/]*)\b/, Name::Class
          
          # Other capitalized types 
          rule %r/\b([A-Z][a-zA-Z0-9_]+)\b/, Name::Class
          
          # Boolean values
          rule %r/\b(true|false)\b/, Keyword::Constant
          
          # Strings
          rule %r/"[^"]*"/, Str::Double
          rule %r/'[^']*'/, Str::Single
          
          # Numbers
          rule %r/\b\d+\.\d+\b/, Num::Float
          rule %r/\b\d+\b/, Num::Integer
          
          # Operators and punctuation
          rule %r/[{}:;=]/, Operator
          
          # Variables
          rule %r/\b([a-zA-Z_0-9]+)\b/, Name::Variable
        end
      end
    end
  end
end