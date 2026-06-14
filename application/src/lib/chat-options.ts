import type { ScchModel } from "@/lib/mastra/scch";

export type ChatModelOption = ScchModel;

export type DemoTutorOption = {
  id: string;
  title: string;
  description: string;
  model: string;
  imageInput: boolean;
  prompt: string;
};

const FALLBACK_MODEL = "demo-scch-model";

export function buildModelOptions(models: ScchModel[]): ChatModelOption[] {
  if (models.length > 0) {
    return models;
  }

  return [
    {
      id: "demo-scch-model",
      label: "Demo SCCH Modell (nicht verbunden)",
      model: FALLBACK_MODEL,
    },
  ];
}

export function buildDemoTutors(models: ScchModel[]): DemoTutorOption[] {
  const model = models[0]?.model ?? FALLBACK_MODEL;

  return [
    {
      id: "demo-math",
      title: "Demo Mathematik Tutor",
      description:
        "Hilft beim Zerlegen von Rechenwegen und erklaert Loesungen schrittweise.",
      imageInput: false,
      model,
      prompt:
        "Du bist ein geduldiger Mathematik-Tutor fuer Schuelerinnen und Schueler. Erklaere Aufgaben in kleinen Schritten, stelle Rueckfragen, und gib keine Endloesung ohne Herleitung.",
    },
    {
      id: "demo-study-coach",
      title: "Demo Lerncoach",
      description:
        "Unterstuetzt beim Strukturieren von Lernzielen, Zusammenfassungen und Uebungsplaenen.",
      imageInput: false,
      model,
      prompt:
        "Du bist ein strukturierter Lerncoach. Hilf Lernenden, Ziele zu klaeren, Stoff in kleine Einheiten zu teilen und konkrete naechste Schritte zu planen.",
    },
  ];
}

export function findDemoTutor(
  tutors: DemoTutorOption[],
  id: string | null,
): DemoTutorOption | null {
  if (!id) {
    return null;
  }

  return tutors.find((tutor) => tutor.id === id) ?? null;
}
