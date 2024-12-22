# Note: Replace **<YOUR_APPLICATION_TOKEN>** with your actual Application token

import requests



BASE_API_URL = "https://api.langflow.astra.datastax.com"
LANGFLOW_ID = "ba9567b8-0520-4840-80b1-36acf8e6a958"
FLOW_ID = "2002cfde-b5a5-4e96-a7ba-532599a98ecf"
APPLICATION_TOKEN = "AstraCS:tuxclDPQvmHJjgKeELsGEItg:9bcc496e4c7dc824337b78d48801e724793a5e455fcdd84f670d8c0957d3cd66"
ENDPOINT = "customerSupport" # You can set a specific endpoint name in the flow settings



def run_flow(message: str):
    """
    Run a flow with a given message and optional tweaks.

    :param message: The message to send to the flow
    :param endpoint: The ID or the endpoint name of the flow
    :param tweaks: Optional tweaks to customize the flow
    :return: The JSON response from the flow
    """
    api_url = f"{BASE_API_URL}/lf/{LANGFLOW_ID}/api/v1/run/{ENDPOINT}"

    payload = {
        "input_value": message,
        "output_type": "chat",
        "input_type": "chat",
    }
    headers = None
 

    headers = {"Authorization": "Bearer " + APPLICATION_TOKEN, "Content-Type": "application/json"}
    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()

result = run_flow("what are the shipment times")
response = result["outputs"][0]["outputs"][0]["results"]["message"]["text"]
print(response)