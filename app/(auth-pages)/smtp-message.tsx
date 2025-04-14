import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="bg-muted/30 px-4 py-3 border rounded-md flex gap-3 text-xs">
      <InfoIcon size={14} className="text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground">
          <strong>Note:</strong> Les emails sont limités. Activez SMTP personnalisé pour augmenter cette limite.
        </p>
        <Link
          href="https://supabase.com/docs/guides/auth/auth-smtp"
          target="_blank"
          className="text-primary hover:text-primary/80 flex items-center gap-1 w-fit"
        >
          En savoir plus <ArrowUpRight size={12} />
        </Link>
      </div>
    </div>
  );
}
