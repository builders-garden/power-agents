import { getDefiRecommendation } from "../defi-saver-logic";

async function testGetDefiRecommendation() {
  try {
    const userPreferencesPrompt = "I prefer high-risk investments with no stable returns. I'm interested in stablecoin pools on base.";
    const amount = 1000;

    const result = await getDefiRecommendation(userPreferencesPrompt, amount);
    console.log("Recommendation Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error testing getDefiRecommendation:", error);
  }
}


testGetDefiRecommendation();