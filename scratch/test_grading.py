
import requests
import json

def test_real_grading():
    url = "http://localhost:8000/inference/grade"
    # Need a token. I'll check if I can get one or bypass auth for testing.
    # Actually, I'll just check the code to see if I can run the pipeline directly.
    pass

import asyncio
from backend.inference.pipeline import run_grading

async def run_test():
    question = "Explain the stages of mitosis in detail."
    student_answer = (
        "Mitosis consists of four main stages: Prophase, Metaphase, Anaphase, and Telophase. "
        "1. Prophase: Chromosomes condense and the nuclear envelope breaks down. "
        "2. Metaphase: Chromosomes line up at the equator of the cell. "
        "3. Anaphase: Sister chromatids are pulled apart to opposite poles. "
        "4. Telophase: New nuclear envelopes form around the two sets of chromosomes. "
        "Cytokinesis follows to divide the cytoplasm."
    )
    
    result = await run_grading(question, student_answer)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(run_test())
