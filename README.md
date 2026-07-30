# n8n-nodes-reranker-voyageai

Developed and maintained by **[Jay Nguyen (Nguyễn Thiệu Toàn)](https://nguyenthieutoan.com)**.

🛡️ **[Verified n8n Creator](https://n8n.io/creators/nguyenthieutoan)** | 💼 CEO/Founder of **[GenStaff](https://genstaff.net)**

**Connect with me:**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nguyenthieutoan) [![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white)](https://www.facebook.com/nguyenthieutoan) [![Website](https://img.shields.io/badge/Website-nguyenthieutoan.com-brightgreen?style=flat)](https://nguyenthieutoan.com) [![Email](https://img.shields.io/badge/Email-me%40nguyenthieutoan.com-blue?style=flat)](mailto:me@nguyenthieutoan.com)

---

Voyage AI Reranker node for n8n. This node allows you to use Voyage AI's powerful reranking models (e.g. rerank-2.5) to reorder retrieved documents from a vector store, improving search relevance in RAG architectures.

## Features

* **Advanced Reranking**: Uses Voyage AI's Cross-Encoder architecture to precisely evaluate document relevance.
* **Top K Selection**: Filter down to only the most relevant documents to save LLM token costs.
* **Instruction Following**: Compatible with `rerank-2.5` which can follow natural language instructions in the query.
* **Zero-dependency**: Built natively for n8n without heavy external SDK dependencies.

## Installation

Go to **Settings > Community Nodes** in your n8n instance and install:

```bash
n8n-nodes-reranker-voyageai
```

## Credentials Configuration

1. Get your API Key from the [Voyage AI Dashboard](https://dash.voyageai.com/api-keys).
2. In n8n, set up a new **Voyage API** credential:
   * **API Key**: Enter your Voyage API key.

## Usage

This node is meant to be used as a **Sub-node** (AI Reranker) connected to a Document Retriever (such as the Vector Store Retriever in n8n's Advanced AI tools).

1. Add a **Vector Store** node and set its operation to Retrieve.
2. Connect the **Voyage AI Reranker** node to the Document Compressor / Reranker input of the Vector Store node.
3. Configure the `Model` (e.g. `rerank-2.5-lite`) and `Top K` documents to return.

## Workflow Example

*(Provide a JSON workflow snippet here so users can copy-paste it directly into their n8n canvas)*

<details>
<summary><b>Click to expand Workflow JSON</b></summary>

```json
{
  "nodes": [
    {
      "parameters": {
        "model": "rerank-2.5-lite",
        "topK": 3
      },
      "id": "example-voyage-reranker",
      "name": "Voyage AI Reranker",
      "type": "n8n-nodes-reranker-voyageai.rerankerVoyageAi",
      "typeVersion": 1,
      "position": [400, 200]
    }
  ],
  "connections": {}
}
```
</details>

## Nodes

| Node | Type | Description |
|------|------|-------------|
| Voyage AI Reranker | Sub-node | Reorder documents by relevance to a given query |

## License

[MIT](LICENSE)
