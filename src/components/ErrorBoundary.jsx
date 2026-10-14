import { Component } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Search, TriangleAlert } from 'lucide-react'
import StatusPage from '@/components/StatusPage'
import { Button } from '@/components/ui/button'

/**
 * Catches render-time crashes below it and shows a friendly page instead of a blank screen.
 * Mount it inside <BrowserRouter> and give it key={pathname} so navigating away clears the error.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info?.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <StatusPage
        code="500"
        icon={TriangleAlert}
        title="Something went wrong"
        message="An unexpected error stopped this page from loading. Try again, or head back to the items."
        details={
          import.meta.env.DEV && (
            <pre className="whitespace-pre-wrap break-all rounded-xl bg-muted p-3 text-left text-xs text-foreground">
              {String(error?.stack || error)}
            </pre>
          )
        }
      >
        <Button variant="ink" onClick={() => this.setState({ error: null })}>
          <RefreshCw /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link to="/"><Search /> Browse all items</Link>
        </Button>
      </StatusPage>
    )
  }
}
