#!/usr/bin/env node

/**
 * Script to convert GitBook markdown syntax to Docusaurus MDX format.
 * 
 * Converts:
 * - {% hint style="..." %} ... {% endhint %} -> Docusaurus admonitions
 * - {% content-ref url="..." %} ... {% endcontent-ref %} -> regular markdown links
 * - <figure><img src="..." alt="..."><figcaption>...</figcaption></figure> -> ![alt](src)
 * - .gitbook/assets/ image paths -> /img/cloud/
 * - README.md files -> index.md (for proper routing)
 * - Frontmatter icon field -> removes it (not supported in Docusaurus)
 */

const fs = require('fs');
const path = require('path');

const CLOUD_DIR = path.join(__dirname, '..', 'cloud');

// Map GitBook hint styles to Docusaurus admonition types
const HINT_TYPE_MAP = {
  'info': 'info',
  'warning': 'warning',
  'danger': 'danger',
  'success': 'tip',
  'tip': 'tip'
};

function convertHints(content) {
  // Convert {% hint style="type" %} ... {% endhint %} to Docusaurus admonitions
  const hintRegex = /\{%\s*hint\s+style="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g;
  
  return content.replace(hintRegex, (match, style, innerContent) => {
    const admonitionType = HINT_TYPE_MAP[style] || 'note';
    const trimmedContent = innerContent.trim();
    return `:::${admonitionType}\n${trimmedContent}\n:::`;
  });
}

function convertContentRefs(content) {
  // Convert {% content-ref url="..." %} ... {% endcontent-ref %} to links
  const contentRefRegex = /\{%\s*content-ref\s+url="([^"]+)"\s*%\}[\s\S]*?\{%\s*endcontent-ref\s*%\}/g;
  
  return content.replace(contentRefRegex, (match, url) => {
    // Convert .md to proper path and README.md to index.md
    let linkPath = url.replace(/README\.md$/, 'index.md').replace(/\.md$/, '');
    const linkText = path.basename(linkPath) || linkPath;
    return `[${linkText}](${linkPath})`;
  });
}

function convertFigures(content) {
  // Convert <figure><img src="..." alt="..."><figcaption>...</figcaption></figure>
  const figureRegex = /<figure><img\s+src="([^"]+)"(?:\s+alt="([^"]*)")?[^>]*>(?:<figcaption>([^<]*)<\/figcaption>)?<\/figure>/g;
  
  return content.replace(figureRegex, (match, src, alt, caption) => {
    const altText = alt || caption || 'image';
    const imageSrc = convertImagePath(src);
    if (caption) {
      return `![${altText}](${imageSrc})\n*${caption}*`;
    }
    return `![${altText}](${imageSrc})`;
  });
}

function convertImagePath(src) {
  // Convert .gitbook/assets/ paths to /img/cloud/
  if (src.startsWith('.gitbook/assets/')) {
    const filename = src.replace('.gitbook/assets/', '');
    // URL encode the filename for spaces and special chars
    return `/img/cloud/${encodeURIComponent(filename)}`;
  }
  if (src.startsWith('<.gitbook/assets/')) {
    const filename = src.replace('<.gitbook/assets/', '').replace('>', '');
    return `/img/cloud/${encodeURIComponent(filename)}`;
  }
  return src;
}

function convertInlineImages(content) {
  // Convert inline image references with .gitbook/assets paths
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  return content.replace(imgRegex, (match, alt, src) => {
    const newSrc = convertImagePath(src);
    return `![${alt}](${newSrc})`;
  });
}

function convertFrontmatter(content) {
  // Remove unsupported frontmatter fields like 'icon'
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  
  return content.replace(frontmatterRegex, (match, frontmatter) => {
    // Remove icon line
    const cleanedFrontmatter = frontmatter
      .split('\n')
      .filter(line => !line.startsWith('icon:'))
      .join('\n');
    
    if (cleanedFrontmatter.trim() === '') {
      return '';
    }
    return `---\n${cleanedFrontmatter}\n---`;
  });
}

function convertTabs(content) {
  // Convert {% tabs %} {% tab title="..." %} ... {% endtab %} {% endtabs %}
  const tabsRegex = /\{%\s*tabs\s*%\}([\s\S]*?)\{%\s*endtabs\s*%\}/g;
  const tabRegex = /\{%\s*tab\s+title="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endtab\s*%\}/g;
  
  return content.replace(tabsRegex, (match, tabsContent) => {
    let result = '';
    let tabMatch;
    const tabs = [];
    
    while ((tabMatch = tabRegex.exec(tabsContent)) !== null) {
      tabs.push({ title: tabMatch[1], content: tabMatch[2].trim() });
    }
    
    if (tabs.length > 0) {
      result = `import Tabs from '@theme/Tabs';\nimport TabItem from '@theme/TabItem';\n\n<Tabs>\n`;
      tabs.forEach(tab => {
        result += `<TabItem value="${tab.title.toLowerCase().replace(/\s+/g, '-')}" label="${tab.title}">\n\n${tab.content}\n\n</TabItem>\n`;
      });
      result += '</Tabs>';
    }
    
    return result;
  });
}

function convertCodeBlocks(content) {
  // Convert {% code title="..." %} ... {% endcode %} to standard code blocks
  const codeRegex = /\{%\s*code\s+(?:title="([^"]+)")?[^%]*%\}([\s\S]*?)\{%\s*endcode\s*%\}/g;
  
  return content.replace(codeRegex, (match, title, codeContent) => {
    const trimmedCode = codeContent.trim();
    if (title) {
      return `\`\`\`${title}\n${trimmedCode}\n\`\`\``;
    }
    return trimmedCode;
  });
}

function convertEmbed(content) {
  // Convert {% embed url="..." %} to links
  const embedRegex = /\{%\s*embed\s+url="([^"]+)"\s*%\}/g;
  
  return content.replace(embedRegex, (match, url) => {
    return `[${url}](${url})`;
  });
}

function convertOpenApiOperations(content) {
  // Convert {% openapi-operation ... %} ... {% endopenapi-operation %} 
  // These GitBook-specific OpenAPI operations need to be converted to regular links or removed
  const openapiRegex = /\{%\s*openapi-operation\s+[^%]*path="([^"]+)"\s+method="([^"]+)"[^%]*%\}[\s\S]*?\{%\s*endopenapi-operation\s*%\}/g;
  
  return content.replace(openapiRegex, (match, path, method) => {
    return `**${method.toUpperCase()} ${path}**\n\nRefer to the [API documentation](/cloud/api) for details.`;
  });
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply all conversions
  content = convertFrontmatter(content);
  content = convertHints(content);
  content = convertContentRefs(content);
  content = convertFigures(content);
  content = convertInlineImages(content);
  content = convertTabs(content);
  content = convertCodeBlocks(content);
  content = convertEmbed(content);
  content = convertOpenApiOperations(content);
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function renameReadmeToIndex(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      renameReadmeToIndex(filePath);
    } else if (file === 'README.md') {
      const newPath = path.join(dir, 'index.md');
      fs.renameSync(filePath, newPath);
      console.log(`Renamed: ${filePath} -> ${newPath}`);
    }
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.md')) {
      console.log(`Converting: ${filePath}`);
      convertFile(filePath);
    }
  }
}

// Main execution
console.log('Starting GitBook to Docusaurus conversion...');
console.log(`Processing directory: ${CLOUD_DIR}`);

// First rename README.md files to index.md
renameReadmeToIndex(CLOUD_DIR);

// Then process all markdown files
processDirectory(CLOUD_DIR);

console.log('Conversion complete!');
