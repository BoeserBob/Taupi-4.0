////////////// TAUPI 4.0 @ Shelly ///// Script taupi_event_handler_checkBlu ////////////////////
// Diese Software und die zugehörigen Skripte unterliegen der Boost Software License - Version 1.0 - August 17th, 2003
// copyright by boeserbob
// credits to thomas.b fuer die Vereinfachung des Variablenhandlings und die Einfuehrung des absoluten Feuchte. 
// Fragen an quirb@web.de
// Dokumentation und aktuelle Versionen unter https://github.com/BoeserBob/Taupi-4.0
// Getestet mit Firmware 
// Shelly Plus Plug S 20241011-114442/1.4.4-g6d2a586
// Shelly BLU HT 1.0.16
// 
// Der Taupunktlüfter besteht aus zwei skripten:
//     einem event handler (taupi_event_handler_checkBlu)
//     einem bluetooth "Empfänger" (ble-shelly-blu, der ist nicht von mir sondern ein fertiges Beispiel von shelly)
// 
// Dieser Script hier ist der event handler, er lauscht auf die vom bluetooth Empfänger geworfenen events der H&T Blu Sensoren.
// er liest die Daten für Temperatur und Feuchtigkeit aus den JSON Paketen aus
// er berechnet den Taupunkt
// er schaltet den Lüfter
//
//////// Hier musst du die Adresse der H&T Blu Sensoren eingeben ///
// Sensoren anhand der MAC Adresse
const sensor_aussen = "7c:c6:b6:7f:9a:50"; const sensor_innen = "7c:c6:b6:72:8c:29"; const sensor_innen2 = "7c:c6:b6:03:b0:7c";

const korrektur_it = 0; // Korrekturwert Innensensor Temperatur const korrektur_it2 = 0; // Korrekturwert Innensensor Temperatur const korrektur_at = 0; // Korrekturwert Außensensor Temperatur const korrektur_ih = 0; // Korrekturwert Innensensor Luftfeuchtigkeit const korrektur_ih2 = 0; // Korrekturwert Innensensor Luftfeuchtigkeit const korrektur_ah = 0; // Korrekturwert Außensensor Luftfeuchtigkeit

const af_min = 3.0;
const tempI_min = 10.0; // Minimale Innentemperatur, bei der die Lüftung aktiviert wird const tempA_min = -10.0; // Minimale Außentemperatur, bei der die Lüftung aktiviert wird const minHumiKeller = 50; ////////////////////////////////unterhalb nichts mehr ändern/////////////////////

let taupunkt_aussen = 99;
let taupunkt_innen = 99;
let taupunkt_innen2 = 99;
let temperatur_innen = 99;
let temperatur_innen2 = 99;
let temperatur_aussen = 99;
let humidity_innen = 99;
let humidity_innen2 = 99;
let humidity_aussen = 99;
let af_innen = 99;
let af_innen2 = 99;
let af_aussen = 99;
let rel = false;

const rmal = 8314.3;
const mw = 18.016;

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

/// Start der Funktion, um die events auszuwerten:
function checkBlu(event) {
    //console.log("EventAdress: " + event.info.data.address);

    let eventinhalt = JSON.stringify(event);
    let suchbegriff = "shelly-blu";
    let index = eventinhalt.indexOf(suchbegriff);
    if (index == -1) {
        //console.log("Suchbegriff nicht gefunden, fremden event abgefangen");
        return;
    }

    //console.log("Suchbegriff gefunden an Position: " + index);

    if (event.info.data.address == sensor_aussen) {
        taupunkt_aussen = berechneTP(
            event.info.data.temperature + korrektur_at,
            event.info.data.humidity + korrektur_ah
        );
        af_aussen = berechneAF(
            event.info.data.temperature + korrektur_at,
            event.info.data.humidity + korrektur_ah
        );
        temperatur_aussen = event.info.data.temperature + korrektur_at;
        humidity_aussen = event.info.data.humidity + korrektur_ah;
    }

    if (event.info.data.address == sensor_innen) {
        taupunkt_innen = berechneTP(
            event.info.data.temperature + korrektur_it,
            event.info.data.humidity + korrektur_ih
        );
        af_innen = berechneAF(
            event.info.data.temperature + korrektur_it,
            event.info.data.humidity + korrektur_ih
        );
        temperatur_innen = event.info.data.temperature + korrektur_it;
        humidity_innen = event.info.data.humidity + korrektur_ih;
    }

    if (event.info.data.address == sensor_innen2) {
        taupunkt_innen2 = berechneTP(
            event.info.data.temperature + korrektur_it2,
            event.info.data.humidity + korrektur_ih2
        );
        af_innen2 = berechneAF(
            event.info.data.temperature + korrektur_it2,
            event.info.data.humidity + korrektur_ih2
        );
        temperatur_innen2 = event.info.data.temperature + korrektur_it2;
        humidity_innen2 = event.info.data.humidity + korrektur_ih2;
    }

    console.log(
        "Aussen--> AF: " +
            af_aussen.toFixed(4) +
            "g/m³ T: " +
            temperatur_aussen +
            "°C R: " +
            humidity_aussen +
            "%"
    );
    console.log(
        "Innen--> AF: " +
            af_innen.toFixed(4) +
            "g/m³ T: " +
            temperatur_innen +
            "°C R: " +
            humidity_innen +
            "%"
    );

    console.log(
        "Innen2--> AF: " +
            af_innen2.toFixed(4) +
            "g/m³ T: " +
            temperatur_innen2 +
            "°C R: " +
            humidity_innen2 +
            "%"
    );
} // Ende Funktion check blu

// Taupunktberechnung ///////////////////////////////////////////////////////////////////////

function berechneTP(t, r) {
    let a;
    let b;
    let tk = t + 273.15;

    if (t >= 0) {
        (a = 7.5), (b = 237.3);
    }
    if (t < 0) {
        (a = 7.6), (b = 240.7);
    }
    //a = 9.5, b = 265.5 für T < 0 über Eis (Frostpunkt)

    let sdd = 6.1078 * Math.pow(10, (a * t) / (b + t));

    // Dampfdruck in hPa
    let dd = sdd * (r / 100);

    // v-Parameter
    let v = getBaseLog(10, dd / 6.1078);

    // Taupunkttemperatur (°C)
    let tt = (b * v) / (a - v);

    //absolute Feuchte in g Wasserdampf pro m3 Luft
    //let afr = (((10 ** 5 * mw) / rmal) * dd) / tk;

    //AF(TD,TK) = 10^5 * mw/R* * SDD(TD)/TK
    //let aftd = (((10 ** 5 * mw) / rmal) * sdd) / tk;

    return tt;
    /*console.log(
        "t: " +
            t +
            " °C r: " +
            r +
            "% abs Feuchte: " +
            afr +
            " g/m³ # Taupunkt: " +
            tt +
            " °C"
    );*/
}

function berechneAF(t, r) {
    let a;
    let b;
    let tk = t + 273.15;

    if (t >= 0) {
        (a = 7.5), (b = 237.3);
    }
    if (t < 0) {
        (a = 7.6), (b = 240.7);
    }
    //a = 9.5, b = 265.5 für T < 0 über Eis (Frostpunkt)

    let sdd = 6.1078 * Math.pow(10, (a * t) / (b + t));

    // Dampfdruck in hPa
    let dd = sdd * (r / 100);

    // v-Parameter
    let v = getBaseLog(10, dd / 6.1078);

    // Taupunkttemperatur (°C)
    //let tt = (b * v) / (a - v);

    //absolute Feuchte in g Wasserdampf pro m3 Luft
    let afr = (((Math.pow(10, 5) * mw) / rmal) * dd) / tk;

    //AF(TD,TK) = 10^5 * mw/R* * SDD(TD)/TK
    //let aftd = (((10 ** 5 * mw) / rmal) * sdd) / tk;

    return afr;
    /*console.log(
        "t: " +
            t +
            " °C r: " +
            r +
            "% abs Feuchte: " +
            afr +
            " g/m³ # Taupunkt: " +
            tt +
            " °C"
    );*/
}

function schalten2() {
    rel = false;
    // wenn Absolute Feuchtigkeit einen Unterschied von X hat
    if (af_innen - af_min > af_aussen || af_innen2 - af_min > af_aussen) {
        rel = true;
        console.log(
            "Lüften, draußen ist trocken :-) AFA: " +
                af_aussen +
                " AFI: " +
                af_innen +
                " / " +
                af_innen2
        );
    }

    // wenn rel. Luftfeuchte im Keller kleiner ist wie X nicht lüften
    if (humidity_innen <= minHumiKeller && humidity_innen2 <= minHumiKeller) {
        rel = false;
        console.log(
            "Luftfeuchte im Keller niedrig, KEINE Lüftung! rel. Luftfeuchte: " +
                humidity_innen +
                " / " +
                humidity_innen2
        );
    }

    // wenn Außentemp kleiner wie X ist nicht lüften
    if (temperatur_aussen <= tempA_min) {
        rel = false;
        console.log(
            "Außentemperatur ist zu kalt, KEINE Lüftung! TempAußen: " +
                temperatur_aussen
        );
    }

    if (rel == true) {
        Shelly.call("Switch.Set", { id: 0, on: true });
        console.log("Lueftung AN");
    } else {
        Shelly.call("Switch.Set", { id: 0, on: false });
        console.log("Lueftung AUS");
    }
}

Timer.set(
    10000,
    true,
    function (ud) {
        schalten2();
    }, // Ende Timerschleife
    null
);

// Verzögerter Start des Event Handlers, um die ganzen mir nicht bekannten Events beim Start des Shellys die ich noch nicht abfangen kann abzuwarten.
function verzoegerter_start(millisekunden) {
    Timer.set(millisekunden, false, function () {
        console.log("Pause beendet nach " + millisekunden + " ms.");
        Shelly.addEventHandler(checkBlu); // registriert checkEvent als EventHandler
    });
}
