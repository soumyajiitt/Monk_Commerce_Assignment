import React, { useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import type { SelectedProduct, Product } from "@/types/product";
import { ProductItem } from "./ProductItem";
import { ProductPicker } from "./ProductPicker";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TriangleAlert, CircleHelp } from "lucide-react";

export const ProductList: React.FC = () => {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([
    { id: Date.now(), title: "", variants: [], showVariants: false } as any
  ]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<number | null>(null);
  const [applyDiscountOnCompare, setApplyDiscountOnCompare] = useState(false);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSelectedProducts((items: SelectedProduct[]) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveDragId(null);
  };

  const handleRemoveProduct = (id: number) => {
    if (selectedProducts.length > 1) {
      setSelectedProducts(selectedProducts.filter((p: SelectedProduct) => p.id !== id));
    } else {
        setSelectedProducts([{ id: Date.now(), title: "", variants: [], showVariants: false } as any]);
    }
  };

  const handleUpdateProduct = (id: number, updates: Partial<SelectedProduct>) => {
    setSelectedProducts(selectedProducts.map((p: SelectedProduct) => p.id === id ? { ...p, ...updates } : p));
  };

  const handleAddEmptyProduct = () => {
    if (selectedProducts.length >= 4) return;
    setSelectedProducts([...selectedProducts, { 
      id: Date.now(), 
      title: "", 
      variants: [], 
      showVariants: false,
      product_type: "",
      vendor: "",
      body_html: "",
      handle: "",
      status: "active",
      published_scope: "web",
      tags: "",
      admin_graphql_api_id: "",
      options: [],
      images: [],
      image: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      template_suffix: null
    }]);
  };

  const handleOpenPicker = (id: number) => {
    setActiveEditingId(id);
    setPickerOpen(true);
  };

  const handleAddProductsFromPicker = (products: Product[]) => {
    const newSelected: SelectedProduct[] = products.map(p => ({
      ...p,
      showVariants: false,
      variants: p.variants.map(v => ({ ...v }))
    }));

    if (activeEditingId) {
      const editIndex = selectedProducts.findIndex(p => p.id === activeEditingId);
      if (editIndex !== -1) {
        const newList = [...selectedProducts];
        newList.splice(editIndex, 1, ...newSelected);
        setSelectedProducts(newList);
      }
    } else {
      const filteredNew = newSelected.filter(np => !selectedProducts.some(p => p.id === np.id));
      setSelectedProducts([...selectedProducts, ...filteredNew]);
    }
    setActiveEditingId(null);
  };

  const handleVariantReorder = (productId: number, activeId: number, overId: number) => {
    setSelectedProducts((prev: SelectedProduct[]) => prev.map((p: SelectedProduct) => {
      if (p.id === productId) {
        const oldIndex = p.variants.findIndex((v) => v.id === activeId);
        const newIndex = p.variants.findIndex((v) => v.id === overId);
        return { ...p, variants: arrayMove(p.variants, oldIndex, newIndex) };
      }
      return p;
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-xl font-bold mb-8">Add Bundle Product (Max. 4 Products)</h1>
      <div className="flex items-center gap-2 mb-4">
        <TriangleAlert className="text-yellow-500 w-5 h-5"/>
        <p className="text-sm text-gray-500">Offer Bundle will be shown to the customer whenever any of the bundle products are added to the cart. </p>
      </div>

      <div className="space-y-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveDragId(event.active.id as number)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={selectedProducts.map((p: SelectedProduct) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {selectedProducts.map((product: SelectedProduct, index: number) => (
              <ProductItem 
                key={product.id}
                product={product}
                index={index}
                onRemove={handleRemoveProduct}
                onUpdate={handleUpdateProduct}
                onOpenPicker={handleOpenPicker}
                showRemove={selectedProducts.length > 1}
                onVariantReorder={handleVariantReorder}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeDragId ? (
               <div className="opacity-80">
                 <ProductItem 
                    product={selectedProducts.find(p => p.id === activeDragId)!}
                    index={selectedProducts.findIndex(p => p.id === activeDragId)}
                    onRemove={() => {}}
                    onUpdate={() => {}}
                    onOpenPicker={() => {}}
                    showRemove={false}
                    onVariantReorder={() => {}}
                    isOverlay
                 />
               </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="mt-6 flex justify-end">
        <Button 
          variant="outline" 
          size="lg" 
          className="border-2 border-[#008060] text-[#008060] hover:bg-[#008060] hover:text-white px-10 font-bold"
          onClick={handleAddEmptyProduct}
          disabled={selectedProducts.length >= 4}
        >
          Add Product
        </Button>
      </div>

      <div className="mt-8">
        <div className="flex items-center space-x-2 mb-2">
          <Checkbox 
            id="compare-price" 
            checked={applyDiscountOnCompare}
            onCheckedChange={(checked) => setApplyDiscountOnCompare(checked as boolean)}
          />
          <div className="flex items-center gap-1">
             <label 
              htmlFor="compare-price" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Apply discount on compare price
            </label>
            <CircleHelp className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        <p className="text-xs text-gray-500 max-w-xl">
          Discount will be applied on compare price of the product. Discount set inside the upsell offer should be more than or equal to the discount set on a product in your store.
        </p>
      </div>

      <ProductPicker 
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={handleAddProductsFromPicker}
        initialSelection={activeEditingId ? selectedProducts.filter((p: SelectedProduct) => p.id === activeEditingId && p.title !== "") : []}
        maxSelection={4 - (selectedProducts.length - (activeEditingId ? 1 : 0))}
        disabledProductIds={selectedProducts
          .map((p) => p.id)
          .filter((id) => id !== activeEditingId)
        }
      />
    </div>
  );
};
