import { useRef } from "react";
import type { StoredObject } from "ronin/types";

export interface ImageProps {
  /**
   * Defines text that can replace the image in the page.
   */
  alt?: string;
  /**
   * The quality level at which the image should be displayed. A lower quality
   * ensures a faster loading speed, but might also effect the visual
   * appearance, so it is essential to choose carefully.
   *
   * Must be an integer between 0 and 100.
   */
  quality?: number;
  /**
   * The value of a RONIN Blob field.
   */
  src: string | StoredObject;
  /**
   * The intrinsic size of the image in pixels, if its width and height are the
   * same. Must be an integer without a unit.
   */
  size?: number;
  /**
   * The intrinsic width of the image in pixels. Must be an integer without a
   * unit.
   */
  width?: number;
  /**
   * The intrinsic height of the image, in pixels. Must be an integer without
   * a unit.
   */
  height?: number;
  /**
   * Indicates how the browser should load the image.
   *
   * Providing the value "lazy" defers loading the image until it reaches a
   * calculated distance from the viewport, as defined by the browser. The
   * intent is to avoid the network and storage bandwidth needed to handle the
   * image until it's reasonably certain that it will be needed. This generally
   * improves the performance of the content in most typical use cases.
   */
  loading?: "lazy";
}

const Image = ({
  src: input,
  alt,
  size: defaultSize,
  width: defaultWidth,
  height: defaultHeight,
  quality,
  loading,
}: ImageProps) => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const renderTime = useRef<number>(Date.now());

  const isMediaObject = typeof input === "object" && input !== null;
  const width = defaultSize || defaultWidth;
  const height = defaultSize || defaultHeight;

  if (!height && !width)
    throw new Error(
      "Either `width`, `height`, or `size` must be defined for `Image`.",
    );

  // Validate given `quality` property.
  if (quality && (quality < 0 || quality > 100))
    throw new Error(
      "The given `quality` was not in the range between 0 and 100.",
    );

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
    const duration = Date.now() - renderTime.current;
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
