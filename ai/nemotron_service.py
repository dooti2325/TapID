import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables (e.g. from a .env file in the project root)
load_dotenv()

class NemotronService:
    def __init__(self, api_key: str = None):
        """
        Initialize the NemotronService with the NVIDIA API key.
        If api_key is not provided, it will attempt to read the NVIDIA_API_KEY
        from the environment variables.
        """
        self.api_key = api_key or os.environ.get("NVIDIA_API_KEY")
        if not self.api_key:
            raise ValueError("NVIDIA_API_KEY is not set. Please set it in your .env file or environment variables.")
            
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=self.api_key
        )
        self.model = "nvidia/llama-3.3-nemotron-super-49b-v1"

    def generate_response(self, prompt: str, system_prompt: str = None, temperature: float = 0.7, max_tokens: int = 3000) -> str:
        """
        Generate a response from the Nemotron model for a given prompt.
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            raise RuntimeError(f"Failed to generate response from Nemotron API: {e}")
