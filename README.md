# Taupi-4.0 
:-) Vereinfachte Version powered by HolzaChr -> alles in einen Script gepackt und ohne KVS! :-)
https://github.com/holzachr

Eine Taupunkt-gesteuerte Zwangsbelüftung mit einem Shelly Plug S Plus als Schaltsteckdose und BLE-Gateway (läuft auch auf einigen anderen Script- und BT fähigen Shelly Schaltkomponenten, einfach probieren), sowie zwei Shelly BLU HT Sensoren.

Vorab noch ein Hinweis: günstige Lüfter sind meist schlecht entstört. Shelly Plugs sind empfindlich gegen diese Überspannungen. 
Verbaut deshalb eine Entstörvorrichtung, z.B. den Shelly RC-Snubber entweder direkt am Lüfter oder in einem separaten Schukostecker, den du einfach zusammen mit dem Lüfter in eine Dreifachsteckdose steckst.

Es gibt jetzt zwei Versionen für unterschiedlichen Firmware-Stände (die Ansprache der BT Funktionen wurde stark verändert):

Legacy: Taupi-4.0_Firmware_1.x.x -> für Firmware bis 1.7.5
Getestet mit:
- Shelly Plus Plug S, Gerätemodell SNPL-00112EU, Firmware-Version 20250730-063227/1.7.0-gbe7545d
- Shelly BLU HT, Gerätemodell SBHT-003C, Firmware-Version 20250818-045415/v1.0.23@27f3ef9b

Aktuell: Taupi-4.0_Firmware_2.x.x -> für Firmware ab 2.0.0
Getestet mit (Farbringfunktion noch nicht getestet, ich habe derzeit keinen Plug mit FW 2.x.x) :-(
- Shelly 1PM Mini Gen 3, GerätemodellS3SW-001P8EU,Firmware-Version 20260710-101127/2.0.0-g87fbfa4 
- Shelly BLU HT, Gerätemodell SBHT-003C, Firmware Version 20250818-045415/v1.0.23@27f3ef9b 

Inspiriert durch den phänomenalen Taupunktlüfter aus der Zeitschrift MAKE 1/2022 ....
- geplagt von grässlichen Versuchen mit dem Arduino (Taupi-1.0: grrr, kein WLAN)
- gequält von lausigen DHT22 Sensoren an einem selbst programmierten ESP8266 (Taupi-2.0: Kotz, DHT22 und EMV...)
- geflasht von ESP easy, Rules und den BME280 (Taupi-3.0: laaangweilig, damit war der Taupunktlüfter an einem Nachmittag fertig).
  
... habe ich als Taupi-4.0 eine idiotensichere Variante ohne Löten, ohne Kabel zu den Sensoren, ohne 230 V Basteleien zusammengestellt.

Warum auf einer Shelly Plug und nicht im coolen HomeAssistant oder IOBroker oder sowas, das ist doch Steinzeit????
- Damit es als Insel mit minimalem Aufwand fernab von WLANs und Routern laufen kann. 
- Günstig, kompakt, einfach zu administrieren.
- Und weils geht.

Was ist die Aufgabe des Taupunktlüfters?
- Der Taupunktlüfter soll die Luftfeuchtigkeit in einem Raum (meist Keller) durch gesteuerte Belüftung möglichst weit absenken.
- Den Begriff Taupunkt erkläre ich nicht, die Kollegen von der MAKE erklären das Prinzip perfekt.

Wie macht der Lüfter das? 
- Der Taupunktlüfter lüftet nur dann, wenn die Außenluft (deutlich) weniger Wasser als die Innenluft enthält.

Woraus besteht das System?
  - zwei kabellose Temperatur- und Feuchtigkeitssensoren Shelly BLU HT (einer für innen, einer für außen)
  - einer Shelly Plug S Plus (schaltet den Lüfter, ist die Plattform für die Skripte)
  - einem Lüfter (230 V Lüfter mit Stecker, z.B. 150 mm, 15 W)
  - ein Skript, das auf der Shelly Plug S installiert werden muss

Häufige Frage: Luft in den Keller Reinblasen oder Raussaugen?
- Das kann ich nicht pauschal sagen. Man muss sich immer Gedanken machen, wie sich die Luftströmungen einstellen. Es braucht immer eine Quelle und eine Senke. Die Luft verschwindet nicht einfach im Keller.

- In meinen Keller blase ich durch ein Kellerfenster ein. 
- Ich habe eine gut dichte Tür zum Wohnbereich (wichtig, sonst drückt es die feuchte, muffige Kellerluft nach oben ...)
- Auf der gegenüberliegenden Seite des Kellers habe ich ein Fenster gekippt, dort entwicht ein Großteil der Luft und dort befindet sich eine Gastherme.
- Für sehr große Keller kann es sinnvoll sein, mit einem zweiten Lüfterauf der gegenüberliegenden Seite einen Zwangsstrom zu erzeugen (einer bläst, einer saugt, Steuerung ganz einfach über eine Action auf der Shelly Plug mit dem Script und einer zweiten Shelly Plug für den zweiten Lüfter). 
- Aber Achtung: Bei einer Feuerung im Keller (Gastherme etc) würde ich nie Luft raussaugen sondern immer in den Keller einblasen und für zusätzliche Entlüftung sorgen. Wer weis, was man sonst aus der Feuerung ansaugt. Der Schornsteinfeger bekommt vermutlich trotzdem Schnappatmung und will eine Vorrangsteuerung für den Brenner ...

# Installationsvideo:
 
https://youtu.be/OwO5WBgde4s?si=qNCkJwFlZNB12Jp6

Und so viel bringts -> Short:
https://youtube.com/shorts/eaow63bAOWc

# Installationsanleitung Kurzversion

- Shelly Plug einrichten
- BT-Sensoren mit Shelly Plug koppeln.
- Firmwareupdates durchführen.
- Skript installieren (Taupi-4.0_Firmware_x.x.x.js). 
- Adressen der BT-Sensoren raussuchen und im Kopfteil des Scripts Taupi-4.0_Firmware_x.x.x.js anpassen.
- Skript auf automatischen Start stellen.
- Shelly Komponenten auf "automatisch ausschalten nach 15 Minuten" stellen

Die Farbe des Shelly Farbrings zeigt den Status an (Bedeutung der Farbcodes siehe File Bedienungsanleitung)

Anregungen und Korrekturen gerne, das Projekt wird sicher wachsen :-)

