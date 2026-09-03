////////////// TAUPI 4.0 @ Shelly //////////////
// copyright by boeserbob und holzachr
// Fragen an quirb@web.de
// Boost Software License - Version 1.0 - August 17th, 2003
// Dokumentation und aktuelle Versionen unter https://github.com/BoeserBob/Taupi-4.0
//
// Dieses Skript verwandelt z.B. eine Shelly Plug in eine Taupunktlüftersteuerung. 
// Der Skript schaltet einen angeschlossenen Lüfter über den Schalter des Shellys auf dem er installiert ist entsprechend der Taupunktunterschiede innen - außen.
//   - Es empfängt Messwert-Events von BLE-Sensoren auf.
//   - Wenn die Messwerte von den angegebenen Innen- und Außen-Sensoren stammen, werden aus Temperatur und Luftfeuchte die jeweiligen Taupunkte berechnet.
//   - Eine Timerschleife überprüft regelmäßig, ob alle Einschaltbedingungen fuer den Lüfter erfüllt sind:
//         - Wenn der Taupunkt innen größer als der Taupunkt außen + einem Schwellwert ist wird der Lüfter eingeschaltet, sonst ausgeschaltet.
//         - Wenn die Innentermperatur unter 10 °C und die Innenraumfeuchte unter 50 % ist wird der Lüfer ausgeschaltet.
//         - Wenn die Außentemperatur unter mindesttemperatur_aussen oder über maximaltemperatur_aussen liegt, bleibt der Lüfter ausgeschaltet.
// 
// Die nachfolgenden Zeilen müssen angepasst werden, mindestens die MAC-Adressen für "sensor_aussen" und "sensor_innen".
// Die Schaltkonfiguration kann bei Bedarf angepasst werden.
//

//========== Sensor-Konfiguration ==========
var sensor_aussen = "xx:xx:xx:xx:xx:xx";
var sensor_innen  = "xx:xx:xx:xx:xx:xx";
//========== Schalt-Konfiguration ==========
var taupunktschwelle         = 2;     // [°C] Lüfter einschalten wenn TPinnen > (TPaussen + taupunktschwelle)...
var mindesttemperatur        = 10;    // [°C] ...und Tinnen > mindesttemperatur...
var mindesthumi              = 50;    // [%]  ...und RHinnen > mindesthumi
var mindesttemperatur_aussen = -10;   // [°C] Keim Lüften bei extremer Kälte/Frost unter dieser Außentemperatur
var maximaltemperatur_aussen = 25;    // [°C] Kein Lüften bei Hitze über dieser Außentemperatur
var schaltzeit               = 180;   // [s]  Schaltbedingung prüfen alle X Sekunden
var battery_warngrenze       = 20;    // [%]  wenn dieser Schwellwert unterschritten ist blinkt der Plug rot
var lost_connection          = 1800;  // [s]  Zeit (30 Min) nach der frische Sensordaten gekommen sein müssen um tote Verbindungen zu finden
var auto_reboot_tage         = 7;     // [Tage] Automatischer Neustart zur Speicherbereinigung
//===== Ende Sensor-Konfiguration === AB HIER MUSS NICHTS MEHR GEÄNDERT WERDEN =====================================

var reboot_limit = auto_reboot_tage * 24 * 60 * 60; // Umrechnung in Sekunden

var taupunkt_aussen;
var taupunkt_innen;
var temperatur_innen;
var temperatur_aussen;
var humidity_innen;
var humidity_aussen;
var battery_innen;
var battery_aussen;

// FIX: Variablen explizit auf 0 initialisieren (verhindert NaN-Berechnungen in FW 2.x)
var lost_connection_innen = 0;
var lost_connection_aussen = 0;

var luefterstatus = null;  // Merkt sich letzten Schaltzustand, um unnötige Schaltvorgänge zu vermeiden

// Taupunktberechnung
function taupunkt(T, RH) {
  var a = (T >= 0) ? 17.27 : 21.875;
  var b = (T >= 0) ? 237.7 : 265.5;
  var alpha = (a * T) / (b + T) + Math.log(RH / 100);
  return (b * alpha) / (a - alpha);
}

// Lüftersteuerung
function schalten() {
  // Sicherheitsprüfung: Sind alle benötigten Werte vorhanden?
  if (typeof taupunkt_innen === "undefined" ||
      typeof taupunkt_aussen === "undefined" ||
      typeof temperatur_innen === "undefined" ||
      typeof temperatur_aussen === "undefined" ||
      typeof humidity_innen === "undefined")
  {
    print("Nicht alle Sensorwerte vorhanden – Schaltung übersprungen.");
    farbring(80,80,0,100);
    return;
  }

  // Sicherheitsprüfung: Kommen regelmäßig frische Daten von den Sensoren?
  lost_connection_innen = lost_connection_innen + schaltzeit;
  lost_connection_aussen = lost_connection_aussen + schaltzeit;
  print("letzte Verbindung zum Sensor innen vor ", lost_connection_innen, " Sekunden ");
  print("letzte Verbindung zum Sensor außen vor ", lost_connection_aussen, " Sekunden ");
  
  if (lost_connection_innen > lost_connection || lost_connection_aussen > lost_connection)
  {
    print("Verbindung zu Sensoren zu lange verloren, Lüfter ausschalten.");
    Shelly.call("Switch.Set", { id: 0, on: false });  
    farbring(80,80,0,100);
    return;
  }
  
  // Visualisierung Batteriefüllstand
  if ((typeof battery_innen !== "undefined" && battery_innen < battery_warngrenze) ||
      (typeof battery_aussen !== "undefined" && battery_aussen < battery_warngrenze))
  {
    print("WARNUNG: Batteriestand eines Sensors niedrig!");
  }

  // Schaltlogik (inklusive Grenzen für Außentemperatur)
  if (temperatur_innen > mindesttemperatur &&
      humidity_innen > mindesthumi &&
      taupunkt_innen > taupunkt_aussen + taupunktschwelle &&
      temperatur_aussen >= mindesttemperatur_aussen &&
      temperatur_aussen <= maximaltemperatur_aussen)
  {
    print("Lüfter einschalten");
    Shelly.call("Switch.Set", { id: 0, on: true });
    farbring(80,10,0,100);
  } else {
    print("Lüfter ausschalten.");
    Shelly.call("Switch.Set", { id: 0, on: false });
    farbring(0,0,80,100); 
  }
}

// Farbe Farbring setzen für Standalone Betrieb.
function farbring(red,green,blue,helligkeit) {
  Shelly.call(
    "PLUGS_UI.SetConfig",{ id:0, config:{"leds":{"mode":"switch","colors":
    {"switch:0":
    {"on":{"rgb":[red,green,blue],"brightness":helligkeit},
    "off":{"rgb":[red,green,blue],"brightness":helligkeit}}}}}},
    function (result, code, msg, ud) {},
    null
  );
}

// Event-Verarbeitung
function checkBlu(event) {
  if (event.address === sensor_aussen) {
    temperatur_aussen = event.temperature;
    humidity_aussen   = event.humidity;
    taupunkt_aussen   = taupunkt(event.temperature, event.humidity);
    battery_aussen    = event.battery;
    lost_connection_aussen = 0;
    print("Neue Werte für Außen:", temperatur_aussen, "°C,", humidity_aussen, "%, Tp:", taupunkt_aussen, "°C, Batt: ", battery_aussen, " % ");
  } else if (event.address === sensor_innen) {
    temperatur_innen = event.temperature;
    humidity_innen   = event.humidity;
    taupunkt_innen   = taupunkt(event.temperature, event.humidity);
    battery_innen    = event.battery;
    lost_connection_innen = 0;
    print("Neue Werte für Innen:", temperatur_innen, "°C,", humidity_innen, "%, Tp:", taupunkt_innen, "°C, Batt: " , battery_innen, " % ");
  }
}

// Haupt-Timer für Steuerlogik
Timer.set(schaltzeit * 1000, true, function () {
  print("----- Steuerung alle", schaltzeit, "s -----");
  print("Innen: T =", temperatur_innen, "°C, RH =", humidity_innen, "%, Tp =", taupunkt_innen, "Batterie: ", battery_innen, " % ");
  print("Außen: T =", temperatur_aussen, "°C, RH =", humidity_aussen, "%, Tp =", taupunkt_aussen, "Batterie: ", battery_aussen, " % ");
  
  // Auto-Reboot Prüfung & Anzeige
  var sysStatus = Shelly.getComponentStatus("sys");
  if (sysStatus && typeof sysStatus.uptime !== "undefined") {
    var restSek = reboot_limit - sysStatus.uptime;
    if (restSek <= 0) {
      print("Uptime von ", auto_reboot_tage, " Tagen erreicht. Führe automatischen Neustart durch...");
      Shelly.call("Shelly.Reboot");
      return;
    } else {
      var restStunden = Math.floor(restSek / 3600);
      var restTage = Math.floor(restStunden / 24);
      var restStundenRest = restStunden % 24;
      print("Zeit bis Reboot:", restTage, "Tage,", restStundenRest, "Std");
    }
  }

  schalten();
});


///////////////// BLE-Decoder ///////////////////////

// Der nachfolgende Code ist eine modifizierte Version von
// https://github.com/ALLTERCO/shelly-script-examples/blob/main/ble-shelly-blu.js
//
//   Copyright 2024 Shelly Europe
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0

const BTHOME_SVC_ID_STR = "fcd2";

const uint8 = 0;
const int8 = 1;
const uint16 = 2;
const int16 = 3;
const uint24 = 4;
const int24 = 5;

// The BTH object defines the structure of the BTHome data
const BTH = {
  0x00: { n: "pid", t: uint8 },
  0x01: { n: "battery", t: uint8, u: "%" },
  0x02: { n: "temperature", t: int16, f: 0.01, u: "tC" },
  0x03: { n: "humidity", t: uint16, f: 0.01, u: "%" },
  0x05: { n: "illuminance", t: uint24, f: 0.01 },
  0x21: { n: "motion", t: uint8 },
  0x2d: { n: "window", t: uint8 },
  0x2e: { n: "humidity", t: uint8, u: "%" },
  0x3a: { n: "button", t: uint8 },
  0x3f: { n: "rotation", t: int16, f: 0.1 },
  0x45: { n: "temperature", t: int16, f: 0.1, u: "tC" },
};

function getByteSize(type) {
  if (type === uint8 || type === int8) return 1;
  if (type === uint16 || type === int16) return 2;
  if (type === uint24 || type === int24) return 3;
  return 255;
}

// Functions for decoding and unpacking the service data from Shelly BLU devices
const BTHomeDecoder = {
  utoi: function (num, bitsz) {
    const mask = 1 << (bitsz - 1);
    return num & mask ? num - (1 << bitsz) : num;
  },
  getUInt8: function (buffer) {
    return buffer.at(0);
  },
  getInt8: function (buffer) {
    return this.utoi(this.getUInt8(buffer), 8);
  },
  getUInt16LE: function (buffer) {
    return 0xffff & ((buffer.at(1) << 8) | buffer.at(0));
  },
  getInt16LE: function (buffer) {
    return this.utoi(this.getUInt16LE(buffer), 16);
  },
  getUInt24LE: function (buffer) {
    return (
      0x00ffffff & ((buffer.at(2) << 16) | (buffer.at(1) << 8) | buffer.at(0))
    );
  },
  getInt24LE: function (buffer) {
    return this.utoi(this.getUInt24LE(buffer), 24);
  },
  getBufValue: function (type, buffer) {
    if (buffer.length < getByteSize(type)) return null;
    let res = null;
    if (type === uint8) res = this.getUInt8(buffer);
    if (type === int8) res = this.getInt8(buffer);
    if (type === uint16) res = this.getUInt16LE(buffer);
    if (type === int16) res = this.getInt16LE(buffer);
    if (type === uint24) res = this.getUInt24LE(buffer);
    if (type === int24) res = this.getInt24LE(buffer);
    return res;
  },

  unpack: function (buffer) {
    if (typeof buffer !== "string" || buffer.length === 0) return null;
    let result = {};
    let _dib = buffer.at(0);
    result["encryption"] = _dib & 0x1 ? true : false;
    result["BTHome_version"] = _dib >> 5;
    if (result["BTHome_version"] !== 2) return null;
    if (result["encryption"]) return result;
    buffer = buffer.slice(1);

    let _bth;
    let _value;
    while (buffer.length > 0) {
      _bth = BTH[buffer.at(0)];
      if (typeof _bth === "undefined") {
        print("BTH: Unknown type");
        break;
      }
      buffer = buffer.slice(1);
      _value = this.getBufValue(_bth.t, buffer);
      if (_value === null) break;
      if (typeof _bth.f !== "undefined") _value = _value * _bth.f;

      if (typeof result[_bth.n] === "undefined") {
        result[_bth.n] = _value;
      }
      else {
        if (Array.isArray(result[_bth.n])) {
          result[_bth.n].push(_value);
        }
        else {
          result[_bth.n] = [
            result[_bth.n],
            _value
          ];
        }
      }

      buffer = buffer.slice(getByteSize(_bth.t));
    }
    return result;
  },
};

let lastPacketId = 0x100;

function BLEScanCallback(event, result) {
  if (event !== BLE.Scanner.SCAN_RESULT) {
    return;
  }

  if (typeof result.service_data === "undefined" ||
      typeof result.service_data[BTHOME_SVC_ID_STR] === "undefined") {
    return;
  }

  let unpackedData = BTHomeDecoder.unpack(result.service_data[BTHOME_SVC_ID_STR]);

  if (unpackedData === null ||
      typeof unpackedData === "undefined" ||
      unpackedData["encryption"]) {
    print("Error: Encrypted devices are not supported");
    return;
  }

  if (lastPacketId === unpackedData.pid) {
    return;
  }

  lastPacketId = unpackedData.pid;
  unpackedData.address = result.addr;

  checkBlu(unpackedData);
}

function initBLE() {
  const BLEConfig = Shelly.getComponentConfig("ble");

  if (!BLEConfig || !BLEConfig.enable) {
    print("Bluetooth ist deaktiviert. Aktiviere Bluetooth automatisch...");
    Shelly.call("BLE.SetConfig", { config: { enable: true } }, function (res, err, msg) {
      if (err !== 0) {
        print("Fehler beim Aktivieren von Bluetooth:", msg);
        return;
      }
      print("Bluetooth erfolgreich aktiviert! Starte Scanner...");
      startScanner();
    });
  } else {
    startScanner();
  }
}

function startScanner() {
  BLE.Scanner.Subscribe(BLEScanCallback);

  if (BLE.Scanner.isRunning()) {
    print("Info: BLE Scanner läuft bereits.");
  } else {
    BLE.Scanner.Start({
      duration_ms: BLE.Scanner.INFINITE_SCAN,
      active: false
    });
    print("Info: BLE Scanner erfolgreich gestartet.");
  }
}

initBLE();
