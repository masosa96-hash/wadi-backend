import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export interface ExportMessage {
  type: 'user' | 'ai';
  content: string;
  timestamp?: string;
  model?: string;
  customName?: string;
}

export interface ExportOptions {
  projectName?: string;
  sessionName?: string;
  messages: ExportMessage[];
}

/**
 * Export conversation as Markdown
 */
export async function exportAsMarkdown(options: ExportOptions): Promise<void> {
  const { projectName = 'Untitled Project', sessionName, messages } = options;
  
  let markdown = `# ${projectName}\n\n`;
  
  if (sessionName) {
    markdown += `## Session: ${sessionName}\n\n`;
  }
  
  markdown += `Exported: ${new Date().toLocaleString()}\n\n`;
  markdown += `---\n\n`;
  
  messages.forEach((msg, index) => {
    const header = msg.type === 'user' ? '### User' : '### AI Assistant';
    markdown += `${header}\n`;
    
    if (msg.customName) {
      markdown += `**Name:** ${msg.customName}\n`;
    }
    
    if (msg.timestamp) {
      markdown += `**Time:** ${new Date(msg.timestamp).toLocaleString()}\n`;
    }
    
    if (msg.model && msg.type === 'ai') {
      markdown += `**Model:** ${msg.model}\n`;
    }
    
    markdown += `\n${msg.content}\n\n`;
    
    if (index < messages.length - 1) {
      markdown += `---\n\n`;
    }
  });
  
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const filename = `${sanitizeFilename(projectName)}_${Date.now()}.md`;
  saveAs(blob, filename);
}

/**
 * Export conversation as JSON
 */
export async function exportAsJSON(options: ExportOptions): Promise<void> {
  const { projectName = 'Untitled Project', sessionName, messages } = options;
  
  const exportData = {
    projectName,
    sessionName,
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map((msg, index) => ({
      id: index + 1,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      model: msg.model,
      customName: msg.customName,
    })),
  };
  
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const filename = `${sanitizeFilename(projectName)}_${Date.now()}.json`;
  saveAs(blob, filename);
}

/**
 * Export conversation as PDF
 */
export async function exportAsPDF(options: ExportOptions): Promise<void> {
  const { projectName = 'Untitled Project', sessionName, messages } = options;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  
  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(projectName, margin, yPosition);
  yPosition += 10;
  
  // Session name
  if (sessionName) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Session: ${sessionName}`, margin, yPosition);
    yPosition += 8;
  }
  
  // Export date
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text(`Exported: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 10;
  
  // Separator
  pdf.setDrawColor(200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  
  // Messages
  pdf.setTextColor(0);
  
  messages.forEach((msg, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    
    // Message header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const headerText = msg.type === 'user' ? 'User' : 'AI Assistant';
    pdf.text(headerText, margin, yPosition);
    yPosition += 6;
    
    // Metadata
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100);
    
    if (msg.customName) {
      pdf.text(`Name: ${msg.customName}`, margin, yPosition);
      yPosition += 5;
    }
    
    if (msg.timestamp) {
      pdf.text(`Time: ${new Date(msg.timestamp).toLocaleString()}`, margin, yPosition);
      yPosition += 5;
    }
    
    if (msg.model && msg.type === 'ai') {
      pdf.text(`Model: ${msg.model}`, margin, yPosition);
      yPosition += 5;
    }
    
    yPosition += 2;
    
    // Message content
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0);
    
    const lines = pdf.splitTextToSize(msg.content, maxLineWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 5;
    
    // Separator between messages
    if (index < messages.length - 1) {
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setDrawColor(220);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  });
  
  const filename = `${sanitizeFilename(projectName)}_${Date.now()}.pdf`;
  pdf.save(filename);
}

/**
 * Export conversation as HTML
 */
export async function exportAsHTML(options: ExportOptions): Promise<void> {
  const { projectName = 'Untitled Project', sessionName, messages } = options;
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #0A0E14;
      color: #E6E8EC;
      line-height: 1.6;
    }
    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #2D3340;
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      color: #00D9A3;
    }
    .session {
      font-size: 18px;
      color: #9BA3B4;
      margin: 5px 0;
    }
    .export-date {
      font-size: 14px;
      color: #6B7280;
      margin: 10px 0;
    }
    .message {
      margin: 30px 0;
      padding: 20px;
      border-radius: 12px;
      background: rgba(19, 23, 31, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .message.user {
      margin-left: 80px;
      background: rgba(19, 23, 31, 0.5);
    }
    .message.ai {
      margin-right: 80px;
      background: rgba(0, 217, 163, 0.08);
      border-color: rgba(0, 217, 163, 0.2);
    }
    .message-header {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .message.user .message-header {
      color: #7C3AED;
    }
    .message.ai .message-header {
      color: #00D9A3;
    }
    .metadata {
      font-size: 12px;
      color: #6B7280;
      margin: 5px 0;
    }
    .content {
      margin-top: 15px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${projectName}</h1>
    ${sessionName ? `<div class="session">Session: ${sessionName}</div>` : ''}
    <div class="export-date">Exported: ${new Date().toLocaleString()}</div>
  </div>
  <div class="messages">
`;
  
  messages.forEach((msg) => {
    html += `    <div class="message ${msg.type}">
      <div class="message-header">${msg.type === 'user' ? 'User' : 'AI Assistant'}</div>
`;
    
    if (msg.customName || msg.timestamp || (msg.model && msg.type === 'ai')) {
      html += `      <div class="metadata">
`;
      if (msg.customName) {
        html += `        <div>Name: ${msg.customName}</div>\n`;
      }
      if (msg.timestamp) {
        html += `        <div>Time: ${new Date(msg.timestamp).toLocaleString()}</div>\n`;
      }
      if (msg.model && msg.type === 'ai') {
        html += `        <div>Model: ${msg.model}</div>\n`;
      }
      html += `      </div>
`;
    }
    
    html += `      <div class="content">${escapeHTML(msg.content)}</div>
    </div>
`;
  });
  
  html += `  </div>
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const filename = `${sanitizeFilename(projectName)}_${Date.now()}.html`;
  saveAs(blob, filename);
}

/**
 * Sanitize filename for safe file saving
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
