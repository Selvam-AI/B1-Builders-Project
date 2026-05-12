from geopolitical_market_forecaster.config import Settings
from geopolitical_market_forecaster.models import (
    EconomicInsight,
    NewsItem,
    SignalTier,
)


class EconomicAnalystAgent:
    """Turns news items into market-oriented insights."""

    def __init__(self, settings: Settings | None = None):
        self.settings = settings

    async def analyze(self, item: NewsItem) -> EconomicInsight:
        provider = self.settings.analysis_provider if self.settings else "rule_based"
        if provider == "gemini":
            return await self._analyze_with_gemini(item)
        return self._analyze_with_rules(item)

    def _analyze_with_rules(self, item: NewsItem) -> EconomicInsight:
        text = f"{item.title} {item.summary or ''} {item.raw_text or ''}".lower()
        themes: list[str] = []
        affected_markets: list[str] = []

        if any(term in text for term in ["oil", "gas", "energy", "opec"]):
            themes.append("energy supply")
            affected_markets.append("energy")
        if any(term in text for term in ["shipping", "strait", "red sea", "suez"]):
            themes.append("shipping risk")
            affected_markets.append("shipping")
        if any(term in text for term in ["sanction", "tariff", "trade"]):
            themes.append("trade policy")
            affected_markets.append("currencies")
        if any(term in text for term in ["war", "missile", "attack", "tension"]):
            themes.append("geopolitical risk")
            affected_markets.append("regional equities")

        if not themes:
            themes = ["market sentiment"]
        if not affected_markets:
            affected_markets = ["regional equities"]

        signal_tier = SignalTier.actionable if len(themes) >= 2 else SignalTier.fyi

        return EconomicInsight(
            news_item=item,
            signal_tier=signal_tier,
            themes=themes,
            affected_markets=affected_markets,
            rationale="Rule-based analysis from keyword signals in the article title, summary, and body text.",
        )

    async def _analyze_with_gemini(self, item: NewsItem) -> EconomicInsight:
        if not self.settings or not self.settings.gemini_api_key:
            return EconomicInsight(
                news_item=item,
                signal_tier=SignalTier.fyi,
                themes=["market sentiment"],
                affected_markets=["regional equities"],
                rationale=(
                    "Gemini analysis was selected, but GEMINI_API_KEY is not set. "
                    "Fell back to a conservative placeholder insight."
                ),
            )

        return EconomicInsight(
            news_item=item,
            signal_tier=SignalTier.fyi,
            themes=["market sentiment"],
            affected_markets=["regional equities"],
            rationale=(
                f"Gemini provider placeholder configured for {self.settings.gemini_model}; "
                "LLM prompt execution will be implemented in a later step."
            ),
        )
