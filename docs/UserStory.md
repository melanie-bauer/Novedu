# User Stories

## Epic 1 – Lehrer:innen

### Story 1.1 – Tutor mit eigenem System Prompt anlegen  
**User Story**  
Als Fachlehrer:in (Mathematik/Deutsch/Programmieren) möchte ich durch einen eigenen System-Prompt einen KI-Tutor anlegen, damit dieser meinem Ansatz und den Klassenregeln folgt.

**Acceptance Criteria / Definition of Done**  
- Ich kann als authentifizierte:r Lehrer:in einen "Neues Modell“-Screen öffnen.  
- Ich kann mindestens Tutor-Name, Fach, Kurzbeschreibung und System Prompt eingeben.  
- Nach dem Speichern erscheint der Tutor in meiner persönlichen Tutor-Liste.  
- Der Tutor kann für mindestens eine meiner Klassen aktiviert werden.  
- Schüler:innen in dieser Klasse können den Tutor sehen und nutzen.
---


### Story 1.2 – LLM pro Tutor auswählen  
**User Story**  
Als Lehrer:in möchte ich für jeden meiner Tutoren das zugrundeliegende LLM-Modell auswählen können, damit ich Qualität, Geschwindigkeit und Kosten für meinen Anwendungsfall ausbalancieren kann.

**Acceptance Criteria**  
- Beim Anlegen/Bearbeiten eines Tutors kann ich ein LLM aus einer Liste verfügbarer Modelle wählen.  
- Verfügbare Modelle sind auf jene begrenzt, die die Schul-IT freigeschaltet hat.  
- Das ausgewählte Modell wird in der Tutor-Konfiguration gespeichert.  
- Anfragen dieses Tutors werden immer an das gewählte Modell gesendet.

---

## Epic 2 – Tutor-Nutzung durch Schüler:innen & UI

### Story 2.1 – Schüler:in nutzt einen zugewiesenen Tutor  
**User Story**  
Als Schüler:in möchte ich die meinen Klassen zugewiesenen KI-Tutoren nutzen können, damit ich Unterstützung beim Lernen und beim Lösen von Aufgaben bekomme.

**Acceptance Criteria**  
- Nach dem Login sehe ich eine Liste der Tutoren, die meinen Klassen zugeordnet sind.  
- Ich kann einen Tutor auswählen, einen Chat öffnen und Textnachrichten senden.  
- Ich erhalte Antworten des LLM über die Plattform.  
- Ich kann keine Tutor-Einstellungen (Model, Prompt, Budgets) verändern.

---

### Story 2.2 – Texte und Bilder (z.B. Fotos) an Tutor schicken  
**User Story**  
Als Schüler:in möchte ich sowohl Text als auch Bilder (z.B. Fotos meiner handschriftlichen Arbeiten) an meinen Tutor senden können, damit ich Feedback zu meinen eigenen Lösungen erhalte.

**Acceptance Criteria**  
- Im Chat-UI kann ich mindestens ein Bild (Foto) hochladen.  
- Die Tutor-Antwort kann sich auf den Inhalt des Bildes beziehen.  
- Falls der Upload fehlschlägt, erhalte ich eine verständliche Fehlermeldung.

---

### Story 2.3 – Mathematische Formeln und Quellcode korrekt anzeigen  
**User Story**  
Als Schüler:in möchte ich, dass mathematische Formeln und Code-Snippets korrekt angezeigt werden, damit ich die Erklärungen des Tutors gut lesen und verstehen kann.

**Acceptance Criteria**  
- Wenn der Tutor Formeln (z.B. LaTeX/MathML) sendet, werden diese in lesbarer mathematischer Form gerendert.  
- Code-Blöcke werden mit Monospace-Schrift und korrekter Einrückung dargestellt.  
- Beim Kopieren von Code aus der UI bleiben Formatierung und Einrückungen erhalten.

---

### Story 2.4 – Desktop- und Mobile-Nutzung  
**User Story**  
Als Schüler:in möchte ich den KI-Tutor sowohl am Desktop als auch auf mobilen Geräten komfortabel nutzen können, damit ich in der Schule und unterwegs lernen kann.

**Acceptance Criteria**  
- Das UI ist auf typischen Desktop-Auflösungen gut nutzbar (kein Layout-Bruch, Scrollen funktioniert).  
- Auf mobilen Bildschirmen sind Navigation und Chat weiterhin gut nutzbar (responsive Layout).  
- Wichtige Funktionen (Senden, Upload, Verlauf ansehen) sind auch mobil erreichbar.

---

## Epic 3 – Budgetkontrolle & Transparenz

### Story 3.1 – Budgets pro Klasse und Zeitraum definieren  
**User Story**  
Als Schuladministrator:in möchte ich Token- oder Kostenbudgets pro Klasse und Zeitraum (Stunde/Tag/Woche/Monat) festlegen können, damit die KI-Nutzung innerhalb unserer finanziellen Grenzen bleibt.

**Acceptance Criteria**  
- Ich kann eine Klasse auswählen und ein Budget mit Betrag und Zeitraum (z.B. 10 € pro Woche oder N Tokens pro Tag) definieren.  
- Der gesamte Tutor- und API-Gebrauch dieser Klasse wird auf dieses Budget angerechnet.  
- Ist das Budget ausgeschöpft, werden weitere Anfragen blockiert oder gemäß einer konfigurierbaren Policy herabgestuft.  
- Bei Änderungen wird das neue Limit für zukünftige Nutzung angewendet.

---

### Story 3.2 – Tokens/Kosten gegen Budget zählen  
**User Story**  
Als Systemverantwortliche:r möchte ich, dass jede LLM-Nutzung (inklusive der API-Keys für Programmierklassen) auf die jeweils passenden Budgets angerechnet wird, damit die Kosten planbar bleiben.

**Acceptance Criteria**  
- Für jede Anfrage werden Tokens/Kosten anhand der Provider-Daten berechnet.  
- Nutzung wird pro Klasse und optional pro Nutzer:in aggregiert.  
- API-Key-basierte Nutzung wird der korrekten Klasse/Person zugeordnet und mitgezählt.

---

### Story 3.3 – Budget-Transparenz für Schüler:innen & Lehrer:innen  
**User Story**  
Als Schüler:in oder Lehrer:in möchte ich meine aktuelle KI-Nutzung und das verbleibende Budget einsehen können, damit ich KI verantwortungsvoll nutze.

**Acceptance Criteria**  
- Ich kann eine „Usage / Budget“-Ansicht im UI öffnen.  
- Schüler:innen sehen mindestens ihre persönliche Nutzung und das verbleibende Klassenbudget.  
- Lehrer:innen sehen ihre eigene Nutzung und die Klassen-Nutzung für ihre Klassen.  
- Daten werden mindestens nahezu in Echtzeit aktualisiert.

---

### Story 3.4 – Dashboard für Schulleitung  
**User Story**  
Als Schulleitung möchte ich die gesamte Budgetnutzung pro Klasse in einem Dashboard sehen können, damit ich Nutzung und Kosten überwachen kann.

**Acceptance Criteria**  
- Ich kann das Dashboard nach Zeitraum filtern (z.B. Woche, Monat, Semester).  
- Pro Klasse sehe ich Gesamt-Tokens/Kosten und verbleibendes Budget.  
- Ich kann die Daten z.B. als CSV oder PDF exportieren.

---

### Story 3.5 – Nur Budgetstatistiken speichern (Datenschutz)  
**User Story**  
Als für den Datenschutz Verantwortliche:r möchte ich, dass die Plattform nur Budget-Nutzungsstatistiken und nicht den vollständigen Gesprächsinhalt speichert, damit das System datenschutzkonform bleibt.

**Acceptance Criteria**  
- Nachrichtentexte (Prompts/Completions) werden nicht dauerhaft in der Datenbank gespeichert, nur Nutzungsmetriken.  
- Die Systemdokumentation beschreibt klar, welche Daten gespeichert werden.  
- Tests stellen sicher, dass Logs keine Klartext-Nachrichten enthalten.

---


## Epic 4 – Code Interpreter & fachliche Unterstützung

### Story 4.1 – Code Interpreter für mathematische Aufgaben  
**User Story**  
Als Mathematik-Lehrer:in möchte ich, dass mein KI-Tutor Code ausführen kann (z.B. für Berechnungen oder Diagramme), damit Schüler:innen komplexe Probleme mit korrekten Berechnungen erkunden können.

**Acceptance Criteria**  
- Für einen gegebenen Mathe-Tutor kann „Code Interpreter“ in der Konfiguration aktiviert/deaktiviert werden.  
- Ist er aktiviert, kann der Tutor Code-Snippets in einer sicheren Umgebung ausführen (z.B. Python-Sandbox).  
- Der Tutor kann Ergebnisse (Zahlen, Plots, Tabellen) in seine Erklärungen einbauen.  
- Bei Fehlern in der Code-Ausführung gibt es eine verständliche Fehlermeldung statt eines Absturzes.

---

## Epic 5 – Authentifizierung, LLM-Provider & Infrastruktur

### Story 5.1 – SSO mit bestehenden Schulaccounts  
**User Story**  
Als Lehrer:in oder Schüler:in möchte ich mich über unseren bestehenden Schulaccount (z.B. Entra ID) anmelden können, damit ich kein eigenes Benutzerkonto mit Passwort für die KI-Plattform benötige.

**Acceptance Criteria**  
- Ich kann mich mit meinen Schul-SSO-Zugangsdaten anmelden (z.B. via SAML/OAuth/OpenID Connect).
- Nach der Anmeldung werde ich basierend auf meiner Rolle (Lehrer:in/Schüler:in) zur entsprechenden UI weitergeleitet.
- Falls mein Account keine gültige Rolle hat, erhalte ich eine sinnvolle Fehlermeldung.

---

### Story 5.2 – Azure OpenAI anbinden  
**User Story**  
Als IT-Administrator:in möchte ich eine Azure-OpenAI-Verbindung konfigurieren und testen können, damit die Plattform mindestens einen konformen LLM-Provider verwenden kann.

**Acceptance Criteria**  
- Es gibt ein Admin-UI oder eine Konfigurationsdatei für Azure-Endpoint, Deployment und Key.  
- Ein Test-Request prüft die Verbindung und zeigt Model-Details an.  
- Lehrer:innen können Azure-Modelle bei der Tutor-Konfiguration auswählen.

---

### Story 5.3 – Mehrere LLM-Provider konfigurieren  
**User Story**  
Als IT-Administrator:in möchte ich mehrere LLM-Provider (Azure OpenAI, OpenAI, Claude, Gemini, Mistral) konfigurieren und steuern können, welche Modelle verfügbar sind, damit die Schule den besten Mix aus Performance, Kosten und Compliance wählen kann.

**Acceptance Criteria**  
- Ich kann Provider mit Zugangsdaten und Regions-Informationen hinzufügen/bearbeiten.  
- Ich kann einzelne Provider und Modelle aktivieren/deaktivieren.  
- Nur aktivierte Modelle erscheinen in der Model-Auswahl für Lehrkräfte.

---

### Story 5.4 – Betrieb in EU-Rechenzentren / On-Premise  
**User Story**  
Als IT-Administrator:in möchte ich die Plattform vollständig in europäischen Rechenzentren oder On-Premise mit Open-Source-Komponenten betreiben können, damit das System die lokalen Datenschutzgesetze einhält.

**Acceptance Criteria**  
- Es existiert Deploy-Dokumentation für mindestens einen EU-Cloud-Provider und On-Premise.  
- Alle Kernkomponenten (außer dem LLM selbst) sind Open Source.  
- Plattformdaten werden nur an die konfigurierten LLM-APIs gesendet und nicht an sonstige Non-EU-Infrastruktur.

---

### Story 5.5 – Konfiguration für andere Schulen wiederverwendbar  
**User Story**  
Als Administrator:in einer anderen Schule möchte ich die Plattform (Schulname, Klassen, LLM-Provider, Budgets) ohne Code-Änderungen konfigurieren können, damit wir die Lösung einfach übernehmen können.

**Acceptance Criteria**  
- Es gibt ein Konfigurations-UI oder deklarative Konfigurationsdateien für schul-spezifische Einstellungen.  
- Im Code gibt es keine hart codierten Referenzen auf eine bestimmte Schule (z.B. HTL Leonding).  
- Eine frische Installation kann für eine neue Schule ohne Code-Anpassung konfiguriert werden.
