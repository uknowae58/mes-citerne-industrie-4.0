import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
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

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder à votre compte
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
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
                <Link
                  className="text-xs text-primary hover:underline"
                  href="/forgot-password"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full"
                required
              />
            </div>
            <SubmitButton 
              className="w-full" 
              pendingText="Connexion en cours..." 
              formAction={signInAction}
            >
              Se connecter
            </SubmitButton>
            <FormMessage message={searchParams} />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Vous n'avez pas de compte?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-up">
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
