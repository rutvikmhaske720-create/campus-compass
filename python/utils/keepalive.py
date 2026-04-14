import threading
import time
import requests
import os

def keep_alive():
    """Send GET request to self every 14 minutes to prevent sleeping"""
    while True:
        try:
            # Get the service URL from environment
            port = os.environ.get('PORT', '5000')
            service_url = f"http://127.0.0.1:{port}"
            
            # Make a GET request to the health endpoint
            response = requests.get(f"{service_url}/health", timeout=30)
            
            if response.status_code == 200:
                print(f"Keep-alive ping successful: {response.json()}")
            else:
                print(f"Keep-alive ping failed with status: {response.status_code}")
                
        except Exception as e:
            print(f"Keep-alive ping error: {str(e)}")
        
        # Wait 14 minutes (840 seconds)
        time.sleep(840)

def start_keepalive():
    """Start the keep-alive thread with delay - only in production"""
    if not os.environ.get('PORT'):
        print("Keep-alive disabled in development mode")
        return
        
    def delayed_start():
        time.sleep(60)  # Wait 1 minute for server to fully start
        keep_alive()
    
    keepalive_thread = threading.Thread(target=delayed_start, daemon=True)
    keepalive_thread.start()
    print("Keep-alive service will start in 60 seconds")