# USER TESTING REPORT

**Produkt:** Tagesspiegel Filter Browser Extension  
**Persona:** Persona B (First-Time User) — Sam, 24, tech-comfortable mit Consumer Apps, wenig Erfahrung mit B2B/technical tools  
**Session Datum:** 28. März 2026  
**Tester Agent:** USER-TESTER v1.0 (simuliert durch ux-researcher Agent)

---

## Executive Summary

Die Extension bietet einen klaren Mehrwert für Vielleser des Tagesspiegel, indem sie das Ausblenden von Sektionen ermöglicht. Die größte Stärke ist die durchdachte 5-Tab-Navigation mit Stats-Tracking. **Kritischste Schwachstelle:** Die Comment-Sortierung funktioniert technisch nicht zuverlässig (zeigt nur Toast-Hinweis statt automatischer Sortierung), was zu Frustration führt. Zudem fehlt eine echte Onboarding-Erfahrung — User müssen selbst entdecken, wie die Extension funktioniert.

**Dringendste Fix-Priorität:** Die Comment-Sortierung entweder tatsächlich funktional implementieren ODER die Feature-Erwartung klar kommunizieren (derzeit irreführend).

---

## Findings

### 🔴 Critical Findings

**[BROKEN-MENTAL-MODEL] Comment-Sortierung verspricht Auto-Funktion, liefert nur Hinweis**
- *Was passiert:* In den Einstellungen ist "Kommentare nach Beliebtheit sortieren" standardmäßig aktiviert. Der Code zeigt aber nur einen Toast: "Auto-Sortierung fehlgeschlagen. Tipp: Klicken Sie auf 'Sortieren' → 'Am meisten respektiert'".
- *User-Erwartung:* Wenn ich "Auto-Sortierung" aktiviere, erwarte ich, dass Kommentare **automatisch** sortiert werden. Nicht, dass ich manuell klicken muss.
- *Impact:* Alle User (100%), die diese Feature nutzen wollen. Führt zu Vertrauensverlust — "Die Extension funktioniert nicht."
- *Empfehlung:* Zwei Optionen: (1) Die MAIN-World-Injection aus `commentautosort-jmk.md` tatsächlich implementieren, ODER (2) Das Setting umbenennen zu "Hinweis zur Kommentar-Sortierung anzeigen" und im Info-Tab erklären, warum Auto-Sortierung technisch limitiert ist.

**[ONBOARDING-GAP] Keine Erklärung beim ersten Installieren**
- *Was passiert:* User installieren die Extension, klicken aufs Icon — sehen 5 Tabs mit Checkboxen, Settings, Stats. Nirgends steht: "Besuche tagesspiegel.de, dann erscheinen hier die Sektionen."
- *User-Erwartung:* Nach der Installation erwarte ich eine kurze Einführung: "So funktioniert's: 1. Geh auf tagesspiegel.de, 2. Wähle Sektionen, 3. Fertig."
- *Impact:* First-Time Users (Persona B, D) sind verwirrt. "Warum sind keine Sektionen gelistet?" → Extension wirkt kaputt.
- *Empfehlung:* Beim ersten Öffnen des Popups ein Modal/Overlay zeigen (3 Screens max):
  1. "Willkommen! Diese Extension blendet Sektionen auf tagesspiegel.de aus."
  2. "So geht's: Besuche eine Artikel-Seite → Sektionen erscheinen im Filter-Tab."
  3. "Tipp: Badge zeigt dir, wie viele Sektionen aktuell ausgeblendet sind."

---

### 🟠 High Findings

**[MISSING-FEEDBACK] Refresh-Button ohne Kontext**
- *Was passiert:* Im Filter-Tab gibt es einen "🔄 Refresh"-Button. Keine Erklärung, wofür.
- *User-Erwartung:* User wissen nicht, wann sie Refresh brauchen. "Habe ich was falsch gemacht? Warum muss ich refreshen?"
- *Impact:* User, die dynamisch geladene Sektionen haben (SPA-Navigation), verstehen nicht, warum Sektionen manchmal fehlen.
- *Empfehlung:* Tooltip hinzufügen: "Sektionen neu erkennen — nützlich nach Seiten-Navigation ohne Reload". Oder Button nur anzeigen, wenn Refresh tatsächlich benötigt wird.

**[TRUST-SIGNAL] Disclaimer auf Englisch in deutscher Extension**
- *Was passiert:* Der Info-Tab sagt: "Enjoying this extension? Instead of sending me your Bitcoins, just buy me a coffee..." — auf Englisch. Die ganze Extension ist auf Deutsch.
- *User-Erwartung:* Konsistente Sprache. Deutsche News-Website → deutsche Extension.
- *Impact:* Wirkt unausgereift, "copy-paste von anderem Projekt". Reduziert Vertrauen in Qualität.
- *Empfehlung:* Ins Deutsche übersetzen: "Gefällt Ihnen diese Extension? Statt Bitcoins zu senden, kaufen Sie mir lieber einen Kaffee..."

**[ACCESSIBILITY] Toggle-Switches ohne Label für Screen-Reader**
- *Was passiert:* Die Toggle-Switches im Settings-Tab haben `<input>` mit `position: absolute, opacity: 0`. Der sichtbare Slider ist ein `<span>`.
- *User-Erwartung:* Screen-Reader User hören nur "checkbox" ohne Kontext, welches Setting es ist.
- *Impact:* Barrierefreiheit eingeschränkt. WCAG 2.1 AA verletzt (4.1.2 Name, Role, Value).
- *Empfehlung:* `aria-label` oder `aria-labelledby` auf den Input-Elements hinzufügen: `<input aria-label="Extension aktivieren" ...>`.

---

### 🟡 Medium Findings

**[UX-FRICTION] Stats-Tab zeigt "Alle ausgeblendeten Sektionen" — aber sortiert nach Count**
- *Was passiert:* Der Stats-Tab-Header sagt "Alle ausgeblendeten Sektionen". Die Liste ist aber nach Häufigkeit sortiert (meiste zuerst).
- *User-Erwartung:* "Alle" impliziert alphabetisch oder chronologisch. Sortierung nach Count ist hilfreich, aber nicht deklariert.
- *Impact:* Leichte Verwirrung. User suchen vielleicht eine spezifische Sektion und finden sie nicht schnell.
- *Empfehlung:* Header ändern zu "Top ausgeblendete Sektionen" ODER Sortier-Option anbieten (Count/Alphabetisch).

**[MISSING-FEEDBACK] Badge-Counter zeigt nur Zahl, keine Kontext-Info**
- *Was passiert:* Das Extension-Icon zeigt "3" an. Aber woher weiß ich, ob das 3 ausgeblendete Sektionen auf der **aktuellen** Seite sind oder **gesamt**?
- *User-Erwartung:* Badge ist kontextuell unklar. Tooltip würde helfen: "3 Sektionen auf dieser Seite ausgeblendet".
- *Impact:* User verstehen den Badge-Zweck nicht vollständig.
- *Empfehlung:* `browser.action.setTitle({title: "3 Sektionen auf dieser Seite ausgeblendet"})` beim Badge-Update setzen.

**[ASSUMPTION-VIOLATION] Extension nimmt an, User kennen "Coral" Comment-System**
- *Was passiert:* Der Toast sagt "Coral Auto-Sort fehlgeschlagen". User wissen nicht, was "Coral" ist.
- *User-Erwartung:* "Coral" ist ein interner technischer Begriff. User kennen nur "Kommentare".
- *Impact:* Verwirrung. "Was ist Coral? Ist das ein Bug?"
- *Empfehlung:* User-facing Text ändern zu "Kommentar-Sortierung" statt "Coral Auto-Sort".

---

### 🟢 Low Findings

**[POLISH] Tabs könnten auf kleinen Screens abschneiden**
- *Was passiert:* 5 Tabs (Filter, Aktiv, Stats, Einstellungen, Info) bei 380px Popup-Breite. Bei kleiner Schrift oder Zoom könnte es eng werden.
- *Empfehlung:* Flex-Wrap testen oder horizontales Scrollen ermöglichen.

**[POLISH] Version-Nummer im Info-Tab ist hardcoded im HTML**
- *Was passiert:* HTML hat `Version 1.0.1`, aber Manifest sagt `1.0.2`. JS updated zwar via `browser.runtime.getManifest()`, aber initiales Rendering zeigt falsche Version.
- *Empfehlung:* Version-Element erst nach JS-Load anzeigen oder server-side rendern.

**[DATA-PORTABILITY] Kein Export/Import der Settings**
- *Was passiert:* User können Sektionen auswählen, aber nicht exportieren (z.B. bei Browser-Wechsel).
- *User-Erwartung:* Bei Firefox Sync wird's synchronisiert, aber was ist bei Chrome→Firefox Wechsel?
- *Empfehlung:* "Settings exportieren" Button im Info-Tab (JSON-Download).

---

## Missing Features Backlog

**Priorität 1 (Critical):**
- "Als [First-Time User] brauche ich eine **Onboarding-Tour beim ersten Öffnen**, so dass ich verstehe, wie die Extension funktioniert, ohne die Docs lesen zu müssen."

**Priorität 2 (High):**
- "Als [User] brauche ich **echte Auto-Sortierung für Kommentare** ODER eine ehrliche Kommunikation der Limitation, so dass ich nicht enttäuscht werde."
- "Als [User] möchte ich **Tooltips bei allen Buttons**, so dass ich deren Zweck ohne Raten verstehe."

**Priorität 3 (Medium):**
- "Als [Power User] möchte ich **Keyboard-Shortcuts** (z.B. Strg+Shift+F für Popup), so dass ich schneller navigieren kann."
- "Als [User] möchte ich **Settings exportieren/importieren**, so dass ich meine Konfiguration bei Browser-Wechsel behalten kann."
- "Als [User] möchte ich eine **Suche im Filter-Tab**, so dass ich spezifische Sektionen schnell finde (bei 20+ Sektionen)."

**Priorität 4 (Low):**
- "Als [User] möchte ich **Sektionen per Drag-and-Drop sortieren**, so dass ich meine bevorzugte Reihenfolge im Filter-Tab anpassen kann."
- "Als [User] möchte ich **Sektions-Gruppierung** (z.B. 'News', 'Meinung', 'Multimedia'), so dass ich den Überblick behalte."

---

## What Works Well

1. **5-Tab-Navigation ist durchdacht:** Filter, Aktiv, Stats, Einstellungen, Info — klare Trennung der Concerns. User finden schnell, was sie suchen.

2. **Stats-Tracking ist ein Highlight:** Die "Top ausgeblendete Sektionen"-Liste gibt Usern Einblick in ihr Nutzungsverhalten. Das ist ein Feature, das sie nicht erwarten, aber lieben werden.

3. **Dark-Mode-Support out-of-the-box:** `prefers-color-scheme` wird korrekt erkannt. Das zeigt Aufmerksamkeit für moderne UX-Standards.

4. **Extension-Disable-Switch ist smart:** User können die Extension temporär deaktivieren, ohne Settings zu verlieren. Das ist eine durchdachte Edge-Case-Lösung.

5. **Badge-Counter mit Echtzeit-Update:** Das Icon zeigt live, wie viele Sektionen ausgeblendet sind. Gutes visuelles Feedback ohne Popup-Öffnen.

---

## Recommended Next Tests

**Persona A (Busy Professional) testen:**
- **Flow:** Installation → erster Besuch auf tagesspiegel.de → Sektionen ausblenden → Seite neu laden → prüfen, ob Settings persistent sind.
- **Hypothese:** Alex wird ungeduldig, wenn Sektionen nicht sofort nach Installation funktionieren. Testet, ob "Refresh" verstanden wird.

**Persona C (Power User) testen:**
- **Flow:** Stats-Tab analysieren → nach Export-Option suchen → Keyboard-Navigation testen → nach API/Webhook suchen.
- **Hypothese:** Morgan wird nach Bulk-Actions suchen ("Alle Sektionen auf einmal ausblenden") und Keyboard-Shortcuts vermissen.

**Persona E (Edge-Case User) testen:**
- **Flow:** Extension auf Mobile-Firefox (Android) testen → Special Characters in Sektionsnamen → Sehr lange Sektionslisten (50+ Items).
- **Hypothese:** Riley wird Layout-Brüche bei langen Sektionsnamen finden und Scrollbar-Probleme auf kleinen Screens.

**Validierung mit echten Usern:**
- 5 User testen lassen (Nielsen-Normal-Standard): 2x Persona B, 2x Persona A, 1x Persona D.
- **Key Metric:** Time-to-first-hidden-section (sollte <60 Sekunden sein).
- **Success-Kriterium:** 4 von 5 User können ohne externe Hilfe eine Sektion ausblenden.

---

## Confidence Notes

**Limitationen dieser Simulation:**

- ❌ **Kein Live-Browser-Testing:** Ich konnte die Extension nicht im echten Browser installieren und testen. Alle Findings basieren auf Code-Analyse und dokumentiertem Verhalten.

- ❌ **Keine echten User-Beobachtungen:** Emotionale Reaktionen (Frustration, Verwirrung) sind simuliert, nicht beobachtet.

- ❌ **Coral-Comment-System nicht live getestet:** Die Comment-Sortierung wurde nur aus Code + Docs abgeleitet. Echte User könnten andere Workarounds finden.

- ❌ **Cross-Browser-Verhalten unbekannt:** Chrome vs. Firefox vs. Edge könnten sich unterschiedlich verhalten (besonders bei MV3 vs. MV2).

**Findings mit höchster Validierungswahrscheinlichkeit:**
- Onboarding-Gap (fast sicher ein Problem bei First-Time Users)
- Comment-Sortierung-Frust (Code zeigt klar: Toast statt Auto-Funktion)
- Sprach-Inkonsistenz (Englisch im Info-Tab ist faktisch vorhanden)

**Findings, die echte User-Validierung brauchen:**
- Badge-Verständlichkeit (könnte intuitiver sein als gedacht)
- Tab-Navigation (könnte für User klarer sein als simuliert)
- Stats-Tab-Value (könnte für User überraschend wertvoll sein)

---

**Nächster Schritt:** Diese Findings mit dem Development-Team priorisieren. Top-3-Fixes (Onboarding, Comment-Sortierung, Sprach-Konsistenz) sollten vor dem nächsten Release adressiert werden.

---

## Session Metadata

**Durchgeführt von:** ux-researcher Agent  
**Getestet mit:** USER-TESTER Framework (user-tester.md)  
**Test-Datum:** 28. März 2026  
**Nächste Aktion:** User-Feedback-Sammlung für Validierung der Critical/High Findings
