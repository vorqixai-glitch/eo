import { jsPDF } from "jspdf";
import { type Persona } from "./personas";

/**
 * Generates and downloads a beautifully styled, professional PDF Blueprint
 * of all active Chatbot Copilots in the Swarm.
 */
export function exportBotsToPdf(personas: Persona[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // PDF Page bounds: A4 is 210mm x 297mm
  const primaryColor = [16, 185, 129]; // Emerald (RGB)

  // 1. Executive Dark Header Header
  doc.setFillColor(15, 23, 42); // slate 900
  doc.rect(0, 0, 210, 42, "F");

  // Accent Line
  doc.setFillColor(16, 185, 129); // emerald
  doc.rect(0, 42, 210, 2, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("MOSS SWARM INTELLECT", 15, 18);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text("OFFICIAL MULTI-AGENT SWARM BLUEPRINT & COMMAND PROTOCOLS", 15, 25);

  // Metadata row
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // light slate
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(
    `CATALOG VERSION: v1.1.2  |  COMPILED: ${dateStr}  |  STATUS: OPERATIONAL DEPLOYMENT`,
    15,
    33,
  );

  // 2. Persona Listing
  let y = 56;
  personas.forEach((p, index) => {
    // If approaching page bottom, add a clean new page
    if (y > 255) {
      doc.addPage();

      // Page background banner on new page
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 15, "F");
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 15, 210, 1, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("MOSS SWARM INTELLECT  |  DEPLOYMENT CATALOGUE CONTINUED", 15, 9);

      y = 28;
    }

    // Outer card container
    doc.setFillColor(248, 250, 252); // slate 50
    doc.setDrawColor(226, 232, 240); // slate 200
    doc.rect(12, y, 186, 32, "FD");

    // Indicator bar
    doc.setFillColor(16, 185, 129);
    doc.rect(12, y, 2, 32, "F");

    // Emoji + Name
    doc.setTextColor(15, 23, 42); // slate 900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    // Fallback emoji replacement for PDF compatibility
    const emojiStr = p.emoji || "🤖";
    doc.text(`${emojiStr}  ${p.name}`, 18, y + 7);

    // Tagline
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(8);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(p.tagline || "", 18, y + 12);

    // System instructions text box (auto wraps lines)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105); // Slate 600

    const cleanSystem = p.system || "";
    const truncated = cleanSystem.length > 250 ? cleanSystem.slice(0, 250) + "..." : cleanSystem;
    const lines = doc.splitTextToSize(truncated, 172);
    doc.text(lines, 18, y + 17);

    y += 37; // Incremental card padding
  });

  // Save pdf
  doc.save("moss-swarm-blueprint.pdf");
}

/**
 * Intelligent client-side parser to extract bot configuration
 * from PDF, JSON, or plain TXT files.
 */
export async function parseUploadedBot(file: File): Promise<Partial<Persona>> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    const text = await file.text();
    const data = JSON.parse(text);
    return {
      id: data.id || `custom-${Date.now()}`,
      name: data.name || "Custom Bot",
      emoji: data.emoji || "🧠",
      tagline: data.tagline || "Dynamic agent configured from JSON",
      system: data.system || "You are a custom configured chatbot agent.",
    };
  }

  if (extension === "txt" || extension === "md") {
    const text = await file.text();
    return extractFromText(text);
  }

  if (extension === "pdf") {
    // Elegant plain-text fallback parsing for client-side PDFs
    // It reads binary structures and extracts clear printable strings
    try {
      const buffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder("utf-8");
      const decoded = textDecoder.decode(buffer);

      // Look for plain-text readable segments inside the PDF data stream
      const printableText = decoded.replace(/[^\x20-\x7E\n]/g, " ");
      return extractFromText(printableText);
    } catch (e) {
      console.warn("Binary PDF read failed, attempting string coercion:", e);
      return {
        id: `pdf-${Date.now()}`,
        name: "Custom PDF Agent",
        emoji: "📄",
        tagline: "Extracted from uploaded PDF specifications",
        system: `You are a custom AI agent initialized from the document "${file.name}".`,
      };
    }
  }

  throw new Error("Unsupported file type. Please upload a PDF, JSON, or TXT file.");
}

/**
 * Helper to parse plain text structures for keys:
 * Name: <name>
 * Emoji: <emoji>
 * Tagline: <tagline>
 * System: <system instructions>
 */
function extractFromText(text: string): Partial<Persona> {
  const lines = text.split("\n");
  let name = "";
  let emoji = "🧠";
  let tagline = "";
  let system = "";

  // Scan line by line for labels
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith("name:")) {
      name = trimmed.slice(5).trim();
    } else if (trimmed.toLowerCase().startsWith("emoji:")) {
      emoji = trimmed.slice(6).trim();
    } else if (trimmed.toLowerCase().startsWith("tagline:")) {
      tagline = trimmed.slice(8).trim();
    } else if (
      trimmed.toLowerCase().startsWith("system:") ||
      trimmed.toLowerCase().startsWith("instructions:")
    ) {
      system = trimmed.slice(trimmed.indexOf(":") + 1).trim();
    }
  });

  // Fallbacks if some labels are not direct
  if (!name) {
    name = "Custom File Agent";
  }
  if (!tagline) {
    tagline = "Configured dynamically from uploaded specification file";
  }
  if (!system) {
    // If no labels exist, treat the entire file as the system prompt
    system = text.length > 500 ? text.slice(0, 500) + "..." : text;
  }

  return {
    id: `custom-${Date.now()}`,
    name,
    emoji,
    tagline,
    system,
  };
}

export interface PdfPart {
  type: string;
  text?: string;
}

export interface PdfMessage {
  role: string;
  parts?: PdfPart[];
  content?: string;
}

/**
 * Generates and downloads a beautifully formatted transcript of the chat conversation.
 */
export function exportChatToPdf(title: string, messages: PdfMessage[]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page setup metrics
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // 1. Executive Banner
  doc.setFillColor(15, 23, 42); // slate 900
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(16, 185, 129); // emerald
  doc.rect(0, 35, pageWidth, 1.5, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MOSS SWARM TRANSCRIPT", margin, 14);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // light slate
  doc.text(`SESSION ID: ${title.toUpperCase()}`, margin, 21);

  // Date
  doc.setFontSize(7.5);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text(`COMPILED: ${new Date().toLocaleString()}`, margin, 27);

  let y = 48;

  if (!messages || messages.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "oblique");
    doc.setFontSize(10);
    doc.text("No messages recorded in this conversation.", margin, y);
    doc.save(`moss-swarm-empty-session.pdf`);
    return;
  }

  messages.forEach((m, idx) => {
    const isUser = m.role === "user";

    // Extract raw text content from message parts
    let textContent = "";
    if (m.parts && Array.isArray(m.parts)) {
      textContent = m.parts.map((p: PdfPart) => (p.type === "text" ? p.text : "")).join("");
    } else {
      textContent = m.content || "";
    }

    // Clean text: strip out complex markdown or triple backticks for clean PDF viewing
    textContent = textContent.replace(/```[a-z]*\n?/gi, "");
    textContent = textContent.replace(/`/g, "");

    // Prepare role prefix
    const roleLabel = isUser ? "USER REQUEST:" : "MOSS CO-PILOT RESPONSE:";

    // Split message text to size
    const textLines = doc.splitTextToSize(textContent, contentWidth - 8);
    const boxHeight = textLines.length * 4.5 + 14;

    // Check if box fits on current page
    if (y + boxHeight > pageHeight - margin) {
      doc.addPage();

      // Header banner on new page
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 12, "F");
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 12, pageWidth, 0.8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(`MOSS SWARM TRANSCRIPT  |  CONTINUED`, margin, 7);

      y = 20;
    }

    // Render bubble background
    if (isUser) {
      doc.setFillColor(241, 245, 249); // slate 100
      doc.setDrawColor(226, 232, 240); // slate 200
    } else {
      doc.setFillColor(248, 250, 252); // slate 50
      doc.setDrawColor(226, 232, 240); // slate 200
    }

    // Draw bubble box
    doc.rect(margin, y, contentWidth, boxHeight, "FD");

    // Draw role color indicator strip
    if (isUser) {
      doc.setFillColor(71, 85, 105); // slate 600
    } else {
      doc.setFillColor(16, 185, 129); // emerald 500
    }
    doc.rect(margin, y, 1.5, boxHeight, "F");

    // Render Role text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    if (isUser) {
      doc.setTextColor(51, 65, 85);
    } else {
      doc.setTextColor(16, 185, 129);
    }
    doc.text(roleLabel, margin + 4, y + 5.5);

    // Render message body text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59); // slate 800
    doc.text(textLines, margin + 4, y + 11.5);

    y += boxHeight + 6; // Padding between bubbles
  });

  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 30);
  doc.save(`moss-swarm-chat-${sanitizedTitle || "session"}.pdf`);
}
