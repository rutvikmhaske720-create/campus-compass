export async function generateMetadata({ params }) {
  const { department } = await params
  const dept = decodeURIComponent(department || '').replace(/-/g, ' ')
  const deptTitle = dept
    ? dept.replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Department'
  return {
    title: `${deptTitle} Dashboard`,
    description: `Dashboard for the ${deptTitle} department — manage schedules, faculty, rooms, and activities.`,
  }
}

export default function DepartmentDashboardLayout({ children }) {
  return children
}
