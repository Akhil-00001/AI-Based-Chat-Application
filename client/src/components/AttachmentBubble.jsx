import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import PDFViewer from "./PDFViewer";
import AudioPlayer from "./AudioPlayer";
import downloadIcon from "../assets/download.png"
import previewIcon from "../assets/eye.png"
const AttachmentBubble = ({ attachment, image, onImageClick }) => {
    const { theme } = useTheme();
    const getFileIcon = (name = "") => {
        const ext = name.split(".").pop()?.toLowerCase();

        switch (ext) {
            case "pdf":
                return "📕";

            case "doc":
            case "docx":
                return "📘";

            case "ppt":
            case "pptx":
                return "📙";

            case "xls":
            case "xlsx":
                return "📗";

            case "zip":
            case "rar":
                return "🗜️";

            case "txt":
                return "📄";

            default:
                return "📁";
        }
    };
    const [showPDF, setShowPDF] = useState(false);
    const formatFileSize = (bytes = 0) => {
        if (bytes < 1024) return `${bytes} B`;

        if (bytes < 1024 * 1024)
            return `${(bytes / 1024).toFixed(1)} KB`;

        if (bytes < 1024 * 1024 * 1024)
            return `${(bytes / 1024 / 1024).toFixed(1)} MB`;

        return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
    };

    // Backward compatibility
    if (!attachment?.url && !image) return null;

    const type = attachment?.type || "image";
    const url = attachment?.url || image;

    if (type === "image") {
        return (
            <img
                src={url}
                alt="attachment"
                onClick={() => onImageClick(url)}
                style={{
                    width: "100%",
                    maxWidth: "300px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    marginBottom: "8px",
                }}
            />
        );
    }

    if (type === "video") {
        return (
            <video
                controls
                style={{
                    width: "100%",
                    maxWidth: "320px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                }}
            >
                <source src={url} type={attachment.mimeType} />
            </video>
        );
    }

    if (type === "document") {
        const extension =
            attachment.name.split(".").pop()?.toUpperCase() || "FILE";

        const isPDF =
            attachment.mimeType?.includes("pdf") ||
            attachment.name?.toLowerCase().endsWith(".pdf") ||
            false;
        const downloadFileName = attachment.name || "downloaded-file";
        const downloadUrl = `${attachment.url}${attachment.url.includes("?") ? "&" : "?"}fl_attachment=1`;

        return (
            <>
            <div
                style={{
                    marginBottom: "8px",
                    padding: "12px",
                    borderRadius: "14px",
                    border: `1px solid ${theme.border}`,
                    background: theme.inputBg,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: "34px",
                        }}
                    >
                        {getFileIcon(attachment.name)}
                    </div>

                    <div
                        style={{
                            flex: 1,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                color:theme.textPrimary,
                            }}
                        >
                            {attachment.name}
                        </div>

                        <div
                            style={{
                                fontSize: "12px",
                                opacity: .7,
                                marginTop: "4px",
                                color:theme.textSecondary,
                            }}
                        >
                            {extension} • {formatFileSize(attachment.size)}
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    {isPDF && (
                        <button
                            onClick={() => setShowPDF(true)}
                            style={{
                                flex: 1,
                                padding: "8px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                border: "none",
                            }}
                        >
                            <img src={previewIcon} style={{width:"20px"}} alt="" />
                        </button>
                    )}

                    <a
                        href={downloadUrl}
                        download={downloadFileName}
                        style={{
                            flex: 1,
                            textDecoration: "none",
                        }}
                    >
                        <button
                            style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                border: "none",
                            }}
                        >
                            <img src={downloadIcon} style={{width:"20px"}} alt="" />
                        </button>
                    </a>
                </div>
            </div>
            {showPDF && (
            <PDFViewer
                file={attachment.url}
                onClose={() => setShowPDF(false)}
            />
        )}
        </>
        );
    }

    if (type === "audio") {
        return (
            <AudioPlayer src={attachment.url} />
        );
    }
    

    return null;
};

export default AttachmentBubble;