
import React from 'react';
import { marked } from 'marked'; // Ensure 'marked' is installed via npm/yarn if not using CDN

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Basic setup for marked - extend as needed
marked.setOptions({
  breaks: true, // Add <br> on single line breaks
  gfm: true,    // Enable GitHub Flavored Markdown
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  // Sanitize HTML output if 'marked' doesn't do it sufficiently or if user input is directly rendered.
  // For AI-generated content, basic sanitization is usually fine.
  // A more robust solution might use DOMPurify on the output of marked(content).
  const rawMarkup = marked.parse(content);

  // A simple check to prevent script injection, though 'marked' typically handles this.
  // For production, consider a dedicated HTML sanitizer library.
  const sanitizedMarkup = typeof rawMarkup === 'string' ? rawMarkup.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') : '';


  return (
    <div
      className={`prose prose-sm sm:prose-base max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
    />
  );
};

export default MarkdownRenderer;
