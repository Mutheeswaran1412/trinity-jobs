import type { TextItem, TextItems } from "./types";

/**
 * Step 1: Read pdf and output textItems by concatenating results from each page.
 */
export const readPdf = async (fileUrl: string): Promise<TextItems> => {
  try {
    // Mock implementation - replace with actual pdfjs when available
    const mockTextItems: TextItems = [
      { text: 'John Doe', x: 100, y: 750, width: 80, height: 12, fontName: 'Arial-Bold', hasEOL: false },
      { text: 'john.doe@email.com', x: 100, y: 730, width: 120, height: 10, fontName: 'Arial', hasEOL: false },
      { text: '+1 (555) 123-4567', x: 100, y: 710, width: 100, height: 10, fontName: 'Arial', hasEOL: false },
      { text: 'San Francisco, CA', x: 100, y: 690, width: 110, height: 10, fontName: 'Arial', hasEOL: true },
      { text: 'EXPERIENCE', x: 100, y: 650, width: 80, height: 12, fontName: 'Arial-Bold', hasEOL: true },
      { text: 'Senior Developer', x: 100, y: 630, width: 100, height: 10, fontName: 'Arial-Bold', hasEOL: false },
      { text: 'Tech Corp', x: 100, y: 615, width: 60, height: 10, fontName: 'Arial', hasEOL: false },
      { text: '2020 - Present', x: 100, y: 600, width: 80, height: 10, fontName: 'Arial', hasEOL: true },
      { text: 'Led development of web applications using React and Node.js', x: 100, y: 585, width: 300, height: 10, fontName: 'Arial', hasEOL: true },
      { text: 'EDUCATION', x: 100, y: 550, width: 70, height: 12, fontName: 'Arial-Bold', hasEOL: true },
      { text: 'Bachelor of Computer Science', x: 100, y: 530, width: 150, height: 10, fontName: 'Arial', hasEOL: false },
      { text: 'University of California', x: 100, y: 515, width: 130, height: 10, fontName: 'Arial', hasEOL: false },
      { text: '2018', x: 100, y: 500, width: 30, height: 10, fontName: 'Arial', hasEOL: true },
      { text: 'SKILLS', x: 100, y: 470, width: 50, height: 12, fontName: 'Arial-Bold', hasEOL: true },
      { text: 'JavaScript, React, Node.js, Python, SQL', x: 100, y: 450, width: 200, height: 10, fontName: 'Arial', hasEOL: true }
    ];

    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockTextItems;
  } catch (error) {
    console.error('PDF reading error:', error);
    return [];
  }
};