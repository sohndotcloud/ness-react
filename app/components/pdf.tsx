import React, {useEffect, useRef, useState} from "react";
import {usePdf} from "~/context/pdf-context";
import {useUserWeather} from "~/util/useUserWeather";


export default function Pdf() {
    const { pdfUrl, setPdfUrl } = usePdf();
    const [fileName, setFileName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // required, or drop won't fire
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        setFileName(file.name);
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        const url = URL.createObjectURL(file);
        setPdfUrl(url);
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file ? file.name : '');
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        const url = URL.createObjectURL(file);
        setPdfUrl(url);
    };

    return (
            <div className="flex-1 flex items-center justify-center">
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                />
                { !pdfUrl && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors ${
                            isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-700'
                        }`}
                    >
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Upload PDF
                            </button>

                            <span className="block truncate max-w-xs text-gray-500">
                  {fileName || 'No file selected'}
                </span>
                        </div>
                    </div>
                )}

                {pdfUrl && (
                    <iframe
                        src={pdfUrl}
                        title="PDF Viewer"
                        style={{ width: '75vw', height: '75vh' }}
                    />
                )}
            </div>
    )
}