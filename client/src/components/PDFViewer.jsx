import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDFViewer = ({ file, onClose }) => {
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [error, setError] = useState("");

  const handleLoadError = (err) => {
    console.error("PDF preview failed:", err);
    setError("This PDF could not be previewed in the browser. You can still download it instead.");
    setUseIframeFallback(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          maxHeight: "90vh",
          overflow: "auto",
          width: "min(90vw, 900px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
            gap: 10,
          }}
        >
          {/* <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ◀
            </button>

            <span>
              {page} / {pages || 1}
            </span>

            <button
              disabled={page === pages || pages === 0}
              onClick={() => setPage(page + 1)}
            >
              ▶
            </button>

            <button onClick={() => setScale(Math.max(0.8, scale - 0.2))}>
              -
            </button>

            <span>{Math.round(scale * 100)}%</span>

            <button onClick={() => setScale(Math.min(2.5, scale + 0.2))}>
              +
            </button>
          </div> */}

          <button onClick={onClose}>
            ✕
          </button>
        </div>

        {/* {error && (
          <div style={{ marginBottom: 12, color: "#b91c1c", fontSize: 14 }}>
            {error}
          </div>
        )} */}

        {useIframeFallback ? (
          <iframe
            src={file}
            title="PDF preview"
            style={{ width: "100%", height: "70vh", border: "none" }}
          />
        ) : (
          <Document
            file={{ url: file, withCredentials: false }}
            onLoadSuccess={({ numPages }) => {
              setPages(numPages);
              setError("");
            }}
            onLoadError={handleLoadError}
          >
            <Page pageNumber={page} scale={scale} renderTextLayer={false}
              renderAnnotationLayer={false} />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;