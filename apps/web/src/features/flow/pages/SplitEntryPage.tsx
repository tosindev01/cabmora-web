import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FlowLightModal } from '@/shared/site';

/**
 * The fork between the two ecosystems.
 *
 * Lives with Flow rather than with the marketing site because it exists
 * *because* Flow exists — without a second product there is nothing to choose
 * between. Putting it here also keeps the modal it opens inside one feature,
 * rather than having marketing reach across for a Flow component.
 *
 * Dismissing it returns to the studio site, which is the assumption a visitor
 * who did not come looking for Flow is already making.
 */
export default function SplitEntryPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-canvas">
      <FlowLightModal
        open={open}
        onClose={() => {
          setOpen(false);
          navigate('/');
        }}
      />
    </div>
  );
}
