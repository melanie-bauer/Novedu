import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { TutorConfig } from '@/types';
import TutorEditor from './TutorEditor';
import { subjectColors, mockClasses, mockUsers } from '@/data/mockData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TutorManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorManager: React.FC<TutorManagerProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { tutors, toggleTutor, deleteTutor } = useData();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<TutorConfig | null>(null);
  const [deletingTutor, setDeletingTutor] = useState<TutorConfig | null>(null);

  const myTutors = tutors.filter(t => t.createdBy === user?.id);

  const handleEdit = (tutor: TutorConfig) => {
    setEditingTutor(tutor);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingTutor(null);
    setIsEditorOpen(true);
  };

  const handleDelete = () => {
    if (deletingTutor) {
      deleteTutor(deletingTutor.id);
      setDeletingTutor(null);
    }
  };

  const getAssignmentInfo = (tutor: TutorConfig) => {
    const classCount = tutor.assignedClasses.length;
    const studentCount = tutor.assignedStudents.length;
    return { classCount, studentCount };
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Tutoren verwalten</DialogTitle>
            <DialogDescription>
              Erstelle und verwalte deine KI-Tutoren
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
            <Button onClick={handleCreate} size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              Neuer Tutor
            </Button>
          </div>

          <ScrollArea className="max-h-[400px] pr-2">
            {myTutors.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Noch keine Tutoren erstellt
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {myTutors.map(tutor => {
                  const { classCount, studentCount } = getAssignmentInfo(tutor);
                  const colorClass = subjectColors[tutor.subject] || subjectColors.default;
                  
                  return (
                    <div
                      key={tutor.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{tutor.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{tutor.name}</span>
                            <Badge variant="outline" className={colorClass + ' text-[10px]'}>
                              {tutor.subject}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {tutor.description}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {classCount} Klassen, {studentCount} Schüler
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={tutor.isEnabled}
                            onCheckedChange={() => toggleTutor(tutor.id)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 h-7 text-xs"
                          onClick={() => handleEdit(tutor)}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Bearbeiten
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => setDeletingTutor(tutor)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <TutorEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        tutor={editingTutor}
      />

      <AlertDialog open={!!deletingTutor} onOpenChange={() => setDeletingTutor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutor löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du "{deletingTutor?.name}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TutorManager;
