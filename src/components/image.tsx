import { type ImgHTMLAttributes, useRef } from "react";
import type { StoredObject } from "ronin/types";

export interface ImageRootProps {
  alt?: ImgHTMLAttributes<HTMLImageElement>["alt"];
  quality?: number;
  src: string | StoredObject;
  size?: number;
  width?: number;
  height?: number;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
}

const Image = ({
  src: input,
  alt,
  size: defaultSize,
  width: defaultWidth,
  height: defaultHeight,
  quality,
  loading,
}: ImageRootProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const init = useRef(Date.now());

  const isMediaObject = typeof input === "object" && input !== null;
  const width = defaultSize || defaultWidth;
  const height = defaultSize || defaultHeight;

  if (!height && !width)
    throw new Error(
      "Either `width`, `height`, or `size` must be defined for `Image`.",
    );

  // Validate given `quality` property.
  if (quality && (quality < 0 || quality > 100)) {
    throw new Error(
      "The given `quality` was not in the range between 0 and 100.",
    );
  }

  const optimizationParams = new URLSearchParams({
    ...(width ? { w: width.toString() } : {}),
    ...(height ? { h: height.toString() } : {}),
    q: quality ? quality.toString() : "100",
  });

  const responsiveOptimizationParams = new URLSearchParams({
    ...(width ? { h: (width * 2).toString() } : {}),
    ...(height ? { h: (height * 2).toString() } : {}),
    q: quality ? quality.toString() : "100",
  });

  const source = isMediaObject ? `${input.src}?${optimizationParams}` : input;

  const responsiveSource = isMediaObject
    ? `${input.src}?${optimizationParams} 1x, ` +
      `${input.src}?${responsiveOptimizationParams} 2x`
    : input;

  const placeholder =
    input && typeof input !== "string" ? input.placeholder?.base64 : null;

  const onLoad = () => {
    const duration = Date.now() - init.current;
    const threshold = 150;

    // Fade in and gradually reduce blur of the real image if loading takes
    // longer than the specified threshold.
    if (duration > threshold) {
      imageRef.current?.animate(
        [
          { filter: "blur(4px)", opacity: 0 },
          { filter: "blur(0px)", opacity: 1 },
        ],
        {
          duration: 200,
        },
      );
    }
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        width: width || "100%",
        height: height || "100%",
      }}
    >
      {/* Blurred preview being displayed until the actual image is loaded. */}
      {placeholder && (
        <img
          style={{ position: "absolute", width: "100%", height: "100%" }}
          src={placeholder}
          alt={alt}
        />
      )}

      {/* The optimized image, responsive to the specified size. */}
      <img
        alt={alt}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        decoding="async"
        onLoad={onLoad}
        loading={loading}
        ref={imageRef}
        src={source}
        srcSet={responsiveSource}
      />
    </div>
  );
};

export default Image;
