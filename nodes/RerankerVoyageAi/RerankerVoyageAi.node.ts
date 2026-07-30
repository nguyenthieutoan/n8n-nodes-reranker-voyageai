import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';
import { VoyageAIReranker, getAiUtilities } from './VoyageAIReranker';

export class RerankerVoyageAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Voyage AI Reranker',
		name: 'rerankerVoyageAi',
		icon: 'file:voyage.svg',
		group: ['transform'],
		version: 1,
		description: 'Use Voyage AI Reranker to reorder documents by relevance to the given query',
		defaults: {
			name: 'Voyage AI Reranker',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Rerankers'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.voyageai.com/docs/reranker',
					},
				],
			},
		},
		inputs: [],
		outputs: [NodeConnectionTypes.AiReranker],
		outputNames: ['Reranker'],
		credentials: [
			{
				name: 'voyageApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description: 'The Voyage AI model to use for reranking',
				default: 'rerank-2.5-lite',
				options: [
					{
						name: 'rerank-2.5',
						value: 'rerank-2.5',
						description: 'Highest quality, instruction-following, multilingual',
					},
					{
						name: 'rerank-2.5-lite',
						value: 'rerank-2.5-lite',
						description: 'Balanced latency & quality, instruction-following',
					},
					{
						name: 'rerank-2',
						value: 'rerank-2',
						description: 'General quality generation 2, multilingual',
					},
					{
						name: 'rerank-2-lite',
						value: 'rerank-2-lite',
						description: 'Low latency generation 2, multilingual',
					},
					{
						name: 'rerank-1',
						value: 'rerank-1',
					},
					{
						name: 'rerank-lite-1',
						value: 'rerank-lite-1',
					},
				],
			},
			{
				displayName: 'Top K',
				name: 'topK',
				type: 'number',
				description: 'The maximum number of documents to return after reranking',
				default: 3,
			},
			{
				displayName: 'Truncation',
				name: 'truncation',
				type: 'boolean',
				description: 'Whether to automatically truncate documents exceeding the context limit',
				default: true,
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const model = this.getNodeParameter('model', itemIndex, 'rerank-2.5-lite') as string;
		const topK = this.getNodeParameter('topK', itemIndex, 3) as number;
		const truncation = this.getNodeParameter('truncation', itemIndex, true) as boolean;
		
		const credentials = await this.getCredentials<{ apiKey: string }>('voyageApi');

		const reranker = new VoyageAIReranker({
			apiKey: credentials.apiKey,
			model,
			topK,
			truncation,
		}, this);

		return {
			response: getAiUtilities().logWrapper(reranker, this),
		};
	}
}
