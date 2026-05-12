import pytest

from geopolitical_market_forecaster.agents.analyst import EconomicAnalystAgent
from geopolitical_market_forecaster.config import Settings
from geopolitical_market_forecaster.models import NewsItem, SignalTier


@pytest.mark.asyncio
async def test_rule_based_analysis_detects_market_themes():
    item = NewsItem(
        title="Oil shipping risk rises near the Red Sea",
        source="Test",
        url="https://example.com/oil-shipping",
        summary="Regional tension affects energy and shipping markets.",
    )

    insight = await EconomicAnalystAgent(
        Settings(analysis_provider="rule_based")
    ).analyze(item)

    assert insight.signal_tier == SignalTier.actionable
    assert "energy supply" in insight.themes
    assert "shipping risk" in insight.themes
    assert "energy" in insight.affected_markets


@pytest.mark.asyncio
async def test_gemini_analysis_placeholder_without_key():
    item = NewsItem(
        title="Market update",
        source="Test",
        url="https://example.com/market-update",
    )

    insight = await EconomicAnalystAgent(Settings(analysis_provider="gemini")).analyze(
        item
    )

    assert insight.signal_tier == SignalTier.fyi
    assert "GEMINI_API_KEY is not set" in insight.rationale
