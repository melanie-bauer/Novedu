import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Settings, 
  Key, 
  Check, 
  X,
  Pencil,
  Plus,
  Zap,
  Trash2,
} from 'lucide-react';
import { mockAIProviders } from '@/data/mockData';
import { AIProvider, AIModel } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ProviderManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<AIProvider[]>(mockAIProviders);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProviderForm, setNewProviderForm] = useState({ name: '' });
  const [addingModelToProvider, setAddingModelToProvider] = useState<string | null>(null);
  const [newModelForm, setNewModelForm] = useState({
    name: '',
    description: '',
    costPer1kTokens: 0.001,
    maxTokens: 4096,
  });

  const handleToggleProvider = (providerId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, isEnabled: !p.isEnabled } : p
    ));
    toast({ title: 'Anbieter aktualisiert' });
  };

  const handleToggleModel = (providerId: string, modelId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { 
            ...p, 
            models: p.models.map(m => 
              m.id === modelId ? { ...m, isEnabled: !m.isEnabled } : m
            )
          } 
        : p
    ));
    toast({ title: 'Modell aktualisiert' });
  };

  const handleSaveApiKey = () => {
    if (editingProvider && apiKeyInput) {
      setProviders(prev => prev.map(p => 
        p.id === editingProvider.id 
          ? { ...p, apiKeyConfigured: true } 
          : p
      ));
      toast({ title: 'API-Schlüssel gespeichert' });
      setEditingProvider(null);
      setApiKeyInput('');
    }
  };

  const handleAddProvider = () => {
    if (newProviderForm.name) {
      const newProvider: AIProvider = {
        id: `provider-${Date.now()}`,
        name: newProviderForm.name,
        apiKeyConfigured: false,
        isEnabled: false,
        models: [],
      };
      setProviders(prev => [...prev, newProvider]);
      toast({ title: 'Anbieter hinzugefügt' });
      setIsAddingProvider(false);
      setNewProviderForm({ name: '' });
    }
  };

  const handleDeleteProvider = (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));
    toast({ title: 'Anbieter gelöscht' });
  };

  const handleAddModel = () => {
    if (addingModelToProvider && newModelForm.name) {
      const newModel: AIModel = {
        id: `model-${Date.now()}`,
        name: newModelForm.name,
        providerId: addingModelToProvider,
        description: newModelForm.description,
        costPer1kTokens: newModelForm.costPer1kTokens,
        maxTokens: newModelForm.maxTokens,
        isEnabled: true,
      };
      setProviders(prev => prev.map(p => 
        p.id === addingModelToProvider 
          ? { ...p, models: [...p.models, newModel] } 
          : p
      ));
      toast({ title: 'Modell hinzugefügt' });
      setAddingModelToProvider(null);
      setNewModelForm({ name: '', description: '', costPer1kTokens: 0.001, maxTokens: 4096 });
    }
  };

  const handleDeleteModel = (providerId: string, modelId: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, models: p.models.filter(m => m.id !== modelId) } 
        : p
    ));
    toast({ title: 'Modell gelöscht' });
  };

  const enabledModelsCount = providers
    .filter(p => p.isEnabled && p.apiKeyConfigured)
    .reduce((acc, p) => acc + p.models.filter(m => m.isEnabled).length, 0);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">KI-Modelle & Anbieter</h1>
          <p className="text-sm text-muted-foreground">
            Konfiguriere die verfügbaren KI-Anbieter und Modelle für deine Schule
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{enabledModelsCount}</p>
                <p className="text-sm text-muted-foreground">Aktive Modelle verfügbar</p>
              </div>
            </div>
            <Button onClick={() => setIsAddingProvider(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Anbieter hinzufügen
            </Button>
          </CardContent>
        </Card>

        {/* Providers */}
        <div className="space-y-4">
          {providers.map(provider => (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-semibold text-sm">
                      {provider.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {provider.apiKeyConfigured ? (
                          <Badge variant="secondary" className="text-[10px]">
                            <Check className="w-3 h-3 mr-1" />
                            API-Schlüssel konfiguriert
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-destructive">
                            <X className="w-3 h-3 mr-1" />
                            API-Schlüssel fehlt
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingProvider(provider);
                        setApiKeyInput('');
                      }}
                    >
                      <Key className="w-4 h-4 mr-1" />
                      API-Schlüssel
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => handleDeleteProvider(provider.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <Switch
                      checked={provider.isEnabled}
                      onCheckedChange={() => handleToggleProvider(provider.id)}
                      disabled={!provider.apiKeyConfigured}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="models" className="border-none">
                    <AccordionTrigger className="py-2 text-sm">
                      {provider.models.length} Modelle ({provider.models.filter(m => m.isEnabled).length} aktiv)
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Modell</TableHead>
                            <TableHead>Beschreibung</TableHead>
                            <TableHead>Kosten/1k Tokens</TableHead>
                            <TableHead>Max. Tokens</TableHead>
                            <TableHead className="w-[80px]">Aktiv</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {provider.models.map(model => (
                            <TableRow key={model.id}>
                              <TableCell className="font-medium">{model.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                {model.description}
                              </TableCell>
                              <TableCell>€{model.costPer1kTokens.toFixed(4)}</TableCell>
                              <TableCell>{model.maxTokens.toLocaleString()}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={model.isEnabled}
                                  onCheckedChange={() => handleToggleModel(provider.id, model.id)}
                                  disabled={!provider.isEnabled || !provider.apiKeyConfigured}
                                />
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm"
                                  onClick={() => handleDeleteModel(provider.id, model.id)}
                                >
                                  <Trash2 className="w-3 h-3 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="p-3 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setAddingModelToProvider(provider.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Modell hinzufügen
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Hinweis:</strong> Nur aktive Modelle von aktivierten Anbietern mit konfiguriertem API-Schlüssel 
              stehen Lehrern zur Auswahl bei der Tutor-Erstellung zur Verfügung. Kosten werden pro 1000 verarbeitete Tokens berechnet.
            </p>
          </CardContent>
        </Card>

        {/* API Key Dialog */}
        <Dialog open={!!editingProvider} onOpenChange={() => setEditingProvider(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>API-Schlüssel für {editingProvider?.name}</DialogTitle>
              <DialogDescription>
                Gib den API-Schlüssel ein, um diesen Anbieter zu aktivieren.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API-Schlüssel</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Der Schlüssel wird sicher gespeichert und nicht im Klartext angezeigt.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingProvider(null)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveApiKey} disabled={!apiKeyInput}>
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Provider Dialog */}
        <Dialog open={isAddingProvider} onOpenChange={setIsAddingProvider}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Anbieter hinzufügen</DialogTitle>
              <DialogDescription>
                Füge einen neuen KI-Anbieter hinzu und konfiguriere dessen API-Schlüssel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="providerName">Anbietername</Label>
                <Input
                  id="providerName"
                  placeholder="z.B. Mistral, Cohere, etc."
                  value={newProviderForm.name}
                  onChange={(e) => setNewProviderForm({ name: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingProvider(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddProvider} disabled={!newProviderForm.name}>
                Hinzufügen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Model Dialog */}
        <Dialog open={!!addingModelToProvider} onOpenChange={() => setAddingModelToProvider(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neues Modell hinzufügen</DialogTitle>
              <DialogDescription>
                Füge ein neues Modell zu diesem Anbieter hinzu.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelName">Modellname</Label>
                <Input
                  id="modelName"
                  placeholder="z.B. gpt-5.5, claude-sonnet-4-6"
                  value={newModelForm.name}
                  onChange={(e) => setNewModelForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelDesc">Beschreibung</Label>
                <Input
                  id="modelDesc"
                  placeholder="Kurze Beschreibung des Modells"
                  value={newModelForm.description}
                  onChange={(e) => setNewModelForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelCost">Kosten/1k Tokens (€)</Label>
                  <Input
                    id="modelCost"
                    type="number"
                    step="0.0001"
                    value={newModelForm.costPer1kTokens}
                    onChange={(e) => setNewModelForm(prev => ({ ...prev, costPer1kTokens: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelTokens">Max. Tokens</Label>
                  <Input
                    id="modelTokens"
                    type="number"
                    value={newModelForm.maxTokens}
                    onChange={(e) => setNewModelForm(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddingModelToProvider(null)}>
                Abbrechen
              </Button>
              <Button onClick={handleAddModel} disabled={!newModelForm.name}>
                Hinzufügen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProviderManagementPage;