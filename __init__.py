#a simple netwrok manager
#every message is a key vale
import json
import websocket_server
from StringIO import StringIO

clients=[]

def register(id):
    pass

def send(key,value,dest=None):
    global gserver
    msg = StringIO()
    json.dump({key:value}, msg);
    print (msg.getvalue())
    if (dest == None):
        print ("sending to all")
        gserver.send_message_to_all(msg.getvalue())
    else:
        print ("sending to {0}:".format(dest))
        gserver.send_message(dest, msg.getvalue())

_on_msg_callbacks=[]
def on_msg(call_back):
    _on_msg_callbacks.append(call_back)

def on_message(client, server, msg):
    global gserver
    print("received message {0}".format(msg))
    gserver.send_message_to_all(msg)

from websocket_server import WebsocketServer

def new_client(client, server):
    #server.send_message_to_all("Hey all, a new client has joined us")
    print("new connection received")
    clients.append(client)

def leaving_client(client,server):
    clients.remove(client)    

if __name__ == "__main__":
    global gserver
    gserver = WebsocketServer(8000)
    gserver.set_fn_new_client(new_client)
    gserver.set_fn_message_received(on_message)
    gserver.set_fn_client_left(leaving_client)
    gserver.run_forever()



