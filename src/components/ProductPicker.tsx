import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchProducts } from "@/lib/api";
import type { Product, Variant } from "@/types/product";
import { Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProductPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selected: Product[]) => void;
  initialSelection?: Product[];
  maxSelection?: number;
  disabledProductIds?: number[];
}

export const ProductPicker: React.FC<ProductPickerProps> = ({
  isOpen,
  onClose,
  onAdd,
  initialSelection = [],
  maxSelection,
  disabledProductIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialSelection);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchProducts = async (query: string, pageNum: number, isNewSearch: boolean) => {
    setLoading(true);
    const results = await searchProducts(query, pageNum);
    if (isNewSearch) {
      setProducts(results);
    } else {
      setProducts((prev) => [...prev, ...results]);
    }
    setHasMore(results.length > 0);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchProducts(searchTerm, 1, true);
      setSelectedProducts(initialSelection);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen) {
        setPage(1);
        fetchProducts(searchTerm, 1, true);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(searchTerm, page, false);
    }
  }, [page]);

  const isVariantSelected = (productId: number, variantId: number) => {
    const product = selectedProducts.find((p) => p.id === productId);
    return product?.variants.some((v) => v.id === variantId) || false;
  };

  const isProductSelected = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;
    const selected = selectedProducts.find((p) => p.id === productId);
    if (!selected) return false;
    return selected.variants.length === product.variants.length;
  };

  const isProductPartiallySelected = (productId: number) => {
    const selected = selectedProducts.find((p) => p.id === productId);
    if (!selected) return false;
    const product = products.find((p) => p.id === productId);
    if (!product) return false;
    return selected.variants.length > 0 && selected.variants.length < product.variants.length;
  };

  const toggleVariant = (product: Product, variant: Variant) => {
    setSelectedProducts((prev) => {
      const existingProduct = prev.find((p) => p.id === product.id);
      if (existingProduct) {
        const isSelected = existingProduct.variants.some((v) => v.id === variant.id);
        let newVariants;
        if (isSelected) {
          newVariants = existingProduct.variants.filter((v) => v.id !== variant.id);
        } else {
          newVariants = [...existingProduct.variants, variant];
        }

        if (newVariants.length === 0) {
          return prev.filter((p) => p.id !== product.id);
        }

        return prev.map((p) =>
          p.id === product.id ? { ...p, variants: newVariants } : p
        );
      } else {
        if (maxSelection && prev.length >= maxSelection) return prev;
        return [...prev, { ...product, variants: [variant] }];
      }
    });
  };

  const toggleProduct = (product: Product) => {
    const isSelected = isProductSelected(product.id);
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      const productInList = selectedProducts.some(p => p.id === product.id);
      if (!productInList && maxSelection && selectedProducts.length >= maxSelection) return;
      
      setSelectedProducts((prev) => {
        const filtered = prev.filter((p) => p.id !== product.id);
        return [...filtered, { ...product, variants: [...product.variants] }];
      });
    }
  };

  const handleDone = () => {
    onAdd(selectedProducts);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden flex flex-col h-[600px]">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Select Products</DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search product"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {products.map((product, index) => (
              <div key={product.id} ref={index === products.length - 1 ? lastProductElementRef : null}>
                <div className="flex items-center gap-3 p-4 hover:bg-slate-50">
                  <Checkbox
                    checked={isProductSelected(product.id)}
                    disabled={
                      (maxSelection !== undefined && selectedProducts.length >= maxSelection && !selectedProducts.some(p => p.id === product.id)) ||
                      disabledProductIds.includes(product.id)
                    }
                    ref={(ref) => {
                        if (ref) {
                            (ref as any).indeterminate = isProductPartiallySelected(product.id);
                        }
                    }}
                    onCheckedChange={() => toggleProduct(product)}
                  />
                  {product.image?.src ? (
                    <img src={product.image.src} alt="" className="w-10 h-10 rounded border object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded border bg-slate-100 flex items-center justify-center text-xs text-slate-400">No img</div>
                  )}
                  <span className="font-medium text-sm flex-1">{product.title}</span>
                </div>
                
                <div className="pl-12">
                  {product.variants.map((variant) => (
                    <React.Fragment key={variant.id}>
                      <Separator />
                      <div className="flex items-center gap-3 p-3 hover:bg-slate-50">
                        <Checkbox
                          checked={isVariantSelected(product.id, variant.id)}
                          disabled={
                            (maxSelection !== undefined && selectedProducts.length >= maxSelection && !selectedProducts.some(p => p.id === product.id)) ||
                            disabledProductIds.includes(product.id)
                          }
                          onCheckedChange={() => toggleVariant(product, variant)}
                        />
                        <span className="text-sm flex-1">{variant.title}</span>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {variant.inventory_quantity !== undefined && (
                            <span>{variant.inventory_quantity} available</span>
                          )}
                          <span className="font-medium">${variant.price}</span>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
                <Separator />
              </div>
            ))}
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground italic">
                Loading products...
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t flex items-center justify-between sm:justify-between bg-white mt-auto">
          <div className="text-sm text-slate-600">
            {selectedProducts.reduce((acc, p) => acc + p.variants.length, 0)} variants selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleDone} className="bg-[#008060] hover:bg-[#006e52]">Add</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
