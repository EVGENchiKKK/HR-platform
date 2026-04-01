import { useState } from "react";
import { Download, GridOn, PictureAsPdf, Description } from "@mui/icons-material";
import {
  exportAnalyticsToExcel,
  exportAnalyticsToPdf,
  exportAnalyticsToWord,
} from "../utils/reportExport";
import "./../style/report-export.css";

export function ReportExportPanel({ workspaceData, user, title = "Экспорт отчетов", scopeTitle }) {
  const [exportingType, setExportingType] = useState("");

  const runExport = async (type, handler) => {
    try {
      setExportingType(type);
      await handler({ workspaceData, user, scopeTitle });
    } finally {
      setExportingType("");
    }
  };

  return (
    <div className="report-export-panel">
      <div className="report-export-copy">
        <div className="report-export-icon">
          <Download sx={{ fontSize: 18 }} />
        </div>
        <div>
          <h3 className="report-export-title">{title}</h3>
          <p className="report-export-subtitle">Выгрузка идет из актуальных данных, уже полученных из базы данных.</p>
        </div>
      </div>

      <div className="report-export-actions">
        <button
          type="button"
          className="report-export-button"
          onClick={() => runExport("excel", exportAnalyticsToExcel)}
          disabled={Boolean(exportingType)}
        >
          <GridOn sx={{ fontSize: 16 }} />
          {exportingType === "excel" ? "Формирование..." : "Excel"}
        </button>
        <button
          type="button"
          className="report-export-button"
          onClick={() => runExport("pdf", exportAnalyticsToPdf)}
          disabled={Boolean(exportingType)}
        >
          <PictureAsPdf sx={{ fontSize: 16 }} />
          {exportingType === "pdf" ? "Формирование..." : "PDF"}
        </button>
        <button
          type="button"
          className="report-export-button"
          onClick={() => runExport("word", exportAnalyticsToWord)}
          disabled={Boolean(exportingType)}
        >
          <Description sx={{ fontSize: 16 }} />
          {exportingType === "word" ? "Формирование..." : "Word"}
        </button>
      </div>
    </div>
  );
}

export default ReportExportPanel;
