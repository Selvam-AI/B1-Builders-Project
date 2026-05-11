import pytest

from geopolitical_market_forecaster.config import get_settings
from geopolitical_market_forecaster.orchestration.pipeline import ForecastPipeline


@pytest.mark.asyncio
async def test_pipeline_returns_governed_result():
    result = await ForecastPipeline(get_settings()).run()

    assert result.items_collected == 1
    assert len(result.reviews) == 1
    assert result.reviews[0].approved is True
