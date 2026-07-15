import React from 'react';
import Sidebar from "~/components/sidebar";
import Bottombar from "~/components/bottombar";
import UploadPdf from "~/components/upload-pdf";
import PdfUpload from "~/components/pdf-upload";
export function Main() {
    return (
        <main
            className="relative h-screen dark:bg-[url('../assets/gradient-slate.png')] "
        >
            <Sidebar />
            <div className="flex flex-col h-screen min-h-0">
                <UploadPdf />
                <PdfUpload />
                <Bottombar />
            </div>
        </main>
    );
}