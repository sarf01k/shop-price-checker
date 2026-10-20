import { useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { LogOut, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const urlQ = params.get("q") ?? "";

  const [q, setQ] = useState(urlQ);
  const debounced = useDebounce(q, 200);
  const lastPushed = useRef(urlQ);

  // URL -> input, only for external changes (back button, clear-search, shared link)
  useEffect(() => {
    if (urlQ !== lastPushed.current) {
      lastPushed.current = urlQ;
      setQ(urlQ);
    }
  }, [urlQ]);

  useEffect(() => {
    if (pathname !== "/" || debounced.trim() === lastPushed.current) return;
    lastPushed.current = debounced.trim();
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debounced.trim()) next.set("q", debounced.trim());
        else next.delete("q");
        return next;
      },
      { replace: true },
    );
  }, [debounced, pathname, setParams]);

  function onSubmit(e) {
    e.preventDefault();
    const value = q.trim();
    lastPushed.current = value;
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    navigate({ pathname: "/", search: next.toString() });
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pb-7 pt-4 md:gap-x-6 md:px-12">
      <Link
        to="/"
        className="whitespace-nowrap font-display text-3xl leading-none tracking-wide text-background sm:text-4xl"
      >
        YAA JOYCE<span className="text-ink"> SHOP</span>
      </Link>

      <form
        role="search"
        onSubmit={onSubmit}
        className="order-last flex w-full gap-2 md:order-0 md:mx-auto md:w-auto md:max-w-xl md:flex-1"
      >
        <Input
          type="search"
          placeholder="Search items…"
          aria-label="Search items"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-full border-transparent px-5"
        />
        <Button type="submit" variant="ink">
          <Search /> Search
        </Button>
      </form>

      <nav className="ml-auto flex items-center gap-1 font-bold">
        {user ? (
          <>
            {pathname !== "/admin" && (
              <Button asChild variant="ghost" className="max-sm:px-3">
                <Link to="/admin">
                  <ShieldCheck />
                  <span className="max-sm:sr-only">Admin</span>
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              className="max-sm:px-3"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut />
              <span className="max-sm:sr-only">Logout</span>
            </Button>
          </>
        ) : (
          <Button asChild variant="ghost">
            <Link to="/login">Owner</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
