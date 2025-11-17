import { useEffect, useRef } from "react"

interface SafeHtmlProps {
  html: string
  className?: string
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Clean the HTML to prevent XSS attacks
      const cleanHtml = html
        .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
        .replace(/onclick=["'][^"']*["']/gi, "") // Remove onclick attributes
        .replace(/onerror=["'][^"']*["']/gi, "") // Remove onerror attributes
        .replace(/javascript:/gi, "") // Remove javascript: links
      
      containerRef.current.innerHTML = cleanHtml
    }
  }, [html])

  return <div ref={containerRef} className={className} />
}
