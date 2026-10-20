import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (user) return <Navigate to="/admin" replace />;

  async function onSubmit({ email, password }) {
    setError("");
    try {
      await signIn(email, password);
      navigate("/admin");
    } catch (e) {
      setError(e.message || "Could not sign in");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-4xl">Owner login</CardTitle>
        <CardDescription>
          Only the shop owner can change prices and items.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="grid gap-4"
          >
            <FormField
              name="email"
              label="Email"
              render={({ field }) => (
                <Input type="email" autoComplete="email" {...field} />
              )}
            />
            <FormField
              name="password"
              label="Password"
              render={({ field }) => (
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
              )}
            />
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              variant="ink"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>

            <Link
              to="/"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              ← Back to items
            </Link>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
