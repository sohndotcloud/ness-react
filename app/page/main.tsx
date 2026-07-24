import Sidebar from "~/components/sidebar";
import Bottombar from "~/components/bottombar";
import UploadPdf from "~/components/upload-pdf";
import PdfUpload from "~/components/pdf-upload";

export function Main() {
    return (
        <main className="relative h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
            {/* Ambient background layer — sits behind everything, doesn't affect layout */}
            <div
                className="absolute inset-0 dark:bg-[url('../assets/gradient-slate.png')] bg-cover bg-center opacity-90 pointer-events-none"
                aria-hidden="true"
            />
            {/* Subtle radial glow to echo the bottombar's cyan accent */}
            <div
                className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.06),_transparent_60%)] pointer-events-none"
                aria-hidden="true"
            />

            <Sidebar />

            <div className="relative h-screen flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto pb-[72px]">
                    <UploadPdf />
                    <PdfUpload />
                </div>
                <Bottombar />
            </div>
        </main>
    );
}