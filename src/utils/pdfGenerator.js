import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Helper to convert image URL to Base64 (Solves CORS issues for Production)
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

export const generatePDF = async (type, data, club) => {
  const doc = new jsPDF();
  const systemLogo = "/logo_64.png"; // Your local system logo

  // --- 1. HEADER SECTION ---
  doc.addImage(systemLogo, 'PNG', 10, 10, 15, 15);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(club.name.toUpperCase(), 30, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`Official Document - Generated on ${dateStr}`, 30, 25);
  
  // Try to add Club Logo (Async Base64 conversion)
  if (club.image) {
    try {
      const base64Logo = await getBase64ImageFromURL(club.image);
      doc.addImage(base64Logo, 'JPEG', 170, 10, 20, 20);
    } catch (e) {
      console.warn("Club Logo skipped due to CORS/Access constraints.");
    }
  }

  doc.line(10, 35, 200, 35);

  // --- 2. CONDITION: MEMBERSHIP LIST ---
  if (type === 'membership') {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CURRENT MEMBERSHIP DIRECTORY", 10, 45);

    const tableRows = data.map(m => [
      m.fullName || 'N/A',
      m.email || 'N/A',
      m.phoneNumber || 'Not Provided',
      m.role || 'Member'
    ]);

    doc.autoTable({
      startY: 52,
      head: [['Full Name', 'Email Address', 'Phone Number', 'Designation']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { font: "helvetica", fontSize: 9 }
    });
  }

  // --- 3. CONDITION: ELECTION RESULTS ---
  if (type === 'election') {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`OFFICIAL ELECTION RESULTS: ${data.title.toUpperCase()}`, 10, 45);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${data.status} | Total Votes Verified: ${data.totalVotes || 0}`, 10, 52);

    // Identify the winner (Highest votes)
    const sortedCandidates = [...data.candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    const winnerVotes = sortedCandidates[0]?.votes || 0;

    const tableRows = sortedCandidates.map(c => [
      c.name,
      c.position,
      (c.votes || 0).toString(),
      (c.votes === winnerVotes && winnerVotes > 0) ? "ELECTED" : "—"
    ]);

    doc.autoTable({
      startY: 60,
      head: [['Candidate', 'Position', 'Tally', 'Outcome']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }, // Brand Purple
      didParseCell: function(cellData) {
        if (cellData.section === 'body' && cellData.column.index === 3 && cellData.cell.raw === 'ELECTED') {
          cellData.cell.styles.textColor = [22, 163, 74]; // Success Green
          cellData.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.text("Certification:", 10, finalY);
    doc.text("_________________________", 10, finalY + 10);
    doc.text("Club Leader Signature", 10, finalY + 15);
  }

  // --- 4. SAVE ---
  const fileName = type === 'election' ? `${club.name}_Election_Report` : `${club.name}_Member_Directory`;
  doc.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
};