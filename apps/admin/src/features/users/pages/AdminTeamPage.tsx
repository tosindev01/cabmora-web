import { AccountList } from '@/features/users/components/AccountList';

/**
 * Cabmora's own people, and what they can reach.
 *
 * Every account on this screen can open somebody's client work: a coordinator
 * the shoots they are on, an administrator everything there is. That is the
 * whole reason it is a screen of its own rather than a filter on the client
 * list — this is the list you audit, and a list you audit should not need a
 * dropdown set correctly before it tells the truth.
 */
export default function AdminTeamPage() {
  return (
    <AccountList
      group="team"
      heading="Team"
      blurb="Cabmora staff. Everyone here can open client work — coordinators the shoots they are on, administrators all of it."
      addLabel="Add a colleague"
      empty="No staff accounts match these filters. Change someone's role under User Management to add them."
    />
  );
}
