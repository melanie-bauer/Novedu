# Novedu MVP User Stories

Diese User Stories beschreiben den tatsächlichen MVP für Schüler:innen und
Lehrer:innen einer HTL. Schüler:innen nutzen Tutoren zum Lernen. Lehrer:innen
erstellen und pflegen Tutoren im MVP über `.yaml`-Dateien in einem GitHub-Repo,
die von Novedu geladen werden. Innerhalb der App gibt es im MVP noch keine
klassenbasierte Freigabe und keine Tutor-Erstellungs-UI.

## 1. Mit Schulaccount anmelden

**Als** Nutzer:in der HTL  
**möchte ich** mich mit meinem bestehenden Schulaccount anmelden,  
**damit** ich Novedu ohne separates Passwort nutzen kann.

**Akzeptanzkriterien**
- Login erfolgt über Microsoft Entra ID.
- Es gibt keine lokalen Passwörter.
- Nicht berechtigte Accounts erhalten eine klare Fehlermeldung.
- Im MVP gibt es keine lokale Passwortverwaltung.

## 2. Startseite mit klarem Einstieg sehen

**Als** angemeldete:r Nutzer:in  
**möchte ich** nach dem Einstieg sofort den Chat und die verfügbaren Tutoren erkennen,  
**damit** ich ohne Erklärung loslegen kann.

**Akzeptanzkriterien**
- Die Hauptansicht zeigt Chat, Tutor-Kontext und Eingabebereich.
- Die Oberfläche wirkt wie ein nutzbares Produkt, nicht wie eine technische Demo.
- Die wichtigsten Aktionen sind direkt sichtbar.

## 3. Global verfügbaren Tutor auswählen

**Als** Nutzer:in  
**möchte ich** einen verfügbaren Tutor auswählen,  
**damit** ich gezielt für ein Fach oder Thema lernen kann.

**Akzeptanzkriterien**
- Alle im MVP konfigurierten Tutoren sind für alle angemeldeten Nutzer:innen sichtbar.
- Es gibt keine Klassenfilter oder klassenbasierte Freigabe.
- Tutorname, Fach und Beschreibung sind sichtbar.
- Ein Klick startet einen temporären Chat mit diesem Tutor.

## 4. Mit einem Tutor chatten

**Als** Nutzer:in  
**möchte ich** Fragen in einem Chat stellen,  
**damit** ich Erklärungen, Beispiele und Hilfestellung bekomme.

**Akzeptanzkriterien**
- Eigene Nachrichten und Tutor-Antworten sind klar getrennt.
- Streaming-Antworten zeigen einen Ladezustand.
- Fehler werden verständlich dargestellt.
- Der aktuelle Tutor bleibt während des Chats sichtbar.

## 5. Tutor wechseln

**Als** Nutzer:in  
**möchte ich** den Tutor wechseln können,  
**damit** ich für unterschiedliche Fächer oder Aufgaben passende Unterstützung bekomme.

**Akzeptanzkriterien**
- Ein anderer Tutor kann aus der globalen Tutorenliste gewählt werden.
- Beim Wechsel ist klar, welcher Tutor aktuell aktiv ist.
- Der Wechsel erzeugt einen neuen temporären Chat-Kontext.

## 6. Mathematik korrekt darstellen

**Als** Nutzer:in  
**möchte ich** mathematische Formeln sauber dargestellt bekommen,  
**damit** Rechenwege und Zusammenhänge verständlich bleiben.

**Akzeptanzkriterien**
- Inline- und Block-LaTeX werden gerendert.
- Lange Formeln zerstören das Layout nicht.
- Fehlerhafte Formeln brechen den Chat nicht.

## 7. Code korrekt darstellen

**Als** Nutzer:in  
**möchte ich** Codeblöcke mit Syntax Highlighting sehen,  
**damit** Programmierbeispiele leichter lesbar sind.

**Akzeptanzkriterien**
- Codeblöcke sind visuell klar getrennt.
- Sprache wird angezeigt, wenn sie bekannt ist.
- Code kann kopiert werden.
- Lange Codezeilen bleiben lesbar, ohne das Layout zu sprengen.

## 8. Markdown-Antworten lesen

**Als** Nutzer:in  
**möchte ich** strukturierte Antworten mit Absätzen, Listen und Hervorhebungen lesen,  
**damit** längere Erklärungen übersichtlich bleiben.

**Akzeptanzkriterien**
- Markdown-Absätze, Listen, Links und Hervorhebungen werden korrekt gerendert.
- Unvollständiges oder fehlerhaftes Markdown führt nicht zu einem UI-Abbruch.
- Die Antwort bleibt auch bei längeren Inhalten gut scannbar.

## 9. Dokument temporär anhängen

**Als** Nutzer:in  
**möchte ich** eine Datei an meinen aktuellen Chat anhängen,  
**damit** der Tutor diesen Kontext für die aktuelle Frage verwenden kann.

**Akzeptanzkriterien**
- Unterstützte Dateitypen können ausgewählt werden.
- Dateien werden nur für die aktuelle sichtbare Chat-Session gehalten.
- Dateien werden nicht dauerhaft gespeichert.
- Dateien werden nicht in GitHub, Datenbank, Cookies, localStorage oder sessionStorage persistiert.

## 10. Upload-Limits verstehen

**Als** Nutzer:in  
**möchte ich** klare Hinweise bekommen, wenn eine Datei nicht erlaubt ist,  
**damit** ich weiß, was ich ändern muss.

**Akzeptanzkriterien**
- Dateityp, Größe und Anzahl werden vor dem Senden geprüft.
- Ungültige Dateien werden nicht an den Backend-Kontext übergeben.
- Die Fehlermeldung nennt den konkreten Grund.

## 11. Datei wieder entfernen

**Als** Nutzer:in  
**möchte ich** eine angehängte Datei wieder entfernen können,  
**damit** ich kontrolliere, welcher Kontext verwendet wird.

**Akzeptanzkriterien**
- Jede angehängte Datei kann einzeln entfernt werden.
- Entfernte Dateien werden nicht mehr für neue Antworten verwendet.
- Entfernen verändert nicht bereits gesendete Nachrichten.

## 12. Temporären Chat zurücksetzen

**Als** Nutzer:in  
**möchte ich** den aktuellen Chat zurücksetzen können,  
**damit** ich mit sauberem Kontext neu beginnen kann.

**Akzeptanzkriterien**
- Nachrichten des aktuellen temporären Chats werden entfernt.
- Temporäre Datei-Anhänge werden entfernt.
- Der Reset persistiert keine Historie.

## 13. Tutor als YAML-Datei erstellen

**Als** Lehrer:in  
**möchte ich** einen Tutor als `.yaml`-Datei in einem GitHub-Repo erstellen,  
**damit** passende Lernassistenten für HTL-Fächer entstehen können.

**Akzeptanzkriterien**
- Die YAML-Datei enthält Name, Fach, Beschreibung und Systemprompt.
- Die YAML-Datei enthält Modell-/Provider-Auswahl.
- Feature-Schalter wie LaTeX, Code Rendering und Upload können in YAML konfiguriert werden.
- Die Tutor-Konfiguration wird beim Laden validiert.
- Ein gültiger YAML-Tutor wird im MVP global für alle angemeldeten Nutzer:innen sichtbar.

## 14. Tutor über YAML bearbeiten

**Als** Lehrer:in  
**möchte ich** bestehende Tutor-YAML-Dateien im GitHub-Repo bearbeiten können,  
**damit** Prompts, Modelle und Beschreibungen verbessert werden können.

**Akzeptanzkriterien**
- Prompt, Beschreibung, Modell und Features werden über YAML geändert.
- Die App lädt die aktualisierten Tutor-Konfigurationen aus dem GitHub-Repo.
- Ungültige YAML-Konfigurationen werden beim Laden klar als Fehler erkannt.
- Es gibt im MVP keine separate Test- oder Vorschau-Funktion in der App.
- Es gibt im MVP keine Tutor-Bearbeitungsmaske in der App.

## 15. Tutor global verfügbar machen

**Als** Lehrer:in  
**möchte ich** einen Tutor ohne Klassenauswahl verfügbar machen,  
**damit** der MVP einfach bleibt und alle denselben Tutorbestand sehen.

**Akzeptanzkriterien**
- Es gibt keine Auswahl einzelner Klassen.
- Es gibt keine klassenbasierte Sichtbarkeit.
- Eine gültige Tutor-YAML macht den Tutor für alle angemeldeten Nutzer:innen verfügbar.
- Die UI behauptet nicht, dass ein Tutor nur für bestimmte Klassen gilt.

## 16. Tutor-Konfiguration aus GitHub laden

**Als** Nutzer:in  
**möchte ich** die im GitHub-Repo gepflegten Tutor-Konfigurationen in der App sehen,  
**damit** ich die aktuellen Lernassistenten nutzen kann.

**Akzeptanzkriterien**
- Tutor-Konfigurationen werden aus `.yaml`-Dateien geladen.
- Die App zeigt nur valide Tutor-Konfigurationen oder klare Ladefehler.
- Der MVP bietet keine UI für Versionshistorie, Rollback oder Vergleich.
- Die UI zeigt keine Commit-, Pull-Request- oder GitHub-Bearbeitungsfunktionen.
- Chatverläufe und Uploads werden dadurch nicht gespeichert.

## 17. Lokal gehostete Modelle nutzen

**Als** Betreiber:in der Plattform  
**möchte ich** lokal gehostete Modelle über eine klare Backend-Schnittstelle nutzen,  
**damit** Novedu im MVP nicht von einem Cloud-LLM abhängig ist.

**Akzeptanzkriterien**
- Tutor-YAML referenziert ein lokal verfügbares Modell.
- Frontend kennt keinen konkreten Modell-Endpunkt.
- Backend spricht das lokal gehostete Modell über einen Adapter an.
- Ein späterer Wechsel des Modell-Adapters erfordert keine Änderung im Chat-UI.

## 18. Stabile Chat-Grenze über AG-UI nutzen

**Als** Entwickler:in  
**möchte ich** eine feste Schnittstelle zwischen Frontend und Backend nutzen,  
**damit** UI und Agent Runtime unabhängig voneinander weiterentwickelt werden können.

**Akzeptanzkriterien**
- Chat-Antworten laufen über AG-UI Events.
- Frontend verarbeitet keine provider-spezifischen Antwortformate.
- Stream-Fehler werden als definierte Events übertragen.

## 19. Keine dauerhafte Chat-Historie speichern

**Als** Nutzer:in  
**möchte ich** wissen, dass mein MVP-Chat nicht dauerhaft gespeichert wird,  
**damit** ich die Plattform mit Vertrauen nutzen kann.

**Akzeptanzkriterien**
- Chatverlauf bleibt nur im aktuellen sichtbaren Chat-Kontext.
- Kein Chatverlauf wird in Datenbank, GitHub oder Browser-Storage persistiert.
- Ein Reset entfernt den temporären Verlauf.

## 20. MVP zuverlässig prüfen

**Als** Entwickler:in oder Agent  
**möchte ich** automatisierte Tests für die wichtigsten MVP-Flows,  
**damit** Änderungen sicher und nachvollziehbar bleiben.

**Akzeptanzkriterien**
- Unit Tests decken Schemas, AG-UI und Session-Helfer ab.
- Browser Tests decken Chat UI, Rendering und Upload UI ab.
- Playwright E2E deckt Login-Gate, Tutor-Auswahl, Chat und temporären Upload ab.
- `npm.cmd run verify` bleibt grün.
