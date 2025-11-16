import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/permissions'

export default async function AdminPage() {
  await requireAdmin()
  redirect('/admin/requests')
}
