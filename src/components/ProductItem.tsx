import React, { useState } from "react";
import type { SelectedProduct, Variant } from "@/types/product";
import { 
  GripVertical, 
  Pencil, 
  X, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { DragOverlay } from "@dnd-kit/core";
import { VariantItem } from "./VariantItem";

interface ProductItemProps {
  product: SelectedProduct;
  index: number;
  onRemove: (id: number) => void;
  onUpdate: (id: number, updates: Partial<SelectedProduct>) => void;
  onOpenPicker: (id: number) => void;
  showRemove: boolean;
  onVariantReorder?: (productId: number, activeId: number, overId: number) => void;
  isOverlay?: boolean;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  index,
  onRemove,
  onUpdate,
  onOpenPicker,
  showRemove,
  onVariantReorder,
  isOverlay,
}) => {
  const [activeVariantDragId, setActiveVariantDragId] = useState<number | null>(null);
  const [showDiscount, setShowDiscount] = useState(!!product.discount);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDiscountChange = (value: string) => {
    const val = parseFloat(value) || 0;
    onUpdate(product.id, { 
      discount: { ... (product.discount || { type: 'percentage', value: 0 }), value: val } 
    });
  };

  const handleDiscountTypeChange = (type: 'flat' | 'percentage') => {
    onUpdate(product.id, { 
      discount: { ... (product.discount || { type: 'percentage', value: 0 }), type } 
    });
  };

  const toggleVariants = () => {
    onUpdate(product.id, { showVariants: !product.showVariants });
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`mb-4 ${isOverlay ? "opacity-100 bg-white shadow-xl rounded-lg border-2 border-blue-500 z-50 pointer-events-none p-2" : ""}`}
    >
      <div className="flex items-center gap-4 group">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors">
          <GripVertical size={20} />
        </div>
        <span className="text-slate-500 w-4 font-medium">{index + 1}.</span>
        
        <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-md p-1 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 truncate">
            {product.title || "Select Product"}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-slate-600 h-8 w-8"
            onClick={() => onOpenPicker(product.id)}
          >
            <Pencil size={14} />
          </Button>
        </div>

        {!showDiscount ? (
          <Button 
            variant="default" 
            className="bg-[#008060] hover:bg-[#006e52] text-white px-6"
            onClick={() => setShowDiscount(true)}
          >
            Add Discount
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              className="w-20" 
              value={product.discount?.value || ""}
              onChange={(e) => handleDiscountChange(e.target.value)}
            />
            <Select 
              value={product.discount?.type || "percentage"}
              onValueChange={(val: 'flat' | 'percentage') => handleDiscountTypeChange(val)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">% Off</SelectItem>
                <SelectItem value="flat">Flat Off</SelectItem>
              </SelectContent>
            </Select>
            <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-slate-600 h-8 w-8"
                onClick={() => {
                    setShowDiscount(false);
                    onUpdate(product.id, { discount: undefined });
                }}
            >
                <X size={14} />
            </Button>
          </div>
        )}

        {showRemove && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-red-500"
            onClick={() => onRemove(product.id)}
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {product.variants.length > 1 && (
        <div className="ml-12 mt-2">
          <button 
            onClick={toggleVariants}
            className="text-xs font-medium text-blue-600 flex items-center gap-1 hover:underline ml-auto"
          >
            {product.showVariants ? (
              <>Hide variants <ChevronUp size={14} /></>
            ) : (
              <>Show variants <ChevronDown size={14} /></>
            )}
          </button>
        </div>
      )}

      <AnimatePresence>
        {product.showVariants && product.variants.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-16 mt-4 flex flex-col gap-3 overflow-hidden"
          >
              <DndContext 
                  onDragStart={(event) => setActiveVariantDragId(event.active.id as number)}
                  onDragEnd={(event: DragEndEvent) => {
                      const { active, over } = event;
                      if (over && active.id !== over.id && onVariantReorder) {
                          onVariantReorder(product.id, active.id as number, over.id as number);
                      }
                      setActiveVariantDragId(null);
                  }}
              >
                  <SortableContext 
                      items={product.variants.map(v => v.id)}
                      strategy={verticalListSortingStrategy}
                  >
                      {product.variants.map((variant: Variant) => (
                          <VariantItem 
                          key={variant.id}
                          variant={variant}
                          productId={product.id}
                          onUpdate={(vId: number, updates: any) => {
                              const newVariants = product.variants.map(v => v.id === vId ? { ...v, ...updates } : v);
                              onUpdate(product.id, { variants: newVariants });
                          }}
                          onRemove={(vId: number) => {
                              const newVariants = product.variants.filter(v => v.id !== vId);
                              if (newVariants.length === 0) {
                              onRemove(product.id);
                              } else {
                              onUpdate(product.id, { variants: newVariants });
                              }
                          }}
                          />
                      ))}
                  </SortableContext>
                  <DragOverlay>
                    {activeVariantDragId ? (
                        <VariantItem
                            variant={product.variants.find(v => v.id === activeVariantDragId)!}
                            productId={product.id}
                            onUpdate={() => {}}
                            onRemove={() => {}}
                        />
                    ) : null}
                  </DragOverlay>
              </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
