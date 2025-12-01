import htmlPdf from 'html-pdf-node';

class PDFService {
  async generateResumePDF(resumeData) {
    try {
      const htmlContent = this.generateResumeHTML(resumeData);
      
      const options = {
        format: 'A4',
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        printBackground: true,
        preferCSSPageSize: true
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
    const { template, personalInfo, experience, education, skills, about } = resumeData;
    
    const templateStyles = this.getTemplateStyles(template);
    const fullName = `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${templateStyles}
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header">
            <div class="name">${fullName}</div>
            <div class="contact">
              ${personalInfo?.email || ''} ${personalInfo?.phone ? '| ' + personalInfo.phone : ''} ${personalInfo?.city ? '| ' + personalInfo.city : ''}
            </div>
          </div>

          ${about ? `
          <div class="section">
            <div class="section-title">About</div>
            <div class="section-content">${about}</div>
          </div>
          ` : ''}

          ${experience?.length ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${experience.map(exp => `
              <div class="item">
                <div class="item-header">
                  <div class="item-title">${exp.position || 'Position'} - ${exp.company || 'Company'}</div>
                  <div class="item-date">${exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : exp.current ? '- Present' : ''}</div>
                </div>
                ${exp.location ? `<div class="item-location">${exp.location}</div>` : ''}
                ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${education?.length ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${education.map(edu => `
              <div class="item">
                <div class="item-title">${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}</div>
                <div class="item-subtitle">${edu.year || ''}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${skills?.length ? `
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-grid">
              ${skills.map(skill => `
                <div class="skill-item">
                  <span class="skill-name">${skill.name || 'Skill'}</span>
                  <span class="skill-level">${skill.level || 'Professional'}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }

  getTemplateStyles(template) {
    const baseStyles = `
      body { font-family: 'Arial', sans-serif; margin: 0; padding: 20px; line-height: 1.6; color: #333; }
      .resume-container { max-width: 800px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
      .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
      .contact { font-size: 14px; color: #666; }
      .section { margin-bottom: 25px; }
      .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
      .section-content { margin-bottom: 15px; }
      .item { margin-bottom: 20px; }
      .item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
      .item-title { font-weight: bold; font-size: 16px; }
      .item-date { font-size: 14px; color: #666; font-style: italic; }
      .item-location { font-size: 14px; color: #666; margin-bottom: 8px; }
      .item-description { margin-top: 8px; }
      .skills-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .skill-item { display: flex; justify-content: space-between; padding: 8px; background: #f8f9fa; border-radius: 4px; }
      .skill-name { font-weight: 500; }
      .skill-level { font-size: 12px; color: #666; text-transform: uppercase; }
    `;

    // Template-specific styles
    const templateSpecificStyles = {
      'london': `
        .header { border-bottom: 3px solid #2563eb; }
        .section-title { color: #2563eb; border-bottom: 1px solid #2563eb; padding-bottom: 5px; }
      `,
      'madrid': `
        .header { border-bottom: 2px solid #dc2626; }
        .section-title { color: #dc2626; }
        .name { color: #dc2626; }
      `,
      'oslo': `
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; border: none; }
        .section-title { background: #374151; color: white; padding: 8px 16px; margin: 0 -16px 15px -16px; }
      `,
      'copenhagen': `
        body { background: linear-gradient(to right, #4c51bf 35%, #ffffff 35%); }
        .resume-container { background: white; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { color: white; background: #4c51bf; margin: -40px -40px 30px -40px; padding: 30px 40px; }
        .section-title { color: #4c51bf; }
      `
    };

    return baseStyles + (templateSpecificStyles[template] || templateSpecificStyles['london']);
  }
}

export default new PDFService();