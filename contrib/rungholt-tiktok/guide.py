import json, re
from story import PARTS
MARK = re.compile(r"\{([^|}]*)\|([^}]*)\}")
TW = {1: "Die Retter haben eine Laterne gesehen – die Kinder hatten keine.",
      2: "Bei Landunter kommt niemand zur Tür. Trotzdem steht morgens eine warme Laterne auf der Schwelle.",
      3: "Ben sah einen Jungen auf dem Eis, der „Geh weg“ winkte. Wo er stand, ist der Raureif geschmolzen.",
      4: "Im Schlick liegt eine Glocke ohne Klöppel – und trotzdem läutet sie in Mias Tasche.",
      5: "Im Selfie aus Teil 1 steht der Junge im Nebel – zwischen den Kindern und dem Meer. Er hat aufgepasst."}
RULE = {1: "Nebel im Watt", 2: "Klopfen bei Sturmflut", 3: "Jemand bricht ins Eis ein", 4: "Im Schlick stecken", 5: "Gewitter im Watt"}
_b = [b for b in json.load(open("build/part1/timeline.json"))["beats"] if b["sc"] == "selfie"][0]
SELFIE = f"{int(_b['t0'] + 1) // 60}:{int(_b['t0'] + 1) % 60:02d}"
out = ["# RUNGHOLT – Grusel-Serie in 5 Teilen (familienfreundlich)\n",
"Gleiches Prinzip wie „Sturmvogel“ von Endstation Grusel: **Regel-Hook → Lage → 3 Schritte mit echten Fakten → „Alles nach Protokoll“ → Twist**. "
"Aber familienfreundlich: Niemand stirbt, kein Blut, keine Jump-Scares. Der „Geist“ ist ein Beschützer – der Lüchtenjung aus Rungholt, der seit 1362 warnt.\n",
"## Was gleich ist wie im Original\n",
"| | Original | RUNGHOLT |", "|---|---|---|",
"| Stimme | ruhiger, tiefer Männer-Erzähler | ElevenLabs-Stimme „Helmut Stieglbauer – Deep“, Tempo wie im Original, Hook und Twist langsamer mit Spannungspausen |",
"| Design | dunkles Petrol, flache Figuren, Mono-Label oben, 1 Wort groß in der Mitte, rote Stempel, farbige Pillen, Skala links, Protokoll-Karte | genauso |",
"| Aufbau | „Wenn X: tu nicht Y“ → Schritt 1/2/3 → Protokoll ✓✓✓ → Twist | genauso |",
"| Länge | 1:51 | 2:11 – 2:59 (alle über 1 Minute) |\n",
"## Die Teile\n", "| Teil | Datei | Regel | Twist |", "|---|---|---|---|"]
for p in PARTS:
    tl = json.load(open(f"build/part{p['n']}/timeline.json"))
    m, s = divmod(round(tl['duration']), 60)
    out.append(f"| {p['n']}/5 · {p['title']} ({m}:{s:02d}) | RUNGHOLT_Teil_{p['n']}.mp4 | {RULE[p['n']]} | {TW[p['n']]} |")
out += ["\n## Posten\n",
"- **Reihenfolge:** Teil 1 → 5, am besten **1 Teil pro Tag** zur gleichen Uhrzeit (z. B. 18–19 Uhr).",
"- **Ende jedes Teils:** Twist → Spannungspause → Sprecher-Teaser auf den nächsten Teil (mit Einblick in die nächste Szene) → Endkarte „Folgt für Teil X“ mit Plus, das angetippt wird und verschwindet. Alle Teile sind länger als 1 Minute.",
"- **Playlist:** In TikTok eine Playlist „Rungholt“ anlegen und alle Teile hinzufügen.",
"- **Cover:** Die Bilder `RUNGHOLT_Cover_Teil_X.jpg` als Titelbild hochladen (oder den Frame mit dem roten Stempel wählen).",
"- **Kommentar anpinnen (nach Teil 5):** „Geht zurück zu Teil 1, Sekunde " + SELFIE + " – im Selfie steht er schon da 👀“. Der Junge ist im Selfie in Teil 1 winzig am Horizont versteckt.",
"- **KI-Label:** Die Stimme ist KI-generiert (ElevenLabs). In TikTok beim Posten „KI-generierter Inhalt“ aktivieren.",
"- **Musik/Sounds:** Alle Geräusche und der Drone sind selbst erzeugt – keine Rechte Dritter. Du kannst trotzdem einen TikTok-Sound leise drunterlegen.\n",
"## Captions zum Kopieren\n"]
for p in PARTS:
    out.append(f"**Teil {p['n']}:**\n```\n{p['caption']}\n```")
out.append("\n## Komplettes Skript\n")
for p in PARTS:
    out.append(f"### Teil {p['n']}/5 – {p['title']}\n")
    for b in p['beats']:
        out.append(MARK.sub(lambda m: m.group(1), b['say']))
    out.append("")
out += ["## Fakten-Check (die Regeln stimmen)\n",
"- **Im Kreis laufen ohne Sicht:** Souman et al., *Current Biology* 2009 – mit verbundenen Augen teils Kreise unter 20 m Durchmesser. [ScienceDaily](https://www.sciencedaily.com/releases/2009/08/090820123927.htm), [Phys.org](https://phys.org/news/2009-08-scientists-people-circles-lost-video.pdf)",
"- **112 sendet den Standort automatisch (AML):** seit 2019 in Deutschland, auf wenige Meter genau. [Telekom](https://www.telekom.com/de/newsroom/aktuelles/news/2020/09/notruf-mit-gps-ortung-so-rettet-mobilfunk-leben), [teltarif](https://www.teltarif.de/arch/2022/kw06/s87203.html)",
"- **Schutzräume auf den Halligen:** nach der Sturmflut 1962 in fast allen Hallighäusern, oben im Haus auf eigenen Stahlbetonpfeilern. [Planet Wissen](https://www.planet-wissen.de/kultur/nordsee/halligen_welten_zwischen_den_wassern/index.html), [Wikivoyage Hooge](https://de.wikivoyage.org/wiki/Hallig_Hooge)",
"- **Eis:** flach hinlegen (Gewicht verteilen), Schal/Ast statt Hand reichen, zurück in die Richtung, aus der man kam, rollen statt aufstehen; 1-10-1-Regel für kaltes Wasser.",
"- **Schlick:** nicht ruckartig ziehen (Sog), Beine kreisen lassen, damit Wasser nachläuft (Schlick wird bei Bewegung weicher), nach hinten lehnen und Fläche vergrößern.",
"- **Gewitter:** Sekunden zwischen Blitz und Donner ÷ 3 = km; nicht hinlegen, sondern Hocke mit geschlossenen Füßen (Schrittspannung); Abstand in der Gruppe; 30 Minuten nach dem letzten Donner warten.",
"- **Rungholt:** reales Dorf, das bei der Sturmflut im Januar 1362 („Grote Mandränke“) unterging. Der Lüchtenjung ist erfunden."]
open("final/RUNGHOLT_Anleitung.md", "w").write("\n".join(out) + "\n")
print("ok")
