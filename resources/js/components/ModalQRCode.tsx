import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface ModalQRCodeProps {
    isOpen: boolean;
    onClose: () => void;
    value: string;
}

export default function ModalQRCode({ isOpen, onClose, value }: ModalQRCodeProps) {
    const qrRef = useRef<HTMLCanvasElement | null>(null);

    if (!isOpen) return null;

    const handleDownload = () => {
        if (!qrRef.current) return;
        const canvas = qrRef.current;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = "qrcode.png";
        link.click();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-xl shadow-lg w-[360px] p-6 text-center">
                <h2 className="text-lg font-semibold mb-4">Generate QRCode</h2>
                <div className="flex justify-center mb-4">
                    <QRCodeCanvas ref={qrRef} value={value || "No Data"} size={200} />
                </div>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={handleDownload}
                        className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                        Download
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
