#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CLOUD_DIR = path.join(__dirname, '..', 'cloud');

function fixImports(content) {
  let fixed = content;
  
  // Find all import statements that are in the middle of the document
  const importRegex = /\n(import\s+(?:Tabs|TabItem)[^\n]+\n)+/g;
  const imports = [];
  
  // Collect all imports
  fixed = fixed.replace(importRegex, (match) => {
    imports.push(match.trim());
    return '\n';
  });
  
  // If we found imports, add them after the frontmatter
  if (imports.length > 0) {
    const uniqueImports = [...new Set(imports)];
    const importBlock = '\n' + uniqueImports.join('\n') + '\n';
    
    // Find the end of frontmatter
    const frontmatterEnd = fixed.indexOf('---', fixed.indexOf('---') + 1);
    if (frontmatterEnd !== -1) {
      fixed = fixed.slice(0, frontmatterEnd + 3) + importBlock + fixed.slice(frontmatterEnd + 3);
    }
  }
  
  return fixed;
}

function fixCodeTags(content) {
  // Fix multi-line code tags that span lines (convert to backticks)
  let fixed = content;
  
  // Match <code>content</code> that might have the closing tag on a different position
  fixed = fixed.replace(/<code>([^<]+)<\/code>/g, '`$1`');
  
  // Also remove stray <strong> tags that might cause issues
  fixed = fixed.replace(/<strong>([^<]+)<\/strong>/g, '**$1**');
  
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
      let fixed = fixImports(content);
      fixed = fixCodeTags(fixed);
      
      if (fixed !== content) {
        fs.writeFileSync(fullPath, fixed, 'utf8');
        console.log('Fixed imports in:', fullPath);
      }
    }
  }
}

console.log('Fixing imports and code tags...');
processDirectory(CLOUD_DIR);
console.log('Done!');
