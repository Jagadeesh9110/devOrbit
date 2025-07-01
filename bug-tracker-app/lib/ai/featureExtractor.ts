let featureExtractor: any = null;

export async function getFeatureExtractor() {
  if (!featureExtractor) {
    const { pipeline } = await import("@xenova/transformers");
    featureExtractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return featureExtractor;
}
