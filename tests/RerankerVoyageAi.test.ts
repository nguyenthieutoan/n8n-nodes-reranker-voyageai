import { VoyageAIReranker } from '../nodes/RerankerVoyageAi/VoyageAIReranker';

describe('VoyageAIReranker', () => {
	it('should return empty array if documents are empty', async () => {
		const mockContext: any = {};
		const reranker = new VoyageAIReranker({
			apiKey: 'test-api-key',
			model: 'rerank-2.5-lite',
		}, mockContext);

		const results = await reranker.compressDocuments([], 'test query');
		expect(results).toEqual([]);
	});
});
