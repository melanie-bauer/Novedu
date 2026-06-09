import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, loginWithEntra, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEntraLogin = async () => {
    const success = await loginWithEntra();
    if (success) {
      navigate('/app/chat');
    }
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/app/chat');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Novedu</CardTitle>
            <CardDescription>
              Anmeldung mit Schulaccount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Microsoft Entra ID Button */}
            <Button 
              onClick={handleEntraLogin} 
              disabled={isLoading}
              className="w-full h-12 gap-3"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 21 21" fill="currentColor">
                  <path d="M0 0h10v10H0V0zm11 0h10v10H11V0zM0 11h10v10H0V11zm11 0h10v10H11V11z"/>
                </svg>
              )}
              Mit Microsoft Entra ID anmelden
            </Button>

            <div className="relative">
              <Separator className="my-4" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                oder Demo-Login
              </span>
            </div>

            {/* Demo Login Form */}
            <form onSubmit={handleDemoLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@schule.at"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                variant="outline" 
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Demo-Anmeldung
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-xs font-medium mb-2">Demo-Konten:</p>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="font-medium text-primary">Admin</p>
                  <p className="text-muted-foreground">admin@schule.at</p>
                </div>
                <div>
                  <p className="font-medium text-primary">Lehrer</p>
                  <p className="text-muted-foreground">maria.schmidt@schule.at</p>
                </div>
                <div>
                  <p className="font-medium text-primary">Schüler</p>
                  <p className="text-muted-foreground">anna.bauer@schule.at</p>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="flex justify-center gap-4 text-xs text-muted-foreground pt-2">
              <button className="hover:text-foreground transition-colors">Datenschutz</button>
              <button className="hover:text-foreground transition-colors">AGB</button>
              <button className="hover:text-foreground transition-colors">Hilfe</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
