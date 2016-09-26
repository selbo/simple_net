#a simple netwrok manager
#every message is a key vale
#testinh
def register(id):
    pass

def send(key,value,dest=None):
    pass

_on_msg_callbacks=[]
def on_msg(call_back):
    _on_msg_callbacks.append(call_back)

from websocket_server import WebsocketServer

def new_client(client, server):
    server.send_message_to_all("Hey all, a new client has joined us")

if __name__ == "__main__":
    server = WebsocketServer(13254)
    server.set_fn_new_client(new_client)
    server.run_forever()



