import { NodeApiError, type ISupplyDataFunctions } from 'n8n-workflow';

/* eslint-disable @typescript-eslint/no-var-requires */
export function requireN8nDependency(dependencyName: string): any {
	try { return require(dependencyName); } catch (_) {}
	if (require.main && require.main.paths) {
		try {
			const p = require.resolve(dependencyName, { paths: require.main.paths });
			return require(p);
		} catch (_) {}
	}
	try {
		const workflowResolve = require.resolve('n8n-workflow');
		const index = workflowResolve.indexOf('node_modules');
		if (index !== -1) {
			const base = workflowResolve.substring(0, index + 12);
			return require(base + '/' + dependencyName);
		}
	} catch (_) {}
	throw new Error(`Could not resolve ${dependencyName} from n8n's runtime`);
}

export function getAiUtilities(): any {
	try {
		const dep = ['@n8n', 'ai-utilities'].join('/');
		return requireN8nDependency(dep);
	} catch (e) {
		return {
			getConnectionHintNoticeField: (hints: any) => ({
				displayName: '',
				name: 'notice',
				type: 'notice',
				default: '',
			}),
			logWrapper: (instance: any, context: any) => instance,
		};
	}
}

export interface VoyageAIRerankArgs {
	apiKey: string;
	model: string;
	topK?: number;
	truncation?: boolean;
}

// Local mock class to satisfy TS
class LocalBaseDocumentCompressor {
	async compressDocuments(documents: any[], query: string): Promise<any[]> {
		return documents;
	}
}

export class VoyageAIReranker extends LocalBaseDocumentCompressor {
	private apiKey: string;
	private model: string;
	private topK?: number;
	private truncation?: boolean;
	private parentContext: ISupplyDataFunctions;
	private DocumentClass: any;

	constructor(fields: VoyageAIRerankArgs, parentContext: ISupplyDataFunctions) {
		super();
		patchVoyageRerankerPrototype();
		this.apiKey = fields.apiKey;
		this.model = fields.model;
		this.topK = fields.topK;
		this.truncation = fields.truncation;
		this.parentContext = parentContext;
		
		try {
			this.DocumentClass = requireN8nDependency('@langchain/core/documents').Document;
		} catch (e) {
			// Fallback mock Document class if needed
			this.DocumentClass = class Document {
				pageContent: string;
				metadata: Record<string, any>;
				constructor(fields: { pageContent: string, metadata: Record<string, any> }) {
					this.pageContent = fields.pageContent;
					this.metadata = fields.metadata;
				}
			};
		}
	}

	async compressDocuments(documents: any[], query: string): Promise<any[]> {
		if (documents.length === 0) {
			return [];
		}

		const texts = documents.map((doc) => doc.pageContent);

		const payload: Record<string, any> = {
			query,
			documents: texts,
			model: this.model,
			return_documents: false,
		};

		if (this.topK !== undefined) {
			payload.top_k = this.topK;
		}
		if (this.truncation !== undefined) {
			payload.truncation = this.truncation;
		}

		let jsonResponse: any;

		try {
			jsonResponse = await this.parentContext.helpers.httpRequest({
				method: 'POST',
				url: 'https://api.voyageai.com/v1/rerank',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.apiKey}`,
				},
				body: payload,
				json: true,
			});
		} catch (error) {
			throw new NodeApiError(this.parentContext.getNode(), error as any);
		}

		if (!jsonResponse || !jsonResponse.data || !Array.isArray(jsonResponse.data)) {
			throw new NodeApiError(this.parentContext.getNode(), jsonResponse as any, {
				message: 'Invalid data format returned from Voyage API.',
			});
		}

		const results: any[] = [];
		for (const item of jsonResponse.data) {
			const index = item.index;
			const doc = documents[index];
			results.push(
				new this.DocumentClass({
					pageContent: doc.pageContent,
					metadata: {
						...doc.metadata,
						relevance_score: item.relevance_score,
					},
				})
			);
		}

		return results;
	}
}

let prototypePatched = false;

function patchVoyageRerankerPrototype() {
	if (prototypePatched) return;
	try {
		const dep = ['@langchain', 'core', 'retrievers', 'document_compressors'].join('/');
		const LangChainBaseDocumentCompressor = requireN8nDependency(dep).BaseDocumentCompressor;
		if (LangChainBaseDocumentCompressor && LangChainBaseDocumentCompressor.prototype) {
			Object.setPrototypeOf(VoyageAIReranker.prototype, LangChainBaseDocumentCompressor.prototype);
		}
		prototypePatched = true;
	} catch (e) {}
}
