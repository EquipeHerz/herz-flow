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
  description: string;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGalleryModal({ 
  images, 
  clientName, 
  description,
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
      <DialogContent aria-label={`Galeria de ${clientName}`} className="sm:max-w-[90vw] lg:max-w-5xl p-0 bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border overflow-hidden">
        <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden px-4 md:px-6 py-5 md:py-6 flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="sticky top-0 z-10 bg-popover/85 backdrop-blur-md border-b border-border px-1 md:px-0 py-4 space-y-2">
            <h3 className="text-2xl font-bold" id="gallery-title">{clientName}</h3>
            <p className="text-base leading-relaxed text-popover-foreground/90" aria-describedby="gallery-title">{description}</p>
          </div>

          <div className="relative flex-1 min-h-0">
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
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={previousImage}
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
          <div className="mt-4 h-24 w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth">
            <div className="flex gap-3 pr-2">
              {images.map((src, idx) => (
                <button
                  key={`thumb-${idx}`}
                  onClick={() => {
                    itemRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "center" });
                    setCurrentIndex(idx);
                  }}
                  className={`flex-shrink-0 w-32 h-20 rounded-md border ${idx === currentIndex ? 'border-accent' : 'border-border'} overflow-hidden`}
                  aria-label={`Ir para imagem ${idx + 1}`}
                >
                  <img
                    src={withBase(src)}
                    alt={`${clientName} miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
