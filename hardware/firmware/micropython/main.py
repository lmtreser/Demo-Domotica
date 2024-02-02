# Domotica con tecnologías de bajo costo
# Firmware escrito en Micropython para SoC ESP8266
# 2022 - Lucas Martin Treser

# Módulos
import network
from dht import DHT11
from machine import Pin, Timer
from time import sleep_ms
from umqtt.simple import MQTTClient

# Dispositivos
dht = DHT11(Pin(14)) # Pin D5
boton1 = Pin(12, Pin.IN, Pin.PULL_UP) # Pin D6
boton2 = Pin(13, Pin.IN, Pin.PULL_UP) # Pin D7
rele1 = Pin(5, Pin.OUT) # Pin D1
rele2 = Pin(4, Pin.OUT) # Pin D2

# Variables globales
estadoPulsador1 = False
estadoPulsador2 = False

# Conexión WiFi
wlan = network.WLAN(network.STA_IF)
if not wlan.active():
    wlan.active(True)

if not wlan.isconnected():
    wlan.connect("ACB2E624", "0043062806")
    print("Conectando...")
    while not wlan.isconnected():
        sleep_ms(1000)

config = wlan.ifconfig()
print(f"Conectado con IP {config[0]}")

# Funciones MQTT
def callback(topic, msg):

    # Recibo y decodifico los datos
    mensaje = msg.decode()
    topico = topic.decode()
    print(f"Llegó {mensaje} desde {topico}")

    if (topico == "home99/actuador1"):
        if (mensaje == "true"):
            rele1.value(1)
        else:
            rele1.value(0)
        
    if (topico == "home99/actuador2"):
        if (mensaje == "true"):
            rele2.value(1)
        else:
            rele2.value(0)
        
# Lectura de humedad y temperatura
def sensorDHT(timer):
    dht.measure()
    temp = dht.temperature()
    hum = dht.humidity()
    print(f"\nSensor1: {temp}°C | Sensor2: {hum}% \n")
    cliente.publish("home99/sensor1", str(temp))
    cliente.publish("home99/sensor2", str(hum))

# Timer0
tim = Timer(0)
tim.init(period=5000, mode=Timer.PERIODIC, callback=sensorDHT)

# Conexión MQTT
cliente = MQTTClient("esp8266-1007", "broker.hivemq.com", port=1883)
print("Conectando a servidor MQTT...")
cliente.set_callback(callback)
cliente.connect()
cliente.subscribe("home99/#")
print("Conectado")

# Bucle principal
while True:
    
    # Pulsador 1
    if (boton1.value() == False):
        sleep_ms(10)
        if (boton1.value() == True):
            estadoPulsador1 = not(estadoPulsador1)
            print("\nBoton1 pulsado! \n")
            cliente.publish("home99/actuador1", str(estadoPulsador1).lower())
    
    # Pulsador 2
    if (boton2.value() == False):
        sleep_ms(10)
        if (boton2.value() == True):
            estadoPulsador2 = not(estadoPulsador2)
            print("\nBoton2 pulsado! \n")
            cliente.publish("home99/actuador2", str(estadoPulsador2).lower())
    
    cliente.check_msg()

cliente.disconnect()