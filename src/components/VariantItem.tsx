import React, { useState } from "react";
import type { Variant, Discount } from "@/types/product";
import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface VariantItemProps {
  variant: Variant & { discount?: Discount };
  productId: number;
  onUpdate: (variantId: number, updates: Partial<Variant & { discount?: Discount }>) => void;
  onRemove: (variantId: number) => void;
}

export const VariantItem: React.FC<VariantItemProps> = ({
  variant,
  onUpdate,
  onRemove,
}) => {
  const [showDiscount, setShowDiscount] = useState(!!variant.discount);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: variant.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDiscountChange = (value: string) => {
    const val = parseFloat(value) || 0;
    onUpdate(variant.id, { 
      discount: { ... (variant.discount || { type: 'percentage', value: 0 }), value: val } 
    });
  };

  const handleDiscountTypeChange = (type: 'flat' | 'percentage') => {
    onUpdate(variant.id, { 
      discount: { ... (variant.discount || { type: 'percentage', value: 0 }), type } 
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 group transition-all duration-200">
       <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors">
          <GripVertical size={20} />
      </div>
      
      <div className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
        {variant.title}
      </div>

      {!showDiscount ? (
          <Button 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium"
            onClick={() => setShowDiscount(true)}
          >
            Add Discount
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              className="w-20 rounded-full" 
              value={variant.discount?.value || ""}
              onChange={(e) => handleDiscountChange(e.target.value)}
            />
            <Select 
              value={variant.discount?.type || "percentage"}
              onValueChange={(val: 'flat' | 'percentage') => handleDiscountTypeChange(val)}
            >
              <SelectTrigger className="w-32 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">% Off</SelectItem>
                <SelectItem value="flat">Flat Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-500"
          onClick={() => onRemove(variant.id)}
        >
          <X size={20} />
        </Button>
    </div>
  );
};
