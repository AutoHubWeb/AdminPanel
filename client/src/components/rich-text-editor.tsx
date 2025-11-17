import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, List, RotateCcw } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Initialize the editor with the value
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ""
    }
  }, [value])

  // Clean up empty elements before unmounting
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        // Clean up any remaining empty list elements
        editorRef.current.innerHTML = editorRef.current.innerHTML
          .replace(/<ul><li><\/li><\/ul>/g, '')
          .replace(/<ul><li><br><\/li><\/ul>/g, '')
          .trim();
      }
    };
  }, [])

  const handleInput = () => {
    if (editorRef.current) {
      // Clean up empty list elements and normalize content
      let content = editorRef.current.innerHTML;
      
      // Remove completely empty lists
      content = content.replace(/<ul><li><\/li><\/ul>/g, '');
      
      // Remove lists with only line breaks
      content = content.replace(/<ul><li><br\s*\/><\/li><\/ul>/g, '');
      content = content.replace(/<ul><li><br><\/li><\/ul>/g, '');
      
      // Remove consecutive empty lists
      content = content.replace(/(<ul><li><\/li><\/ul>\s*)+/g, '<ul><li><\/li><\/ul>');
      
      // Remove any remaining standalone list items without parent ul
      content = content.replace(/<li[^>]*>[^<]*<\/li>/g, '');
      
      // Normalize whitespace
      content = content.replace(/\s+/g, ' ').trim();
      
      onChange(content);
    }
  }

  const executeCommand = (command: string, value: string = "") => {
    // Make sure the editor is focused
    if (editorRef.current) {
      editorRef.current.focus();
      // Add a small delay to ensure focus is properly set
      setTimeout(() => {
        document.execCommand(command, false, value);
        handleInput();
      }, 10);
    } else {
      document.execCommand(command, false, value);
      handleInput();
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter key for line breaks
    if (e.key === "Enter") {
      e.preventDefault()
      document.execCommand("insertHTML", false, "<br><br>")
    }
    
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
        case 'B':
          e.preventDefault();
          executeCommand("bold");
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          executeCommand("italic");
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          executeCommand("underline");
          break;
      }
    }
  }

  const clearFormatting = () => {
    if (editorRef.current) {
      // Get the text content without HTML formatting
      const textContent = editorRef.current.innerText;
      // Set the innerHTML to plain text, which will remove all formatting including lists
      editorRef.current.innerHTML = textContent;
      handleInput();
    }
  }

  return (
    <div className="border rounded-md">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("bold")}
          title="Bold (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("italic")}
          title="Italic"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => executeCommand("underline")}
          title="Underline"
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="border-l h-6 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            // Check if there's selected text
            const selection = window.getSelection();
            if (selection && selection.toString()) {
              // If text is selected, convert it to a list
              executeCommand("insertUnorderedList");
            } else {
              // If no text is selected, insert a new list item
              executeCommand("insertHTML", "<ul><li><br></li></ul>");
            }
          }}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearFormatting}
          title="Clear Formatting"
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[120px] p-3 focus:outline-none"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ 
          minHeight: "120px",
          outline: isFocused ? "2px solid hsl(var(--ring))" : "none",
          borderRadius: "0.375rem"
        }}
        data-placeholder={placeholder}
      />
    </div>
  )
}
