import { useEffect, useRef, useState, type WheelEvent as ReactWheelEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageGalleryModalProps {
  images: string[];
  clientName: string;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGalleryModal({ 
  images, 
  clientName, 
  initialIndex = 0,
  isOpen,
  onClose 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const withBase = (p: string) => `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}${p.startsWith('/') ? p : `/${p}`}`;

  useEffect(() => {
    setCurrentIndex(initialIndex);
    const el = itemRefs.current[initialIndex];
    el?.scrollIntoView({ behavior: "auto", inline: "center" });
  }, [initialIndex, isOpen]);

  const onWheelHorizontal = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    e.preventDefault();
    trackRef.current.scrollLeft += e.deltaY;
  };

  const updateIndexOnScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== currentIndex) setCurrentIndex(Math.min(Math.max(idx, 0), images.length - 1));
  };

  const nextImage = () => {
    const next = Math.min(currentIndex + 1, images.length - 1);
    itemRefs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "center" });
    setCurrentIndex(next);
  };

  const previousImage = () => {
    const prev = Math.max(currentIndex - 1, 0);
    itemRefs.current[prev]?.scrollIntoView({ behavior: "smooth", inline: "center" });
    setCurrentIndex(prev);
  };

  const handleImageError = (_img: HTMLImageElement) => {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-5xl p-0 bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden px-4 md:px-6 py-5 md:py-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          <div
            ref={trackRef}
            className="flex w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth overscroll-x-contain touch-pan-x"
            onWheel={onWheelHorizontal}
            onScroll={updateIndexOnScroll}
          >
            {images.map((src, idx) => (
              <div
                key={idx}
                ref={(el) => { if (el) itemRefs.current[idx] = el; }}
                className="flex-shrink-0 w-full h-full snap-start flex items-center justify-center"
              >
                <img
                  src={withBase(src)}
                  alt={`${clientName} ${idx + 1}`}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => handleImageError(e.currentTarget)}
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={previousImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
