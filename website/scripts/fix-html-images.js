#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CLOUD_DIR = path.join(__dirname, '..', 'cloud');

function fixHtmlImages(content) {
  let fixed = content;
  
  // Make img tags self-closing (JSX requirement)
  // Match <img ... > without trailing /
  fixed = fixed.replace(/<img\s+([^>]*?)(?<!\/)>/gi, '<img $1 />');
  
  // Convert <figure><img .../><figcaption>text</figcaption></figure> to markdown
  // Use a more flexible regex that handles different content in figcaption (including HTML tags)
  fixed = fixed.replace(/<figure><img\s+src="([^"]+)"(?:\s+alt="([^"]*)")?[^>]*?\/?><figcaption>(?:<p>)?([\s\S]*?)(?:<\/p>)?<\/figcaption><\/figure>/gi,
    (match, src, alt, caption) => {
      // Strip HTML tags from caption for alt text
      const cleanCaption = caption.replace(/<[^>]+>/g, '').trim();
      const altText = alt || cleanCaption || 'image';
      const imageSrc = src.replace(/\.\.\/\.gitbook\/assets\//, '/img/cloud/').replace(/\.\.\/\/img\/cloud\//g, '/img/cloud/').replace(/ /g, '%20');
      return `![${altText}](${imageSrc})\n\n*${cleanCaption}*`;
    }
  );
  
  // Convert <figure><img .../></figure> without figcaption
  fixed = fixed.replace(/<figure><img\s+src="([^"]+)"(?:\s+alt="([^"]*)")?[^>]*?\/?><\/figure>/gi,
    (match, src, alt) => {
      const altText = alt || 'image';
      const imageSrc = src.replace(/\.\.\/\.gitbook\/assets\//, '/img/cloud/').replace(/\.\.\/\/img\/cloud\//g, '/img/cloud/').replace(/ /g, '%20');
      return `![${altText}](${imageSrc})`;
    }
  );
  
  // Also convert any remaining .gitbook/assets paths
  fixed = fixed.replace(/\.gitbook\/assets\//g, '/img/cloud/');
  
  // Fix double slashes in paths
  fixed = fixed.replace(/\/\/img\/cloud\//g, '/img/cloud/');
  
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
      const fixed = fixHtmlImages(content);
      
      if (fixed !== content) {
        fs.writeFileSync(fullPath, fixed, 'utf8');
        console.log('Fixed HTML images in:', fullPath);
      }
    }
  }
}

console.log('Fixing HTML image tags...');
processDirectory(CLOUD_DIR);
console.log('Done!');
