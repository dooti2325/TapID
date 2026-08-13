import os
import sys
from nemotron_service import NemotronService

def main():
    print("Testing Nemotron Integration...\n")
    try:
        # The service will automatically pick up the NVIDIA_API_KEY from the environment
        service = NemotronService()
        print("Successfully initialized NemotronService.")
        
        prompt = "Explain reinforcement learning to me with a robotics example in 2 sentences."
        print(f"\nSending prompt: '{prompt}'")
        
        response = service.generate_response(prompt=prompt)
        
        print("\n--- Nemotron Response ---")
        print(response)
        print("-------------------------")
        print("\nIntegration test successful!")
        
    except ValueError as ve:
        print(f"Configuration Error: {ve}")
        print("\nPlease ensure NVIDIA_API_KEY is added to your .env file and never committed to Git.")
        sys.exit(1)
    except Exception as e:
        print(f"Error during Nemotron API call: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
