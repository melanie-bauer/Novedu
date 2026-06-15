# Lehrer einfügen

1. Gehen Sie auf `portal.azure.com` und melden sie sich mit Ihrer HTL-Email an.
2. Navigieren Sie zu Entra ID -> Users.
3. Oben gibt es den Button "Download Users (Preview)". Drücken Sie den, nennen Sie die Datei "UserList" und starten Sie die bulk operation.
4. Warten Sie kurz und klicken Sie unten auf "Click here to view the status of each operation". Wählen Sie Ihre Operation aus und laden Sie diese herunter.
5. Fügen Sie diese in `/csv/input`. (bzw. ersetzen Sie die bereits vorhande Template `UserList.csv`)
6. Führen Sie nun das Python-Script `extract-teachers.py` aus. Bitte sorgen Sie dafür, dass alle Libraries installiert sind, auf die gehe ich hier nicht genauer ein.
7. Sie erhalten in /csv/output eine Datei namens `teachers.csv`.
8. Gehen sie auf Open WebUI -> Admin-Bereich. Nun sollten Sie im Bereich Benutzer sein. Drücken Sie oben rechts auf das Plus -> CSV-Import und wählen Sie `teachers.csv` aus. Warten sie kurz und nach und nach werden alle Benutzer eingefügt.

# Schüler einfügen

1. Führen Sie PRE-1 & PRE-2 aus falls noch nicht getan. (Weiter unten zu finden...)
2. Führen Sie `extract-user.py` aus.
3. Sie erhalten in /csv/output eine Datei namens `users.csv`.
4. Gehen sie auf Open WebUI -> Admin-Bereich. Nun sollten Sie im Bereich Benutzer sein. Drücken Sie oben rechts auf das Plus -> CSV-Import und wählen Sie `users.csv` aus. Warten sie kurz und nach und nach werden alle Benutzer eingefügt.


# Schüler zu Gruppen hinzufügen.
## **ACHTUNG:** Nicht möglich wenn die Schüler nicht angelegt sind!

1. Führen Sie PRE-1 & PRE-2 aus falls noch nicht getan. (Weiter unten zu finden...)
2. Legen Sie alle Schüler an wenn noch nicht getan. (Die Anleitung ist direkt über der zu finden.)
3. Führen Sie `assign-groups.py` aus.
4. Melden Sie sich unter `portal.azure.com` mit Ihrer Mail an, auf dessen Azure Novedu gehostet ist.
5. Gehen Sie auf Storage Accounts -> novedustorage -> File Shares -> openwebui-fileshare -> Browse.
6. LADEN SIE DIE AKTUELLE DATEI HERUNTER! BACKUP, FALLS ES NICHT MEHR FUNKTIONIERT DANACH! Danke.
7. Drücken Sie Upload, laden Sie webui.db hoch und drücken Sie "Overwrite if files already exist."
8. Warten Sie einen kurzen Moment, schauen Sie auf OWUI und überprüfen Sie ob alles geht wie gewünscht.

# Schülergruppen aus Azure Entra ID exportieren (PRE-1)

1. Melden Sie sich unter `portal.azure.com` mit Ihrer HTL-Email an.
2. Navigieren Sie auf Entra ID -> Groups.
3. Klicken Sie auf die Zahl neben "Total Groups".
4. Filtern Sie nun oben nach "Alle Schüler/innen".
5. Navigieren Sie auf eine beliebige Gruppe die sie herunterladen möchten, scrollen Sie runter, drücken Sie auf "View group members", drücken Sie oben auf "Bulk operations" -> "Download members" -> Nennen Sie die Datei so wie die Gruppe in OWUI heißen soll und drücken Sie anschließend auf "Start bulk operation".
6. Warten Sie kurz und klicken Sie unten auf "Click here to view the status of each operation". Wählen Sie Ihre Operation aus und laden Sie diese herunter.
7. Wiederholen Sie Schritt 5-6 für jede Gruppe die es gibt unter den Filtereinstellungen.
8. Fügen Sie diese in csv/input/groups ein.

# DB aus Azure exportieren (PRE-2)

1. Melden Sie sich unter `portal.azure.com` mit Ihrer Mail an, auf dessen Azure Novedu gehostet ist.
2. Gehen Sie auf Storage Accounts -> novedustorage -> File Shares -> openwebui-fileshare -> Browse. Laden Sie webui.db herunter.
3. Fügen Sie diese im root-verzeichnis ein. (Ersetzen sie den Platzhalter webui.db)