// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");

const cors = require("cors")({ origin: true });

admin.initializeApp();

var db = admin.database();
var ref = db.ref("items");
var ref2 = db.ref("items2");

exports.sendData = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    //update the data from realtime database
    var data = ref;
    data.update({
      distancia: req.body.distancia,
      peso: req.body.peso,
    });
  });
  res.status(200).json({ status: "succes!" });
});

exports.insertData = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "POST") {
      //update the data from realtime database
      var data = ref;
      data.child("general").set({
        ubicacion: req.body.ubicacion,
        estado: req.body.estado,
      });
      res.status(200).json({ status: "succes!" });
    } else {
      res.status(404).json({ status: "fail!" });
    }
  });
});

exports.accionRobot = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method == "GET") {
      var data = ref2;
      var accion = data.child("accion");
      accion.once("value", function (snap) {
        res.status(200).json({ accion: snap.val() });
      });
    }
    if (req.method == "POST") {
      var data = ref;
      data.update({
        accion: req.body.accion,
      });
      res.status(200).json({ status: "succes!" });
    }
  });
});

exports.salidaRobot = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "GET") {
      res.status(404).json({ status: "fail!" });
    }
    if (req.method === "POST") {
      //save data to one trip
      var data = ref;
      var temporal = data.child("contador");
      var contador = null;
      temporal.once("value", function (snap) {
        contador = snap.val();
        data.child("/viajes/" + "viaje" + contador + "/salida").set({
          peso: req.body.peso,
          fecha: admin.database.ServerValue.TIMESTAMP,
        });
      });
      res.status(200).json({ status: "succes!" });
    }
  });
});

exports.llegadaRobot = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "GET") {
      res.status(404).json({ status: "fail!" });
    }
    if (req.method === "POST") {
      //save data to one trip
      var data = ref;
      var temporal = data.child("contador");
      var contador = null;
      temporal.once("value", function (snap) {
        contador = snap.val();
        data.child("/viajes/" + "viaje" + contador + "/llegada").set({
          peso: req.body.peso,
          fecha: admin.database.ServerValue.TIMESTAMP,
          obstaculos: req.body.obstaculos,
        });
      });
      res.status(200).json({ status: "succes!" });
    }
  });
});

exports.regresoBuzon = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "GET") {
      res.status(404).json({ status: "fail!" });
    }
    if (req.method === "POST") {
      //save data to one trip
      var data = ref;
      var temporal = data.child("contador");
      var contador = null;
      temporal.once("value", function (snap) {
        contador = snap.val();
        data.child("/viajes/" + "viaje" + contador + "/retorno").set({
          fecha: admin.database.ServerValue.TIMESTAMP,
          obstaculos: req.body.obstaculos,
        });
        //actualizacion contador
        var conversion = Number(contador);
        console.log(conversion);
        conversion += 1;
        console.log(conversion);
        data.update({
          contador: conversion,
        });
      });
      res.status(200).json({ status: "succes!" });
    }
  });
});

exports.reporteUno = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "POST") {
      res.status(404).json({ status: "fail!" });
    }
    if (req.method === "GET") {
      //save data to one trip
      var data = ref;
      var temporal = data.child("/personas/");
      var valor = null;
      temporal.on("value", function (snap) {
        valor = snap.val();
      });
      res.status(200).json(valor);
    }
  });
});

exports.pushTemperatura = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "GET") {
      res.status(404).json({ status: "fail!" });
    }
    if (req.method === "POST") {
      //save data to one trip
      var data = ref;
      var temporal = data.child("contador");
      var contador = null;
      temporal.once("value", function (snap) {
        contador = snap.val();
        data.child("/personas/" + "persona" + contador + "/signosvitales").set({
          temperatura: req.body.temperatura,
        });
        //actualizacion contador
        var conversion = Number(contador);
        console.log(conversion);
        conversion += 1;
        console.log(conversion);
        data.update({
          contador: conversion,
        });
      });
      res.status(200).json({ status: "succes!" });
    }
  });
});

exports.getTemperatura = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    if (req.method === "POST") {
      res.status(404).json({ status: "fail!" });
    }
    if (req.method === "GET") {
      //save data to one trip
      var data = ref;
      var temporal = data.child("contador");
      var valor = null;
      var valor2 = null;
      temporal.on("value", function (snap) {
        valor = snap.val();
        var val3 = valor - 1;
        var temporal2 = data.child(
          "/personas/" + "persona" + val3 + "/signosvitales/temperatura"
        );
        temporal2.on("value", function (snap) {
          valor2 = snap.val();
          res.status(200).json({ contador: valor, temperatura: valor2 });
        });
      });
      /*var temporal2 = data.child(
        "/personas/" + "persona" + (valor - 1) + "/signosvitales/temperatura"
      );
      temporal2.on("value", function (snap) {
        valor2 = snap.val();
      });
      res.status(200).json({ contador: valor, temperatura: valor2 });*/
    }
  });
});
