import { memo, useCallback, useEffect, useState } from "react";
/*
你需要實作一個商品列表頁面，包含以下功能：
1. 有一個輸入框可讓使用者即時輸入關鍵字，以篩選商品名稱。
2. 商品資料來自 API 呼叫提供的 API: - searchProducts(query, page) - 返回 Promise，模擬 API 請求。
3. 請實作一個 React component，並使用 Hooks，做到下列效果：
4. 使用者輸入文字，會立刻根據商品名稱過濾結果
5. 請確保使用者連續快速輸入時，不會每次都重複觸發 API，而是有防抖效果（debounce）。
6. 請你示範使用 Hooks 做最佳化處理，避免不必要的 re-render。

(進階需求) 搜尋時顯示 loading 狀態 
(進階需求) 優化函數，避免不必要的重新渲染 
(進階需求) 實作簡單的錯誤處理 
(進階需求) 實作無限滾動載入更多結果
*/

// 模擬資料
const mockProducts = [
  { id: 1, name: "iPhone 15", price: 32900 },
  { id: 2, name: "iPhone 15 Pro", price: 42900 },
  { id: 3, name: "iPhone 15 Pro Max", price: 49900 },
  { id: 4, name: "AirPods Pro", price: 7990 },
  { id: 5, name: "MacBook Air", price: 34900 },
  { id: 6, name: "MacBook Pro", price: 74900 },
  { id: 7, name: "iPad Pro", price: 27900 },
  { id: 8, name: "Apple Watch", price: 14900 },
  { id: 9, name: "iMac", price: 39900 },
];

// 模擬搜尋 API
function searchProducts(query: string, page = 1) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error("搜尋失敗，請再試一次"));
        return;
      }
      
      const results = mockProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      
      const pageSize = 3;
      const paginatedResults = results.slice((page - 1) * pageSize, page * pageSize);
      
      resolve({
        data: paginatedResults,
        total: results.length,
        hasMore: page * pageSize < results.length
      });
    }, 800);
  });
}

type Product = {
  id: number;
  name: string;
  price: number;
};

type SearchResult = {
  data: Product[];
  total: number;
  hasMore: boolean;
};

function useDebounce(value: string, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

const ProductItem = memo(({ product }: { product: Product }) => (
  <div className="p-4 border rounded mb-2">
    <h3 className="font-semibold">{product.name}</h3>
    <p>NT$ {product.price.toLocaleString()}</p>
  </div>
));

export default function DebounceSearch() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  
  const debouncedQuery = useDebounce(query, 300);
  
  const fetchProducts = useCallback(async (searchQuery: string, pageNum: number, reset: boolean) => {
    // Only clear products if this is a new search (reset is true)
    if (reset) {
      setProducts([]);
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchProducts(searchQuery, pageNum) as SearchResult;
      setProducts(prev => reset ? result.data : [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(query, nextPage, false);
    }
  }, [fetchProducts, hasMore, isLoading, page, query]);
  
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >= 
      document.documentElement.offsetHeight - 100 &&
      hasMore &&
      !isLoading
    ) {
      handleLoadMore();
    }
  }, [handleLoadMore, hasMore, isLoading]);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setProducts([]);
      setHasMore(false);
      setTotal(0);
    } else {
      fetchProducts(debouncedQuery, 1, true);
    }
  }, [debouncedQuery, fetchProducts]);
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  
  return (
    <div className="flex justify-center items-center flex-col p-4">
      <h1 className="text-2xl font-bold mb-6">商品搜尋</h1>
      
      {/* 搜尋輸入框 */}
      <div className="mb-6 ">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="輸入商品名稱..."
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {query.trim() !== "" && total > 0 && (
          <p className="flex justify-center mt-2 text-sm text-gray-500">找到 {total} 個結果</p>
        )}
      </div>
      
      {/* 載入中狀態 */}
      {isLoading && page === 1 && (
        <div className="text-center py-4">
          <p>載入中...</p>
        </div>
      )}
      
      {/* 搜尋結果 */}
      {products.length > 0 && (
        <div className="mb-6">
          {products.map(product => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {/* 無結果 */}
      {query.trim() !== "" && !isLoading && products.length === 0 && !error && (
        <p className="text-center py-4">沒有找到符合的商品</p>
      )}
      
      {/* 錯誤訊息 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span>{error}</span>
        </div>
      )}
      
      {/* 載入更多 */}
      {hasMore && !isLoading && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            載入更多
          </button>
        </div>
      )}
      
      {/* 底部載入中提示 */}
      {isLoading && page > 1 && (
        <div className="text-center py-4">
          <p>載入更多中...</p>
        </div>
      )}
    </div>
  );
}