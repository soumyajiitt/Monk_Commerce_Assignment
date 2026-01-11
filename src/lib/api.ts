import type { Product } from "@/types/product";

const BASE_URL = "https://stageapi.monkcommerce.app/task/products/search";

export async function searchProducts(query: string = "", page: number = 1, limit: number = 10): Promise<Product[]> {
  const url = new URL(BASE_URL);
  url.searchParams.append("search", query);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "x-api-key": "72njgfa948d9aS7gs5"
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
