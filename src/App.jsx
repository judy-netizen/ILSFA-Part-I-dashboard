import { useState, useMemo } from "react";

const CHECKLIST_ITEMS = [
  { id: "site_control", label: "Site Control Doc" },
  { id: "single_line", label: "Single-Line Diagram" },
  { id: "interconnection", label: "Interconnection Agreement" },
  { id: "environmental", label: "Environmental Assessment" },
  { id: "insurance", label: "Proof of Insurance" },
  { id: "ppa", label: "Executed PPA / Contract" },
  { id: "incentive_app", label: "Incentive Application" },
  { id: "w9", label: "W-9 / Tax Forms" },
];

const STATUS = {
  pending: { label: "Pending Review", color: "#8B7355", bg: "#FDF6EC", border: "#E8D5B0" },
  in_review: { label: "In Review", color: "#1A5F9E", bg: "#EBF4FF", border: "#BDDAF5" },
  approved: { label: "Approved", color: "#1A7A4A", bg: "#EBF9F1", border: "#A8E4C2" },
  flagged: { label: "Flagged", color: "#B03A2E", bg: "#FEF0EF", border: "#F5C0BC" },
};
