# Taupi-4.0 
 :-) Vereinfachte Version powered by HolzaChr -> alles in einen Script gepackt und ohne KVS! :-)
https://github.com/holzachr

Eine Taupukt-gesteuerte Zwangsbelüftung mit einem Shelly Plug S Plus als Schaltsteckdose und BLE-Gateway, sowie zwei Shelly BLU HT Sensoren.

Getestet mit:
- Shelly Plus Plug S, Gerätemodell SNPL-00112EU, Firmware-Version 20250730-063227/1.7.0-gbe7545d
- Shelly BLU HT, Gerätemodell SBHT-003C, Firmware-Version 20250818-045415/v1.0.23@27f3ef9b

Inspiriert durch den phänomenalen Taupunktlüfter aus der Zeitschrift MAKE 1/2022 ....
- geplagt von grässlichen Versuchen mit dem Arduino (Taupi-1.0: grrr, kein WLAN)
- gequält von lausigen DHT22 Sensoren an einem selbst programmierten ESP8266 (Taupi-2.0: Kotz, DHT22 und EMV...)
- geflasht von ESP easy, Rules und den BME280 (Taupi-3.0: laaangweilig, damit war der Taupunktlüfter an einem Nachmittag fertig).
  
... habe ich als Taupi-4.0 eine idiotensichere Variante ohne Löten, ohne Kabel zu den Sensoren, ohne 230 V Basteleien zusammengestellt.

Warum auf einer Shelly Plug und nicht im coolen HomeAssistant oder IOBroker oder sowas? Das ist doch Steinzeit.

- Damit es als Insel mit minimalem Aufwand fernab von WLANs und Routern laufen kann. 
- Günstig, kompakt, einfach zu administrieren.
- Und weils geht.

Was ist die Aufgabe des Taupunktlüfters?

- Der Taupunktlüfter soll die Luftfeuchtigkeit in einem Raum (meist Keller) durch gesteuerte Belüftung möglichst weit absenken.
- Den Begriff Taupunkt erkläre ich nicht, die Kollegen von der MAKE erklären das Prinzip perfekt.

Wie macht der Lüfter das? 

- Der Taupunktlüfter lüftet nur dann, wenn die Außenluft (deutlich) weniger Wasser als die Innenluft enthält.

Woraus besteht das System?

  - zwei kabellose Temperatur und Feuchtigkeitssensoren Shelly BLU HT (einer für innen, einer für außen)
  - einer Shelly Plug S Plus (schaltet den Lüfter, ist die Plattform für die Skripte)
  - einem Lüfter (230 V Lüfter mit Stecker, z.B. 150 mm, 15 W)
  - ein Skript, das auf der Shelly Plug S installiert werden muss

# Installationsvideo:
 
https://youtu.be/OwO5WBgde4s?si=qNCkJwFlZNB12Jp6

Und so viel bringts -> Short:
https://youtube.com/shorts/eaow63bAOWc

# Installationsanleitung Kurzversion

- Shelly Plug einrichten
- BT-Sensoren mit Shelly Plug koppeln.
- Firmwareupdates durchführen. 
- Adressen der BT-Sensoren raussuchen und im Kopfteil von Taupi-4.0.js anpassen.
- Skript installieren (Taupi-4.0.js).
- Skript auf automatischen Start stellen.

Anregungen und Korrekturen gerne, das Projekt wird sicher wachsen :-)

