import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Save, RotateCcw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const GlobalPromptPage: React.FC = () => {
  const { user } = useAuth();
  const { globalSettings, updateGlobalSettings } = useData();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState(globalSettings.systemPrompt);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (value: string) => {
    setPrompt(value);
    setHasChanges(value !== globalSettings.systemPrompt);
  };

  const handleSave = () => {
    updateGlobalSettings({
      systemPrompt: prompt,
      lastModifiedBy: user?.name || 'Admin',
    });
    setHasChanges(false);
    toast({ title: 'Globaler Systemprompt gespeichert' });
  };

  const handleReset = () => {
    setPrompt(globalSettings.systemPrompt);
    setHasChanges(false);
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Globaler Systemprompt</h1>
          <p className="text-sm text-muted-foreground">
            Dieser Prompt wird allen Tutoren zusätzlich mitgegeben
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Systemprompt (immer aktiv)</CardTitle>
            <CardDescription>
              Letzte Änderung von {globalSettings.lastModifiedBy} am{' '}
              {format(globalSettings.lastModifiedAt, 'dd.MM.yyyy HH:mm', { locale: de })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => handleChange(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              placeholder="Gib hier den globalen Systemprompt ein..."
            />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Dieser Prompt wird jedem Tutor/Modell zusätzlich mitgegeben und kann nicht von Lehrern deaktiviert werden.
                Verwende ihn für schulweite Richtlinien und Verhaltensregeln.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-end gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={!hasChanges}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Zurücksetzen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Änderungen verwerfen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Alle nicht gespeicherten Änderungen gehen verloren.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>
                      Zurücksetzen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tipps für den globalen Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Definiere grundlegende Verhaltensregeln für alle KI-Tutoren</p>
            <p>• Lege fest, welche Themen tabu sind</p>
            <p>• Bestimme, wie mit sensiblen Daten umgegangen werden soll</p>
            <p>• Formuliere klare Anweisungen für den Umgang mit Hausaufgaben</p>
            <p>• Weise auf Datenschutz und Sicherheitsrichtlinien hin</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GlobalPromptPage;
