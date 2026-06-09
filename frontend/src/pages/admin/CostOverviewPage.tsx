import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, BarChart3, Search } from 'lucide-react';
import { mockCosts, mockClasses, schoolYears, mockUsers, mockAIProviders, mockGroups } from '@/data/mockData';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const CostOverviewPage: React.FC = () => {
  const { tutors } = useData();
  const [periodFilter, setPeriodFilter] = useState<string>('month');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [tutorFilter, setTutorFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all models for filter
  const allModels = useMemo(() => {
    const models: string[] = [];
    mockAIProviders.forEach(p => {
      p.models.forEach(m => {
        if (!models.includes(m.id)) {
          models.push(m.id);
        }
      });
    });
    return models;
  }, []);

  const filteredCosts = useMemo(() => {
    return mockCosts.filter(cost => {
      const matchesTutor = tutorFilter === 'all' || cost.tutorId === tutorFilter;
      const matchesUser = userFilter === 'all' || cost.userId === userFilter;
      const matchesModel = modelFilter === 'all' || cost.model === modelFilter;
      const matchesSearch = !searchQuery || 
        cost.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cost.tutorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTutor && matchesUser && matchesModel && matchesSearch;
    });
  }, [tutorFilter, userFilter, modelFilter, searchQuery]);

  const totalCost = filteredCosts.reduce((acc, c) => acc + c.cost, 0);
  const totalTokens = filteredCosts.reduce((acc, c) => acc + c.tokens, 0);

  const handleExport = () => {
    // In real app, would generate and download CSV
    console.log('Exporting costs...');
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Kostenübersicht</h1>
            <p className="text-sm text-muted-foreground">
              Detaillierte Aufschlüsselung der API-Kosten
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            CSV exportieren
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="relative w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="year">Dieses Jahr</SelectItem>
              {schoolYears.map(year => (
                <SelectItem key={year} value={year}>Schuljahr {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Person" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Personen</SelectItem>
              {mockUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Klasse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Klassen</SelectItem>
              {mockClasses.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Gruppe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Gruppen</SelectItem>
              {mockGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tutorFilter} onValueChange={setTutorFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tutor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Tutoren</SelectItem>
              {tutors.map(tutor => (
                <SelectItem key={tutor.id} value={tutor.id}>
                  {tutor.icon} {tutor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Modell" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Modelle</SelectItem>
              {allModels.map(model => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamtkosten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">€{totalCost.toFixed(2)}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tokens verbraucht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{totalTokens.toLocaleString()}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ø pro Anfrage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                €{filteredCosts.length > 0 ? (totalCost / filteredCosts.length).toFixed(3) : '0.00'}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Chart Placeholder */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Kostenverlauf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Diagramm-Platzhalter</p>
            </div>
          </CardContent>
        </Card>

        {/* Detail Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Detaillierte Auflistung</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Nutzer</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Modell</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Kosten</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCosts.map(cost => (
                  <TableRow key={cost.id}>
                    <TableCell className="text-sm">
                      {format(cost.timestamp, 'dd.MM.yy HH:mm', { locale: de })}
                    </TableCell>
                    <TableCell className="text-sm">{cost.userName}</TableCell>
                    <TableCell className="text-sm">{cost.tutorName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cost.model}</TableCell>
                    <TableCell className="text-right text-sm">{cost.tokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm font-medium">€{cost.cost.toFixed(3)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CostOverviewPage;
