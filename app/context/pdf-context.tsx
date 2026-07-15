import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";

interface PdfContextType {
    pdfUrl: string;
    pdfTitle: string;
    pdfName: string;
    pdfAuthor: string;
    setPdfUrl: Dispatch<SetStateAction<string>>;
    setPdfTitle: Dispatch<SetStateAction<string>>
    setPdfName: Dispatch<SetStateAction<string>>;
    setPdfAuthor: Dispatch<SetStateAction<string>>;
}

const PdfContext = createContext<PdfContextType | null>(null);

export function PdfProvider({ children }: { children: ReactNode }) {
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [pdfName, setPdfName] = useState<string>("");
    const [pdfAuthor, setPdfAuthor] = useState<string>("");
    const [pdfTitle, setPdfTitle] = useState<string>("");

    return (
        <PdfContext.Provider value={{ pdfUrl, pdfTitle, pdfName, pdfAuthor, setPdfUrl, setPdfTitle, setPdfName, setPdfAuthor }}>
            {children}
        </PdfContext.Provider>
    );
}

export function usePdf() {
    const ctx = useContext(PdfContext);
    if (!ctx) throw new Error('usePdf must be used within a PdfProvider');
    return ctx;
}