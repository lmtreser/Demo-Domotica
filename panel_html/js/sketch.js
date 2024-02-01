/* Variables Broker MQTT */
let mqtt;
let reconnectTimeout = 2000;
let host = "broker.hivemq.com";
let port = 8000;
let broker_status = "offline";
let cliente = "clientPW01";

/* Variables estados */
let boton_cocina = false;
let boton_living = false;

function setup() {

  // Generar un ID aleatorio
  cliente = "clientPW" + minute() + second();
  MQTTconnect();

  // Actualizar tarjeta "Datos del Servidor"
  let div_host = document.getElementById("div_host");
  let div_port = document.getElementById("div_port");
  let div_clientid = document.getElementById("div_clientid");
  div_host.innerHTML = "Host: " + host;
  div_port.innerHTML = "Puerto: " + port;
  div_clientid.innerHTML = "ID Cliente: " + cliente;
}

function draw() {}

/* --- EVENTOS MEDIANTE BOTONES --- */
function evento_living() {
  let boton = document.getElementById("but_living");
  boton_living = !boton_living;
  print("Botón living presionado, estado: ", boton_living);

  // Enviar estado del boton por MQTT
  message = new Paho.MQTT.Message(str(boton_living));
  message.destinationName = "home99/actuador1";
  mqtt.send(message);
}

function evento_cocina() {
  let boton = document.getElementById("but_cocina");
  boton_cocina = !boton_cocina;
  print("Botón cocina presionado, estado: ", boton_cocina);

  // Enviar estado del boton por MQTT
  message = new Paho.MQTT.Message(str(boton_cocina));
  message.destinationName = "home99/actuador2";
  mqtt.send(message);
}

/* --- FORMULARIO MQTT --- */
function formMqtt() {
  let input1 = document.getElementById("input1");
  let input2 = document.getElementById("input2");
  host = str(input1.value);
  port = int(input2.value);
  print("Reconectando...");
  MQTTconnect();
}

/* --- FUNCIONES MQTT --- */
function onConnect() {
  print(mqtt.clientId, "conectado");
  let div_status = document.getElementById("div_status");
  div_status.innerHTML = "Estado: ONLINE";
  mqtt.subscribe("home99/sensor1");
  mqtt.subscribe("home99/sensor2");
  mqtt.subscribe("home99/actuador1");
  mqtt.subscribe("home99/actuador2");
}

function onMessageArrived(message) {
  print("Topic: ", message.topic, "Mensaje: ", message.payloadString);
  let h4_temp = document.getElementById("h4_temp");
  let h4_hum = document.getElementById("h4_hum");
  let img_living = document.getElementById("div_luz_living");
  let img_cocina = document.getElementById("div_luz_cocina");

  // De acuerdo al mensaje que llegue, modificar el panel
  switch (message.topic) {
    case "home99/sensor1":
      h4_temp.innerHTML = "Temperatura: " + message.payloadString + " °C";
      break;

    case "home99/sensor2":
      h4_hum.innerHTML = "Humedad: " + message.payloadString + " %RH";
      break;

    case "home99/actuador1":
      boton_living = boolean(message.payloadString);
      if (message.payloadString == "true") {
        img_living.src = "img/lamp_on.svg";
      } else {
        img_living.src = "img/lamp_off.svg";
      }
      break;

    case "home99/actuador2":
      boton_cocina = boolean(message.payloadString);
      if (message.payloadString == "true") {
        img_cocina.src = "img/lamp_on.svg";
      } else {
        img_cocina.src = "img/lamp_off.svg";
      }
      break;
  }
}

function MQTTconnect() {
  print("Conectando a " + host + " " + port);
  mqtt = new Paho.MQTT.Client(host, port, cliente); // Crear un objeto cliente
  let options = {
    timeout: 3,
    onSuccess: onConnect,
  };

  mqtt.onMessageArrived = onMessageArrived;
  mqtt.connect(options); // Conectar
}
