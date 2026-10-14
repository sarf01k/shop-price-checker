import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, PackageSearch, Search } from 'lucide-react'
import StatusPage from '@/components/StatusPage'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const previous = document.title
    document.title = 'Page not found'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <StatusPage
      code="404"
      icon={PackageSearch}
      title="Aisle not found"
      message={
        <>
          We couldn't find{' '}
          <code className="break-all rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">{pathname}</code>.
          The link may be wrong, or the page has moved.
        </>
      }
    >
      <Button asChild variant="ink">
        <Link to="/"><Search /> Browse all items</Link>
      </Button>
      {window.history.length > 1 && (
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft /> Go back
        </Button>
      )}
    </StatusPage>
  )
}
