import {
  forwardRef,
  ImgHTMLAttributes,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE_URL =
  "https://via.placeholder.com/800x600?text=Image+Not+Found";

export interface ImageProps
  extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  aspectRatio?: number; // optional aspect ratio (e.g. 16/9)
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      className,
      wrapperClassName,
      aspectRatio,
      onError,
      ...props
    },
    ref
  ) => {
    const [imgSrc, setImgSrc] = useState(src);

    if (!src) {
      return null;
    }

    const handleError = (
      e: React.SyntheticEvent<HTMLImageElement, Event>
    ) => {
      setImgSrc(FALLBACK_IMAGE_URL);
      onError?.(e);
    };

    const imageElement = (
      <img
        ref={ref}
        src={imgSrc}
        alt={alt || ""}
        className={cn("w-full h-full object-cover", className)}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    );

    // Optional aspect ratio wrapper
    if (aspectRatio) {
      return (
        <div
          className={cn("relative w-full overflow-hidden", wrapperClassName)}
          style={{ aspectRatio: `${aspectRatio}` }}
        >
          {imageElement}
        </div>
      );
    }

    return imageElement;
  }
);

Image.displayName = "Image";
