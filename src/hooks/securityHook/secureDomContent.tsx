export const sanitizeHtmlForReactNative = (dirtyHtml: string = ""): string => {
    return dirtyHtml
      // Remove script, iframe, embed, object, etc.
      .replace(/<(script|iframe|object|embed)[^>]*?>[\s\S]*?<\/\1>/gi, '')
      // Remove event handlers like onclick, onerror, etc.
      .replace(/\s*on\w+="[^"]*"/gi, '')
      .replace(/\s*on\w+='[^']*'/gi, '')
      // Remove javascript: links
      .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
      // Remove inline styles (optional)
      .replace(/\sstyle="[^"]*"/gi, '')
      .replace(/\sstyle='[^']*'/gi, '');
  };