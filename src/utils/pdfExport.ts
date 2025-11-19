import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const downloadResumeAsPDF = async (elementId: string, fileName: string = 'resume') => {
  try {
    console.log('Starting PDF generation for element:', elementId);
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      alert('Resume element not found. Please try again.');
      return false;
    }

    console.log('Element found, creating canvas...');
    
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    console.log('Canvas created, generating PDF...');

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Calculate dimensions to fit A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvas.height / canvas.width;
    const pdfAspectRatio = pdfHeight / pdfWidth;

    let imgWidth, imgHeight;
    if (canvasAspectRatio > pdfAspectRatio) {
      imgHeight = pdfHeight;
      imgWidth = imgHeight / canvasAspectRatio;
    } else {
      imgWidth = pdfWidth;
      imgHeight = imgWidth * canvasAspectRatio;
    }

    // Add image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Download PDF
    pdf.save(`${fileName}.pdf`);
    console.log('PDF downloaded successfully');
    return true;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert(`PDF generation failed: ${error.message}`);
    return false;
  }
};