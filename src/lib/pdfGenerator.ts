// Adaptación de generateCertificatePDF de Vite para Next.js
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface CertificateData {
  patientName: string;
  documentId: string;
  birthDate: string;
  country: string;
  vaccines: any[];
  issueDate: string;
  qrCode: string;
  lang: string;
  t: (key: string, options?: any) => string;
}

export const generateCertificatePDF = async (certificateData: CertificateData) => {
  const localT = certificateData.t;
  const localLang = certificateData.lang.split('-')[0] || 'es';

  const getTranslationForPdf = (key: string, options = {}) => {
    let translation = localT(key, { lng: localLang, ...options });
    // Traducción secundaria para títulos
    if (key.startsWith('pdf')) {
      let secondaryLang = 'en';
      if (localLang === 'es') secondaryLang = 'en';
      else if (localLang === 'en') secondaryLang = 'es';
      else if (localLang === 'fr') secondaryLang = 'en';
      else if (localLang === 'pt') secondaryLang = 'en';
      if (localLang !== secondaryLang) {
        const secondaryTranslation = localT(key, { lng: secondaryLang, ...options });
        if (translation !== secondaryTranslation && secondaryTranslation !== key) {
          translation = `${translation} / ${secondaryTranslation}`;
        }
      }
    }
    return translation;
  };

  if (!certificateData) throw new Error(getTranslationForPdf('errorGeneratingCertificateDesc'));
  const { patientName, documentId, birthDate, country, vaccines, issueDate, qrCode } = certificateData;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Colores y layout
  const MARGIN = 15;
  const PAGE_WIDTH = pdf.internal.pageSize.getWidth();
  const PAGE_HEIGHT = pdf.internal.pageSize.getHeight();
  const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
  const primaryColor = [17, 24, 39];
  const secondaryColor = [75, 85, 99];
  const accentColor = [37, 99, 235];
  const borderColor = [209, 213, 219];
  let yPos = MARGIN;

  // Header
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(0, 0, PAGE_WIDTH, 30, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  const titleMain = getTranslationForPdf('pdfTitle', {lng: localLang});
  const titleSubKey = localLang === 'es' ? 'en' : (localLang === 'en' ? 'es' : 'en');
  const titleSub = getTranslationForPdf('pdfTitle', {lng: titleSubKey });
  pdf.text(titleMain, PAGE_WIDTH / 2, MARGIN + 3, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  if(titleMain !== titleSub && titleSub !== 'pdfTitle') {
    pdf.text(titleSub, PAGE_WIDTH / 2, MARGIN + 10, { align: 'center' });
  }
  yPos = 30 + MARGIN;

  // Sección datos paciente
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(getTranslationForPdf('pdfSubtitle').toUpperCase(), MARGIN, yPos);
  yPos += 6;
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
  yPos += 8;

  const patientInfo = [
    { labelKey: 'pdfPatientName', value: patientName },
    { labelKey: 'pdfDocumentId', value: documentId },
    { labelKey: 'pdfBirthDate', value: new Date(birthDate).toLocaleDateString(localLang, { year: 'numeric', month: 'long', day: 'numeric' }) },
    { labelKey: 'pdfCountry', value: country || getTranslationForPdf('pdfCountryNotSpecified') },
  ];
  pdf.setFontSize(10);
  patientInfo.forEach(info => {
    const label = getTranslationForPdf(info.labelKey);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(label, MARGIN, yPos);
    yPos += 5.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const valueText = String(info.value || getTranslationForPdf('pdfNotApplicable'));
    const lines = pdf.splitTextToSize(valueText, CONTENT_WIDTH - 10);
    lines.forEach((line: string, idx: number) => {
      pdf.text(line, MARGIN + 4, yPos + idx * 5.5);
    });
    yPos += (lines.length * 5.5) + 6;
  });
  yPos += 8;

  // Tabla de vacunas
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(getTranslationForPdf('pdfVaccinationHistory').toUpperCase(), MARGIN, yPos);
  yPos += 6;
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
  yPos += 8;

  if (vaccines && vaccines.length > 0) {
    const tableHeaders = [
      getTranslationForPdf('pdfVaccine'),
      getTranslationForPdf('pdfDose'),
      getTranslationForPdf('pdfLot'),
      getTranslationForPdf('pdfDate'),
      getTranslationForPdf('pdfPlace'),
      getTranslationForPdf('pdfProfessional')
    ];
    const colWidthsRatio = [0.25, 0.12, 0.13, 0.15, 0.20, 0.15];
    const colWidths = colWidthsRatio.map(r => r * CONTENT_WIDTH);
    let currentX = MARGIN;
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    tableHeaders.forEach((header, i) => {
      pdf.rect(currentX, yPos, colWidths[i], 10, 'S');
      pdf.text(header, currentX + colWidths[i]/2, yPos + 5, {align: 'center', baseline: 'middle'});
      currentX += colWidths[i];
    });
    yPos += 10;
    pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    vaccines.forEach(vaccine => {
      currentX = MARGIN;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const rowData = [
        vaccine.vaccineName,
        vaccine.dose,
        vaccine.vaccineLot || getTranslationForPdf('pdfNotApplicable'),
        new Date(vaccine.vaccinationDate).toLocaleDateString(localLang),
        vaccine.vaccinationPlace,
        vaccine.healthProfessional
      ];
      // Calcular altura dinámica de la fila
      let maxLines = 1;
      const cellLinesArr = rowData.map((text, i) => {
        const cellLines = pdf.splitTextToSize(String(text || getTranslationForPdf('pdfNotApplicable')), colWidths[i] - 4);
        if (cellLines.length > maxLines) maxLines = cellLines.length;
        return cellLines;
      });
      const rowHeight = Math.max(maxLines * 5.5 + 4, 12);
      rowData.forEach((text, i) => {
        pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
        pdf.rect(currentX, yPos, colWidths[i], rowHeight, 'S');
        const cellLines = cellLinesArr[i];
        // Centrar verticalmente el texto en la celda
        const startY = yPos + 6 + ((rowHeight - cellLines.length * 5.5) / 2);
        cellLines.forEach((line: string, idx: number) => {
          pdf.text(line, currentX + 2, startY + idx * 5.5);
        });
        currentX += colWidths[i];
      });
      yPos += rowHeight;
    });
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(getTranslationForPdf('pdfNoVaccinesRecorded'), MARGIN, yPos);
    yPos += 8;
  }
  yPos += 10;

  // Sección emisión y QR
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(getTranslationForPdf('pdfIssuanceAndVerification').toUpperCase(), MARGIN, yPos);
  yPos += 6;
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
  yPos += 8;
  pdf.setFontSize(10);
  // Emitido en
  const issueLabel = getTranslationForPdf('pdfIssuedOn');
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(issueLabel, MARGIN, yPos);
  yPos += 5.5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const issueValue = new Date(issueDate).toLocaleString(localLang, { dateStyle: 'long', timeStyle: 'short' });
  const issueLines = pdf.splitTextToSize(issueValue, CONTENT_WIDTH - 10);
  issueLines.forEach((line: string, idx: number) => {
    pdf.text(line, MARGIN + 4, yPos + idx * 5.5);
  });
  yPos += (issueLines.length * 5.5) + 6;
  // Código de verificación
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(getTranslationForPdf('pdfVerificationCode'), MARGIN, yPos);
  yPos += 5.5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const verificationCode = qrCode.split('/').pop() || '';
  const codeLines = pdf.splitTextToSize(verificationCode, CONTENT_WIDTH - 10);
  codeLines.forEach((line: string, idx: number) => {
    pdf.text(line, MARGIN + 4, yPos + idx * 5.5);
  });
  yPos += (codeLines.length * 5.5) + 6;
  // Entidad emisora
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(getTranslationForPdf('pdfIssuingEntity'), MARGIN, yPos);
  yPos += 5.5;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const entityLines = pdf.splitTextToSize(getTranslationForPdf('pdfIssuingEntityName'), CONTENT_WIDTH - 10);
  entityLines.forEach((line: string, idx: number) => {
    pdf.text(line, MARGIN + 4, yPos + idx * 5.5);
  });
  yPos += (entityLines.length * 5.5) + 6;

  // Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text(getTranslationForPdf('pdfDisclaimer'), PAGE_WIDTH / 2, PAGE_HEIGHT - MARGIN + 10, { align: 'center', maxWidth: CONTENT_WIDTH });

  const fileName = `${getTranslationForPdf('pdfTitle').replace(/\s*\/\s*/g, '_').replace(/\s+/g, '_')}_${patientName.replace(/\s+/g, '_')}_${localLang}.pdf`;
  pdf.save(fileName);
};
