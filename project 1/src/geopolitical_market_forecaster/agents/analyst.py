from geopolitical_market_forecaster.models import (
    EconomicInsight,
    NewsItem,
    SignalTier,
)


class EconomicAnalystAgent:
    """Turns news items into market-oriented insights."""

    async def analyze(self, item: NewsItem) -> EconomicInsight:
        return EconomicInsight(
            news_item=item,
            signal_tier=SignalTier.fyi,
            themes=["geopolitical risk", "market sentiment"],
            affected_markets=["energy", "shipping", "regional equities"],
            rationale="Initial scaffold uses deterministic analysis until LLM support is added.",
        )
