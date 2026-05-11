from geopolitical_market_forecaster.agents.analyst import EconomicAnalystAgent
from geopolitical_market_forecaster.agents.governor import GovernorAgent
from geopolitical_market_forecaster.agents.predictor import PredictorAgent
from geopolitical_market_forecaster.agents.scraper import ScraperAgent
from geopolitical_market_forecaster.config import Settings
from geopolitical_market_forecaster.models import GovernanceReview, PipelineResult


class ForecastPipeline:
    def __init__(self, settings: Settings):
        self.scraper = ScraperAgent(settings)
        self.analyst = EconomicAnalystAgent()
        self.predictor = PredictorAgent()
        self.governor = GovernorAgent()

    async def run(self) -> PipelineResult:
        items = await self.scraper.collect()
        reviews: list[GovernanceReview] = []

        for item in items:
            insight = await self.analyst.analyze(item)
            forecast = await self.predictor.forecast(insight)
            review = await self.governor.review(forecast)
            reviews.append(review)

        return PipelineResult(items_collected=len(items), reviews=reviews)
