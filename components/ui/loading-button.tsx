import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LoadingButton({
  children,
  loading = false,
  variant = "default",
  size = "default",
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        children
      )}
    </Button>
  );
} 