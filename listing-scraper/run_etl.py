import logging
import sys
from etl.pipeline import ETLPipeline



logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
if __name__ == "__main__":
    pipeline = ETLPipeline()
    pipeline.run()