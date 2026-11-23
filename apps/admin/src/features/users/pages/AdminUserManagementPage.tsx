import { AccountList } from '@/features/users/components/AccountList';

/**
 * The people Cabmora serves: customers who book work, and the partner
 * creators who deliver their own clients' projects through the platform.
 *
 * Cabmora's own staff are on /admin/team. They are split because the two are
 * managed for different reasons — this screen is a customer record, that one
 * is an access decision — and because a coordinator buried on page three of a
 * list of clients is a person nobody remembers still has the keys.
 */
export default function AdminUserManagementPage() {
  return (
    <AccountList
      group="client"
      heading="User Management"
      blurb="Review new applications, change roles, and suspend or reinstate accounts."
      addLabel="Add a client"
      empty="No accounts match these filters."
    />
  );
}
