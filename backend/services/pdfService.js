import htmlPdf from 'html-pdf-node';

class PDFService {
  async generateResumePDF(resumeData) {
    try {
      const htmlContent = this.generateResumeHTML(resumeData);
      
      const options = {
        format: 'A4',
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      };

      const file = { content: htmlContent };
      const pdfBuffer = await htmlPdf.generatePdf(file, options);
      
      return pdfBuffer;
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  generateResumeHTML(resumeData) {
    const { personalInfo, experience, education, skills } = resumeData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .contact { font-size: 14px; color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; margin-bottom: 15px; }
          .item { margin-bottom: 15px; }
          .item-title { font-weight: bold; }
          .item-subtitle { color: #666; font-style: italic; }
          .skills { display: flex; flex-wrap: wrap; gap: 10px; }
          .skill { background: #f0f0f0; padding: 5px 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${personalInfo?.name || 'Name'}</div>
          <div class="contact">
            ${personalInfo?.email || ''} | ${personalInfo?.phone || ''} | ${personalInfo?.location || ''}
          </div>
        </div>

        ${experience?.length ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${experience.map(exp => `
            <div class="item">
              <div class="item-title">${exp.title} - ${exp.company}</div>
              <div class="item-subtitle">${exp.duration}</div>
              <div>${exp.description || ''}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${education?.length ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${education.map(edu => `
            <div class="item">
              <div class="item-title">${edu.degree} - ${edu.institution}</div>
              <div class="item-subtitle">${edu.year}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${skills?.length ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${skills.map(skill => `<div class="skill">${skill}</div>`).join('')}
          </div>
        </div>
        ` : ''}
      </body>
      </html>
    `;
  }
}

export default new PDFService();