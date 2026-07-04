import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";


const ImageViewer = ({ image, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape")
        onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);

  }, [onClose]);
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [image]);
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          onMouseMove={(e) => {
            if (!isDragging) return;

            setPosition({
              x: e.clientX - startPoint.x,
              y: e.clientY - startPoint.y,
            });
          }}
          onWheel={(e) => {
            // e.preventDefault();

            if (e.deltaY < 0)
              setZoom((z) => Math.min(z + 0.05, 3));
            else
              setZoom((z) => Math.max(z - 0.05, 1));
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              fontSize: "32px",
              background: "transparent",
              color: "white",
              border: "none",
              cursor: zoom > 1
                ? (isDragging ? "grabbing" : "grab")
                : "default",
            }}
          >
            ✕
          </button>
          <motion.img
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            src={image}
            onMouseDown={(e) => {
              if (zoom <= 1) return;

              setIsDragging(true);

              setStartPoint({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
              });
            }}
            onClick={(e) => e.stopPropagation()}
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              scale: zoom,
              x: position.x,
              y: position.y,
            }}
            exit={{
              scale: 0.7,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px",
              // transform: `scale(${zoom})`,
              transition: "transform 0.15s ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 30,
              display: "flex",
              gap: 15,
              background: "rgba(0,0,0,0.45)",
              padding: "10px 16px",
              borderRadius: 30,
              backdropFilter: "blur(10px)",
            }}
          >

            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.min(z + 0.2, 4));
              }}
            >
              +
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.max(z - 0.2, 1));
              }}
            >
              -
            </button>

          </div>
        </motion.div>

      )}
    </AnimatePresence>
  );
};

export default ImageViewer;