from geopolitical_market_forecaster.config import Settings
from geopolitical_market_forecaster.models import NewsItem


class ScraperAgent:
    """Collects and normalizes market-relevant news."""

    def __init__(self, settings: Settings):
        self.settings = settings

    async def collect(self) -> list[NewsItem]:
        return [
            NewsItem(
                title="Placeholder Middle East market signal",
                source="Local scaffold",
                url="https://example.com/geopolitical-market-signal",
                region=self.settings.default_region,
                summary=(
                    "Placeholder item used until live RSS or news API ingestion "
                    "is implemented."
                ),
            )
        ]
