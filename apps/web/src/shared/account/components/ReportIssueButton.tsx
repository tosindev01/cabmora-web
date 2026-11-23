import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

import { supportApi } from '@cabmora/api-client';
import { ReportIssueDialog } from '@cabmora/ui';

/**
 * "Report an issue", wherever the chrome wants it.
 *
 * The current path is sent with the report rather than asked for. It is the
 * single most useful thing an engineer wants and the thing a reporter is least
 * likely to supply — "it was on the photos page" covers four routes.
 */
export function ReportIssueButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          'inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-medium text-ink/60 hover:text-ink transition-colors'
        }
      >
        <LifeBuoy size={16} />
        Report an issue
      </button>

      <ReportIssueDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={async (summary, detail) => {
          await supportApi.reportIssue({ summary, detail, page_path: pathname });
        }}
      />
    </>
  );
}
