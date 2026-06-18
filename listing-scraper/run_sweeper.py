import logging,sys

from services.state import StateUpdater

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)

logger = logging.getLogger(__name__)

sweeper = StateUpdater()
sweeper.run_global_sweeper()