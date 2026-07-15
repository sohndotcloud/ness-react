import React, {useRef, useState} from "react";
import {usePdf} from "~/context/pdf-context";
import {PDFDocument} from "pdf-lib";


export default function UploadPdf() {
    const { setPdfUrl, setPdfName, setPdfTitle, setPdfAuthor } = usePdf();
    const [fileName, setFileName] = useState('');
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

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        setFileName(file.name);
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        const bytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);

        setPdfTitle(file.name)
        setPdfAuthor(pdfDoc.getAuthor() ?? '');
        setPdfName(pdfDoc.getTitle() ?? '');
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
    };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file ? file.name : '');
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file');
            return;
        }

        const bytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);

        const url = URL.createObjectURL(file);
        setPdfUrl(url);
    };

    return (
        <div className="ml-auto mt-4 mr-4 flex justify-end">
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
            />
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg px-6 py-3 transition-colors ${
                    isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-700'
                }`}
            >
                <div className="flex flex-col items-center gap-1">
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded"
                    >
                        Upload PDF
                    </button>
                </div>
            </div>
        </div>
    )
}