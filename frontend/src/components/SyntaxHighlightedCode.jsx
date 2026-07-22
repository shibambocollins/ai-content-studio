const highlight = (codeStr) => {
  if (!codeStr) return '';
  return codeStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Strings
    .replace(/("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`(?:\\`|[^`])*`)/g, '<span style="color: #16a34a;">$1</span>')
    // Keywords
    .replace(
      /\b(const|let|var|function|return|if|else|for|while|import|from|export|default|class|extends|new|async|await|try|catch|switch|case|break|typeof|instanceof)\b/g,
      '<span style="color: #2563eb; font-weight: 600;">$1</span>'
    )
    // Booleans and Null
    .replace(/\b(true|false|null|undefined)\b/g, '<span style="color: #9333ea; font-weight: 600;">$1</span>')
    // Numbers
    .replace(/\b(\d+)\b/g, '<span style="color: #ea580c;">$1</span>')
    // Comments
    .replace(/(\/\/.*|\/\*[\s\S]*?\*\/)/g, '<span style="color: #9ca3af; font-style: italic;">$1</span>')
    // Classes/Components
    .replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span style="color: #7c3aed;">$1</span>');
};

export const SyntaxHighlightedCode = ({ code }) => (
  <pre className="whitespace-pre-wrap font-mono leading-relaxed text-gray-800 text-[13px] bg-gray-50/50 p-4 rounded-lg border border-gray-100 overflow-x-auto">
    <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
  </pre>
);
