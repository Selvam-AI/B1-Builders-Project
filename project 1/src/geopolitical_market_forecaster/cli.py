import argparse
import asyncio
import json

from geopolitical_market_forecaster.config import get_settings
from geopolitical_market_forecaster.orchestration.pipeline import ForecastPipeline
from geopolitical_market_forecaster.storage import initialize_database


async def run_pipeline() -> None:
    settings = get_settings()
    initialize_database(settings.database_url)
    result = await ForecastPipeline(settings).run()
    print(json.dumps(result.model_dump(mode="json"), indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Geopolitical Market Forecaster CLI")
    parser.add_argument(
        "command",
        choices=["run-pipeline"],
        help="Command to execute.",
    )
    args = parser.parse_args()

    if args.command == "run-pipeline":
        asyncio.run(run_pipeline())


if __name__ == "__main__":
    main()
