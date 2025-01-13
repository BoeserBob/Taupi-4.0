////////////// TAUPI 4.0 @ Shelly ///// Script Lüfter schalten /////////////////////////////
// copyright by boeserbob
// Fragen an quirb@web.de
// Dokumentation und aktuelle Versionen unter https://github.com/BoeserBob/Taupi-4.0
// Lizenz und erforderliche Firmware siehe in den Kommentaren des Scripts "taupi_event_handler_checkBlu"
//
// Dieser Script schaltet den Lüfter (über den Schalter des Shellys auf dem er installiert ist. 
//   er startet eine Timerschleife
//     die Timerschleife holt sich die erforderlichen Werte über Funktion aus dem KVS
//     die Timerschleife ruft eine Funktion zur Prüfung der Taupunkte auf
//         wenn der Taupunkt innen größer als der Taupunkt außen + einem Schwellwert ist wird der Lüfter eingeschaltet, sonst ausgeschaltet.
//         wenn die Innentermperatur unter 8° und die Innenraumfeuchte unter 50% ist wird der Lüfer ausgeschaltet
// 
// Die Schaltparameter (Mindesttemperaturen, Taupunktschwelle, ...) können in der Funktion "schalten" angepasst werden. 
//

function schalten(taupunkt_innen,taupunkt_aussen,temperatur_innen,humidity_innen) {
 print("schalten_aufgerufen ");

/////////////// Schaltparameter ///////////////
 let taupunktschwelle = 3; // in °C = Differenz zwischen Taupunkt innen ud aussen, ab der der Lüfter einschaltet
 let mindesttemperatur = 10; // in °C = unterhalb dieser Temperatur wird nicht gelüftet 
 let mindesthumi = 50; // in % = unterhalb dieser Schwelle wird nicht mehr gelüftet
//////////// Schaltparameter /////////////////

   if (temperatur_innen > mindesttemperatur && humidity_innen > mindesthumi) {
    if (taupunkt_innen > taupunkt_aussen + taupunktschwelle) {
      print("lüfter einschalten ");
      Shelly.call("Switch.Set", {id:0, on:true}); 
      } else {
        print("lüfter ausschalten");
      Shelly.call("Switch.Set", {id:0, on:false});;
      }
      }
    else {
        print("lüfter ausschalten weil zu kalt oder zu trocken");
      Shelly.call("Switch.Set", {id:0, on:false});
    }

}

///// Rotes Blinken falls Batterie zu schwach geworden
function anzeigen(bat_i,bat_a) {
let bat_schwelle = 200;

Shelly.call("Shelly.GetDeviceInfo", {}, function(res) { print(JSON.stringify(res)); let deviceId = res["device"]["id"]; print("Device ID: " + deviceId); });
 
if(bat_i < bat_schwelle)
{
 print("Batterie innen schwach");
 Shelly.call("Device.setStatus", { "id": deviceID, "led": { "mode": ledState ? "red" : "on" };
 return;
}

if(bat_a < bat_schwelle)
{
 print("Batterie aussen schwach");
 Shelly.call("Device.setStatus", { "id": deviceID, "led": { "mode": ledState ? "red" : "on" };
 return;
}

}


///// Feuchte und Temperatur aus KVS auslesen //////////////
function kvsGet(key1,key2,key3,key4) {
Shelly.call(
        "KVS.get",
        { "key": key1 },
        function (result) {
        taupi_innen = result.value;
        }
    );
    Shelly.call(
        "KVS.get",
        { "key": key2 },
        function (result) {
        taupi_aussen = result.value;
        }
    );
        Shelly.call(
        "KVS.get",
        { "key": key3 },
        function (result) {
        temp_innen = result.value;
        }
    );
        Shelly.call(
        "KVS.get",
        { "key": key4 },
        function (result) {
        humi_innen = result.value;
        }
    );
    
} /// Ende Auslesen

//// Batteriestand aus KVS auslesen //////////////
function kvsGet_bat(key5,key6) {
Shelly.call(
        "KVS.get",
        { "key": key5 },
        function (result) {
        bat_innen = result.value;
        }
    );
    Shelly.call(
        "KVS.get",
        { "key": key6 },
        function (result) {
        bat_aussen = result.value;
        }
    );
} /// Ende Auslesen




// Schleife für Schalten und Prüfen //////////////////////////////////////////////////////////////
  let taupi_innen;
  let taupi_aussen;
  let temp_innen;
  let humi_innen;
  let bat_innen;
  let bat_aussen;
  
Timer.set(10000, true, function(ud) { //Start Timerschleife
  kvsGet("taupunkt_innen","taupunkt_aussen","temperatur_innen","humidity_innen");
  print("Timerergebnis:"); 
  print(taupi_innen);
  print(taupi_aussen);
  print(temp_innen);
  print(humi_innen);
  schalten(taupi_innen,taupi_aussen,temp_innen,humi_innen);
  kvsGet_bat("battery_innen","battery_aussen");
  print(bat_innen);
  print(bat_aussen);
  anzeigen(bat_innen,bat_aussen);
     
 } // Ende Timerschleife
 , null);
