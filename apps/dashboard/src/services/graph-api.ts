import { API_CONFIG } from './api-config';
import { GraphRequest } from './schemas'; // We'll create this schema file next

// Define the shape of the successful response from your backend
export interface GraphData {
  nodes: {
    id: string;
    label: string;
    isBestMatch: boolean;
    type: string;
    score: number;
  }[];
  edges: {
    from: string;
    to: string;
    label: string;
  }[];
}

export interface BestMatch {
  id: string;
  address: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  details?: string;
  score: {
    isLocationMatch: boolean;
    isPriceMatch: boolean;
    isBedsMatch: boolean;
    isBathsMatch: boolean;
    matchScore: number;
  };
  rationale: string;
}

export interface GraphResponse {
  bestMatch: BestMatch | null;
  graphData: GraphData;
}

/**
 * Calls the Python searching-agent to generate an opportunity graph.
 * @param criteria The unstructured notes from the call log.
 */
export async function generateGraph(
  criteria: GraphRequest,
): Promise<GraphResponse> {
  try {
    const response = await fetch(
      `${API_CONFIG.SEARCHING_AGENT_URL}/generate-graph`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateGraph service:', error);
    throw error;
  }
}
