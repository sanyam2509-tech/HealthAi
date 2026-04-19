import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { deleteReport } from "@/services/report-service";

export function DeleteReportButton({ reportId }: { reportId: string }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={async () => {
        await deleteReport(reportId);
        navigate("/dashboard");
      }}
      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
    >
      <Trash2 className="h-4 w-4" />
      Delete report
    </button>
  );
}
