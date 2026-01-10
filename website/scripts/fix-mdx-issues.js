#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CLOUD_DIR = path.join(__dirname, '..', 'cloud');

function fixMdxIssues(content) {
  let fixed = content;
  
  // Fix <br> tags to be self-closing
  fixed = fixed.replace(/<br>/gi, '<br />');
  
  // Convert <code> tags to markdown backticks
  fixed = fixed.replace(/<code>([^<]*)<\/code>/g, '`$1`');
  
  // Convert <pre><code>...</code></pre> blocks to markdown code blocks
  fixed = fixed.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
    // Remove ** bold markers inside code
    const cleanCode = code.replace(/\*\*/g, '').trim();
    return '```sql\n' + cleanCode + '\n```';
  });
  
  // Remove <div> and </div> tags (they cause MDX issues in markdown context)
  fixed = fixed.replace(/<div[^>]*>/gi, '');
  fixed = fixed.replace(/<\/div>/gi, '');
  
  // Fix relative image paths - convert ../img/cloud/ and similar to /img/cloud/
  fixed = fixed.replace(/\]\(\.\.\/img\/cloud\//g, '](/img/cloud/');
  fixed = fixed.replace(/\]\(\.\.\/\.\.\/img\/cloud\//g, '](/img/cloud/');
  fixed = fixed.replace(/src="\.\.\/img\/cloud\//g, 'src="/img/cloud/');
  
  // Fix relative .gitbook paths that might still exist  
  fixed = fixed.replace(/\]\(\.\.\/\.gitbook\/assets\//g, '](/img/cloud/');
  fixed = fixed.replace(/\]\(\.\.\/\.\.\/\.gitbook\/assets\//g, '](/img/cloud/');
  
  // Remove GitBook step syntax
  fixed = fixed.replace(/\{%\s*step\s*%\}/g, '');
  fixed = fixed.replace(/\{%\s*endstep\s*%\}/g, '');
  fixed = fixed.replace(/\{%\s*stepper\s*%\}/g, '');
  fixed = fixed.replace(/\{%\s*endstepper\s*%\}/g, '');
  
  // Convert <mark> tags to bold (remove color styling)
  fixed = fixed.replace(/<mark[^>]*>([^<]*)<\/mark>/g, '**$1**');
  
  // Fix HTML entities that might cause issues
  fixed = fixed.replace(/&#x20;/g, ' ');
  
  // Make <img> tags self-closing if they aren't
  fixed = fixed.replace(/<img\s+([^>]*?)(?<!\/)>/gi, '<img $1 />');
  
  // Convert {% swagger ... %} blocks (remove them)
  fixed = fixed.replace(/\{%\s*swagger[^%]*%\}[\s\S]*?\{%\s*endswagger\s*%\}/g, '');
  
  // Remove data-size attribute from img tags
  fixed = fixed.replace(/\s+data-size="[^"]*"/gi, '');
  
  // Escape less-than followed by number (e.g., <3 -> &lt;3)
  fixed = fixed.replace(/<(\d)/g, '&lt;$1');
  
  // Escape empty angle brackets <> (union types in SQL docs)
  fixed = fixed.replace(/<>/g, '&lt;&gt;');
  
  return fixed;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const fixed = fixMdxIssues(content);
      
      if (fixed !== content) {
        fs.writeFileSync(fullPath, fixed, 'utf8');
        console.log('Fixed MDX issues in:', fullPath);
      }
    }
  }
}

console.log('Fixing MDX issues...');
processDirectory(CLOUD_DIR);
console.log('Done!');
