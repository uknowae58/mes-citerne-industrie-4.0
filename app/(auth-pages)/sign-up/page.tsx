import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
          <CardDescription className="text-center">
            Créez un compte pour accéder à la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email"
                name="email" 
                type="email"
                placeholder="vous@exemple.com" 
                className="w-full" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full"
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Au moins 6 caractères
              </p>
            </div>
            <SubmitButton 
              className="w-full"
              formAction={signUpAction} 
              pendingText="Inscription en cours..."
            >
              S'inscrire
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Vous avez déjà un compte?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-in">
              Se connecter
            </Link>
          </p>
          <SmtpMessage />
        </CardFooter>
      </Card>
    </div>
  );
}
