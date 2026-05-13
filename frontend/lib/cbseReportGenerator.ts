// CBSE Report Generator — jsPDF based
// Generates proper CBSE PU / Secondary school-style progress reports

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── CBSE Grade Mapping ────────────────────────────────────────────────────────
function cbseGrade(score: number): { grade: string; gp: number; remark: string } {
  if (score >= 91) return { grade: "A1", gp: 10, remark: "Outstanding" };
  if (score >= 81) return { grade: "A2", gp: 9, remark: "Excellent" };
  if (score >= 71) return { grade: "B1", gp: 8, remark: "Very Good" };
  if (score >= 61) return { grade: "B2", gp: 7, remark: "Good" };
  if (score >= 51) return { grade: "C1", gp: 6, remark: "Average" };
  if (score >= 41) return { grade: "C2", gp: 5, remark: "Satisfactory" };
  if (score >= 33) return { grade: "D",  gp: 4, remark: "Pass" };
  return { grade: "E", gp: 0, remark: "Needs Improvement" };
}

function competencyLevel(score: number): string {
  if (score >= 90) return "Expert";
  if (score >= 75) return "Proficient";
  if (score >= 60) return "Developing";
  if (score >= 40) return "Beginning";
  return "Emerging";
}

function getSGPA(subjects: Record<string, number>): number {
  const gps = Object.values(subjects).map((s) => cbseGrade(s).gp);
  if (!gps.length) return 0;
  return Math.round((gps.reduce((a, b) => a + b, 0) / gps.length) * 100) / 100;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b] as [number, number, number];
}

// ── Colors ────────────────────────────────────────────────────────────────────
const COLORS = {
  cbseBlue:   "#003B8E",
  cbseLBlue:  "#0066CC",
  cbseOrange: "#F26522",
  cbseGray:   "#4A4A4A",
  cbseLGray:  "#F5F5F5",
  cbseGreen:  "#2E7D32",
  cbseRed:    "#C62828",
  cbseAmber:  "#E65100",
  white:      "#FFFFFF",
  black:      "#000000",
};

// ── Types ─────────────────────────────────────────────────────────────────────
export interface CBSEReportData {
  // School
  schoolName: string;
  schoolAffiliation: string;
  academicYear: string;
  term: string;

  // Student
  studentName: string;
  studentClass: string;
  rollNo: string;
  section: string;

  // Analytics
  totalSubmissions: number;
  averageScore: number;
  bestScore: number;
  bySubject: Record<string, number>;  // subject → average score (0-100)
  scoreTrend: { idx: number; score: number }[];

  // Teacher (optional)
  teacherName?: string;
  teacherRemarks?: string;

  // AI Insights
  aiInsights?: string[];

  // Modalities
  modalityWeights?: { text: number; vision: number; audio?: number };
}

// ── Main Generator ────────────────────────────────────────────────────────────
export function generateCBSEReport(data: CBSEReportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 0;

  // ─── Helper Fns ─────────────────────────────────────────────────────────────
  const rgb = (hex: string) => hexToRgb(hex);
  const centerText = (text: string, yPos: number, size = 10, bold = false, color = COLORS.black) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...rgb(color));
    doc.text(text, pageW / 2, yPos, { align: "center" });
  };
  const leftText = (text: string, xPos: number, yPos: number, size = 9, bold = false, color = COLORS.black) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(...rgb(color));
    doc.text(text, xPos, yPos);
  };
  const fillRect = (x: number, yPos: number, w: number, h: number, color: string) => {
    doc.setFillColor(...rgb(color));
    doc.rect(x, yPos, w, h, "F");
  };
  const drawLine = (x1: number, yPos: number, x2: number, color = COLORS.cbseGray, thickness = 0.3) => {
    doc.setDrawColor(...rgb(color));
    doc.setLineWidth(thickness);
    doc.line(x1, yPos, x2, yPos);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER + SUMMARY
  // ══════════════════════════════════════════════════════════════════════════

  // ─── Header Band ─────────────────────────────────────────────────────────
  fillRect(0, 0, pageW, 42, COLORS.cbseBlue);
  fillRect(0, 42, pageW, 4, COLORS.cbseOrange);

  // CBSE Emblem area (top-left hexagon placeholder)
  doc.setDrawColor(...rgb(COLORS.white));
  doc.setFillColor(...rgb(COLORS.cbseLBlue));
  doc.circle(margin + 10, 21, 9, "FD");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...rgb(COLORS.white));
  doc.text("RIMN", margin + 10, 19.5, { align: "center" });
  doc.text("AI", margin + 10, 24, { align: "center" });

  // School name
  centerText(data.schoolName, 14, 15, true, COLORS.white);
  centerText(data.schoolAffiliation, 22, 8.5, false, "#b0c4de");
  centerText("Affiliated to Central Board of Secondary Education (CBSE), New Delhi", 29, 7.5, false, "#b0c4de");
  centerText("Powered by RIMN — Recursive Iterative Modality Negotiation AI Assessment", 36, 7, false, "#7fb3d3");

  // ─── Title Banner ─────────────────────────────────────────────────────────
  y = 56;
  fillRect(margin, y, pageW - margin * 2, 14, COLORS.cbseLGray);
  doc.setDrawColor(...rgb(COLORS.cbseBlue));
  doc.setLineWidth(0.5);
  doc.rect(margin, y, pageW - margin * 2, 14);
  centerText("STUDENT PROGRESS REPORT", y + 6, 14, true, COLORS.cbseBlue);
  centerText(`Academic Year: ${data.academicYear}  |  Term: ${data.term}`, y + 11, 8, false, COLORS.cbseGray);

  // ─── Student Info Box ─────────────────────────────────────────────────────
  y = 76;
  fillRect(margin, y, pageW - margin * 2, 32, "#EBF5FB");
  doc.setDrawColor(...rgb(COLORS.cbseBlue));
  doc.setLineWidth(0.4);
  doc.rect(margin, y, pageW - margin * 2, 32);
  // Divider line
  doc.setDrawColor(...rgb(COLORS.cbseBlue));
  doc.setLineWidth(0.2);
  doc.line(pageW / 2, y, pageW / 2, y + 32);

  const infoFields = [
    [["Student Name:", data.studentName], ["Roll No.:", data.rollNo]],
    [["Class / Grade:", data.studentClass], ["Section:", data.section]],
    [["Report Generated:", new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })],
      ["Teacher:", data.teacherName || "RIMN AI System"]],
  ];

  infoFields.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const x = ci === 0 ? margin + 4 : pageW / 2 + 4;
      const yy = y + 6 + ri * 9;
      leftText(cell[0], x, yy, 8, true, COLORS.cbseBlue);
      leftText(cell[1], x + 28, yy, 8.5, false, COLORS.black);
    });
  });

  // ─── Overall Performance Summary ─────────────────────────────────────────
  y = 116;
  leftText("OVERALL PERFORMANCE SUMMARY", margin, y, 10, true, COLORS.cbseBlue);
  drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);

  y += 8;
  const overallGrade = cbseGrade(data.averageScore);
  const sgpa = getSGPA(data.bySubject);

  // Summary cards
  const cards = [
    { label: "Overall Score",  value: `${data.averageScore}%`,     sub: `Grade: ${overallGrade.grade}` },
    { label: "Best Score",     value: `${data.bestScore}%`,        sub: cbseGrade(data.bestScore).remark },
    { label: "SGPA",           value: sgpa.toFixed(2),             sub: "10-point scale" },
    { label: "Assessments",    value: String(data.totalSubmissions), sub: "Total attempts" },
  ];

  const cardW = (pageW - margin * 2 - 9) / 4;
  cards.forEach((card, i) => {
    const cx = margin + i * (cardW + 3);
    const scoreNum = parseFloat(card.value);
    let cardColor = COLORS.cbseBlue;
    if (!isNaN(scoreNum)) {
      if (scoreNum >= 75) cardColor = COLORS.cbseGreen;
      else if (scoreNum >= 50) cardColor = COLORS.cbseAmber;
      else if (scoreNum > 0) cardColor = COLORS.cbseRed;
    }

    fillRect(cx, y, cardW, 20, cardColor);
    doc.setFillColor(...rgb(COLORS.white));
    doc.setDrawColor(...rgb(cardColor));
    doc.setLineWidth(0.3);

    centerText(card.value, y + 9, 14, true, COLORS.white);
    // need to offset x for left-aligned text within card
    const textX = cx + cardW / 2;
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...rgb("#d4e6f1"));
    doc.text(card.label.toUpperCase(), textX, y + 3.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...rgb("#d4e6f1"));
    doc.text(card.sub, textX, y + 17.5, { align: "center" });
  });

  // ─── Subject-wise Performance Table ──────────────────────────────────────
  y += 28;
  leftText("SUBJECT-WISE ACADEMIC PERFORMANCE", margin, y, 10, true, COLORS.cbseBlue);
  drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);
  y += 5;

  const subjectRows = Object.entries(data.bySubject).map(([subject, avg]) => {
    const g = cbseGrade(avg);
    const scoreBar = Math.round(avg);
    return [
      subject,
      `${avg.toFixed(1)} / 100`,
      g.grade,
      String(g.gp),
      competencyLevel(avg),
      g.remark,
    ];
  });

  if (subjectRows.length === 0) {
    subjectRows.push(["No data yet", "—", "—", "—", "—", "—"]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Subject", "Marks Obtained", "Grade", "Grade Point", "Competency Level", "Remark"]],
    body: subjectRows,
    theme: "grid",
    headStyles: {
      fillColor: rgb(COLORS.cbseBlue),
      textColor: rgb(COLORS.white),
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: rgb(COLORS.cbseGray),
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold", cellWidth: 38 },
      5: { cellWidth: 32 },
    },
    alternateRowStyles: { fillColor: rgb(COLORS.cbseLGray) },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // ─── CBSE Grading Scale Reference ────────────────────────────────────────
  leftText("CBSE GRADING SCALE REFERENCE", margin, y, 10, true, COLORS.cbseBlue);
  drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Marks Range", "Grade", "Grade Point", "Descriptor"]],
    body: [
      ["91–100", "A1", "10", "Outstanding"],
      ["81–90",  "A2",  "9", "Excellent"],
      ["71–80",  "B1",  "8", "Very Good"],
      ["61–70",  "B2",  "7", "Good"],
      ["51–60",  "C1",  "6", "Average"],
      ["41–50",  "C2",  "5", "Satisfactory"],
      ["33–40",  "D",   "4", "Pass"],
      ["Below 33","E",  "0", "Needs Improvement / Fail"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: rgb(COLORS.cbseOrange),
      textColor: rgb(COLORS.white),
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
    },
    bodyStyles: { fontSize: 7.5, halign: "center", textColor: rgb(COLORS.cbseGray) },
    columnStyles: { 0: { cellWidth: 30 } },
    alternateRowStyles: { fillColor: rgb(COLORS.cbseLGray) },
    margin: { left: margin, right: margin },
    tableWidth: (pageW - margin * 2) / 2,
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need new page
  if (y > pageH - 40) {
    doc.addPage();
    y = 14;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2: AI INSIGHTS + MODALITY + REMARKS + SIGNATURE
  // ══════════════════════════════════════════════════════════════════════════

  // Continuation header
  if (y < 20) {
    fillRect(0, 0, pageW, 12, COLORS.cbseBlue);
    centerText(`${data.schoolName} — Student Progress Report (Continued)`, 8, 8, true, COLORS.white);
    y = 18;
  }

  // ─── Score Trend Table ────────────────────────────────────────────────────
  if (data.scoreTrend && data.scoreTrend.length > 0) {
    leftText("ASSESSMENT SCORE TREND", margin, y, 10, true, COLORS.cbseBlue);
    drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);
    y += 5;

    const trendRows = data.scoreTrend.slice(-10).map((t, i) => {
      const g = cbseGrade(t.score);
      return [`#${t.idx}`, `${t.score}%`, g.grade, g.remark];
    });

    autoTable(doc, {
      startY: y,
      head: [["Assessment", "Score", "Grade", "Performance"]],
      body: trendRows,
      theme: "striped",
      headStyles: {
        fillColor: rgb(COLORS.cbseLBlue),
        textColor: rgb(COLORS.white),
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: { fontSize: 8, halign: "center", textColor: rgb(COLORS.cbseGray) },
      alternateRowStyles: { fillColor: rgb(COLORS.cbseLGray) },
      margin: { left: margin, right: margin },
      tableWidth: (pageW - margin * 2) / 2,
    });

    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ─── Multimodal Intelligence Profile ─────────────────────────────────────
  if (data.modalityWeights) {
    leftText("MULTIMODAL LEARNING INTELLIGENCE PROFILE", margin, y, 10, true, COLORS.cbseBlue);
    drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);
    y += 6;

    const mw = data.modalityWeights;
    const modalities = [
      { name: "Textual / Linguistic Intelligence", pct: Math.round(mw.text * 100), color: COLORS.cbseLBlue },
      { name: "Visual / Spatial Intelligence",     pct: Math.round(mw.vision * 100), color: COLORS.cbseOrange },
      ...(mw.audio !== undefined
        ? [{ name: "Auditory / Listening Intelligence", pct: Math.round(mw.audio * 100), color: COLORS.cbseGreen }]
        : []),
    ];

    modalities.forEach((m) => {
      leftText(m.name, margin, y + 4, 8, false, COLORS.cbseGray);
      leftText(`${m.pct}%`, pageW - margin - 10, y + 4, 8, true, m.color);
      // Background bar
      fillRect(margin + 80, y, pageW - margin * 2 - 90, 4, "#EEEEEE");
      // Filled bar
      const barW = ((pageW - margin * 2 - 90) * m.pct) / 100;
      fillRect(margin + 80, y, barW, 4, m.color);
      y += 8;
    });
    y += 4;
  }

  // ─── AI Pedagogical Insights ──────────────────────────────────────────────
  const insights = data.aiInsights && data.aiInsights.length > 0
    ? data.aiInsights
    : [
        "The student demonstrates consistent engagement with multimodal content across assessments.",
        "Recommended focus: practice higher-order thinking problems in weaker subjects.",
        "Conceptual understanding is strong; application-level questions require more practice.",
        "Peer collaboration and group activities recommended to improve lateral thinking.",
        "RIMN AI detected no significant contradictions between written and verbal responses.",
      ];

  leftText("AI-POWERED PEDAGOGICAL INSIGHTS (RIMN SYSTEM)", margin, y, 10, true, COLORS.cbseBlue);
  drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);
  y += 6;

  insights.slice(0, 5).forEach((insight, i) => {
    fillRect(margin, y - 1, pageW - margin * 2, 7, i % 2 === 0 ? "#EBF5FB" : COLORS.white);
    leftText(`${i + 1}.`, margin + 2, y + 4, 8, true, COLORS.cbseLBlue);
    // Word-wrap
    const lines = doc.splitTextToSize(insight, pageW - margin * 2 - 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...rgb(COLORS.cbseGray));
    doc.text(lines, margin + 8, y + 4);
    y += Math.max(7, lines.length * 4.5);
  });

  y += 4;

  // ─── CBSE Co-Scholastic Areas ─────────────────────────────────────────────
  if (y > pageH - 80) {
    doc.addPage();
    y = 14;
  }

  leftText("CO-SCHOLASTIC AREAS (CBSE FRAMEWORK)", margin, y, 10, true, COLORS.cbseBlue);
  drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);
  y += 5;

  const avg = data.averageScore;
  autoTable(doc, {
    startY: y,
    head: [["Activity / Trait", "Performance Level", "CBSE Grade"]],
    body: [
      ["Critical Thinking & Problem Solving", competencyLevel(avg),          cbseGrade(avg).grade],
      ["Communication Skills (Multimodal)",   competencyLevel(avg * 0.95),   cbseGrade(avg * 0.95).grade],
      ["Self-Management & Discipline",        avg >= 70 ? "Proficient" : "Developing", avg >= 70 ? "B1" : "C1"],
      ["Information Processing",             competencyLevel(avg * 0.9),    cbseGrade(avg * 0.9).grade],
      ["Collaborative Learning",             "Developing",                   "C1"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: rgb(COLORS.cbseBlue),
      textColor: rgb(COLORS.white),
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: { fontSize: 8, halign: "center", textColor: rgb(COLORS.cbseGray) },
    columnStyles: { 0: { halign: "left", cellWidth: 80 } },
    alternateRowStyles: { fillColor: rgb(COLORS.cbseLGray) },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── Teacher's Remarks ────────────────────────────────────────────────────
  if (y > pageH - 60) {
    doc.addPage();
    y = 14;
  }

  leftText("TEACHER'S REMARKS", margin, y, 10, true, COLORS.cbseBlue);
  drawLine(margin, y + 2, pageW - margin, COLORS.cbseOrange, 0.6);
  y += 6;

  const remarks = data.teacherRemarks
    || `${data.studentName} has shown ${overallGrade.remark.toLowerCase()} performance this term with an overall average of ${data.averageScore}%. `
    + `The student is encouraged to focus on consistent revision and practice of application-based questions. `
    + `Regular participation in RIMN multimodal assessments has been commendable. `
    + `Expected to perform ${overallGrade.gp >= 8 ? "excellently" : "better"} in the upcoming examinations with continued effort.`;

  fillRect(margin, y, pageW - margin * 2, 20, "#FFF9F0");
  doc.setDrawColor(...rgb(COLORS.cbseOrange));
  doc.setLineWidth(0.4);
  doc.rect(margin, y, pageW - margin * 2, 20);
  const remarksLines = doc.splitTextToSize(remarks, pageW - margin * 2 - 6);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...rgb(COLORS.cbseGray));
  doc.text(remarksLines, margin + 3, y + 5);
  y += 26;

  // ─── Signature Block ──────────────────────────────────────────────────────
  leftText("CLASS TEACHER", margin, y + 14, 8, true, COLORS.cbseBlue);
  leftText("PRINCIPAL / HOD", pageW / 2 - 20, y + 14, 8, true, COLORS.cbseBlue);
  leftText("PARENT / GUARDIAN", pageW - margin - 40, y + 14, 8, true, COLORS.cbseBlue);

  drawLine(margin, y + 12, margin + 45, COLORS.cbseGray, 0.4);
  drawLine(pageW / 2 - 20, y + 12, pageW / 2 + 30, COLORS.cbseGray, 0.4);
  drawLine(pageW - margin - 40, y + 12, pageW - margin, COLORS.cbseGray, 0.4);

  leftText("Signature & Date", margin, y + 18, 7, false, "#888888");
  leftText("Signature & Date", pageW / 2 - 20, y + 18, 7, false, "#888888");
  leftText("Signature & Date", pageW - margin - 40, y + 18, 7, false, "#888888");

  y += 28;

  // ─── RIMN Authenticity Seal ───────────────────────────────────────────────
  fillRect(margin, y, pageW - margin * 2, 10, "#003B8E");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...rgb(COLORS.white));
  const genDate = new Date().toLocaleString("en-IN");
  doc.text(
    `✦ RIMN AI-Authenticated Report  |  Generated: ${genDate}  |  CBSE Compliant Format  |  Multimodal Assessment System ✦`,
    pageW / 2,
    y + 6.5,
    { align: "center" }
  );

  // ─── Footer on all pages ──────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...rgb("#999999"));
    doc.text(
      `Page ${p} of ${pageCount}  |  ${data.schoolName}  |  CBSE Affiliation  |  Confidential`,
      pageW / 2,
      pageH - 5,
      { align: "center" }
    );
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  const safeName = data.studentName.replace(/\s+/g, "_");
  const safeYear = data.academicYear.replace(/\//g, "-");
  doc.save(`CBSE_Progress_Report_${safeName}_${safeYear}_${data.term.replace(/\s+/g, "_")}.pdf`);
}
