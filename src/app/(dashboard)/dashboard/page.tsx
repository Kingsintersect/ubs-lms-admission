import { loginSessionKey } from '@/config';
import { verifySession } from '@/lib/server.utils';
import { redirect } from 'next/navigation';

const Dashboard = async () => {
   const session = await verifySession(loginSessionKey);
   const basePath = `/dashboard/${(session.user.role).toLowerCase()}`;

   return redirect(`${basePath}`);
}

export default Dashboard
