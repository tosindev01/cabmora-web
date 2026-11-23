import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

import { supportApi } from '@cabmora/api-client';
import { ReportIssueDialog } from '@cabmora/ui';

/**
 * The console's own "report an issue".
 *
 * The same dialog the customer portal uses, from `@cabmora/ui`, wired to the
 * same endpoint — staff reports land in the same inbox as everyone else's.
 * Two queues would mean two places to forget to look.
 */
export function ReportIssueButton() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report an issue"
        title="Report an issue"
        className="p-2 rounded-full text-ink/70 hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
      >
        <LifeBuoy size={20} />
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
