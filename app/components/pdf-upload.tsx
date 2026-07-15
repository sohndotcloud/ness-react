import { useEffect, useState } from 'react';
import { usePdf } from "~/context/pdf-context";
import { PDFViewer } from '@embedpdf/react-pdf-viewer';

interface PdfEntry {
    id: number;
    name: string;
    link: string;
    author: string;
    thumbnail: string;
}

async function generateThumbnailFromUrl(url: string): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).toString();

    const pdf = await pdfjsLib.getDocument(url).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d')!;

    await page.render({
        canvasContext: context,
        canvas: canvas,
        viewport,
    }).promise;

    return canvas.toDataURL('image/png');
}

export default function PdfUpload() {
    const { pdfUrl, pdfTitle, pdfName, pdfAuthor } = usePdf();
    const [data, setData] = useState<PdfEntry[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Opened-book view state. openId is the item being viewed;
    // isAnimating drives the flip transition in on mount and out before close.
    const [openId, setOpenId] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const openBook = (id: number) => {
        setIsAnimating(false);
        setShowViewer(false);
        setOpenId(id);
    };

    const closeBook = () => {
        const wasViewingPdf = showViewer;
        setIsAnimating(false);
        setShowViewer(false);

        if (wasViewingPdf) {
            // The book cover wasn't mounted while the PDF viewer was open, so
            // there's no flip animation to wait for — unmount immediately to
            // avoid a dead pause + abrupt layout jump before the carousel returns.
            setOpenId(null);
        } else {
            window.setTimeout(() => setOpenId(null), 700);
        }
    };

    // Once the opened-book view has mounted (openId set), flip isAnimating
    // on the next frame so the flip transition actually runs instead of
    // snapping straight to its end state.
    useEffect(() => {
        if (openId === null) return;
        const frame = requestAnimationFrame(() => setIsAnimating(true));
        return () => cancelAnimationFrame(frame);
    }, [openId]);

    useEffect(() => {
        if (pdfUrl === "") return;

        const name = pdfName !== "" ? pdfName : pdfTitle;

        (async () => {
            let thumbnail = "";
            try {
                thumbnail = await generateThumbnailFromUrl(pdfUrl);
            } catch (err) {
                console.error("Failed to generate thumbnail:", err);
            }

            setData(prev => prev.concat({
                id: prev.length ? Math.max(...prev.map(d => d.id)) + 1 : 1,
                name,
                link: pdfUrl,
                author: pdfAuthor,
                thumbnail,
            }));
        })();
    }, [pdfUrl]);

    // keep activeIndex in range as data changes
    useEffect(() => {
        if (activeIndex > data.length - 1) {
            setActiveIndex(Math.max(0, data.length - 1));
        }
    }, [data, activeIndex]);

    const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
    const goNext = () => setActiveIndex((i) => Math.min(data.length - 1, i + 1));

    const openItem = data.find((d) => d.id === openId) ?? null;

    return (
        <div className="px-[200px] py-10 flex-1 min-h-0 overflow-y-auto">
            {openItem ? (
                /* ---------- Opened book view: replaces the carousel entirely ---------- */
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={closeBook}
                        className="self-start flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        ← Back
                    </button>

                    {!showViewer && (
                        <div className="w-full max-w-md">
                            <div
                                className="relative"
                                style={{ perspective: '1500px', aspectRatio: '3 / 4' }}
                            >
                                {/* Back page: revealed once the cover rotates open */}
                                <div className="absolute inset-0 rounded-t-lg bg-slate-50 border border-slate-200 flex flex-col p-6">
                                    <p className="text-base font-semibold text-slate-900">{openItem.name}</p>
                                    <p className="text-sm text-slate-500 mt-1">{openItem.author || 'Unknown author'}</p>
                                    <div className="mt-auto flex items-center gap-4">
                                        <a
                                            href={openItem.link}
                                            className="text-sm font-medium text-blue-600 hover:underline"
                                        >
                                            Open PDF ↗
                                        </a>
                                        <button
                                            onClick={() => setShowViewer(true)}
                                            className="text-sm font-medium text-blue-600 hover:underline"
                                        >
                                            View book
                                        </button>
                                    </div>
                                </div>

                                {/* Cover: rotates open like a book */}
                                <div
                                    className="absolute inset-0 rounded-t-lg bg-slate-800 flex items-center justify-center overflow-hidden"
                                    style={{
                                        transformOrigin: 'left center',
                                        backfaceVisibility: 'hidden',
                                        transform: isAnimating ? 'rotateY(-160deg)' : 'rotateY(0deg)',
                                        transition: 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isAnimating ? '2px 0 8px rgba(0,0,0,0.25)' : 'none',
                                    }}
                                >
                                    {openItem.thumbnail ? (
                                        <img
                                            src={openItem.thumbnail}
                                            alt={openItem.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-slate-400 text-xs">No preview</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {showViewer && (
                        <div
                            className="w-full rounded-lg border border-slate-200"
                            style={{ maxWidth: '48rem', height: '70vh', overflow: 'hidden', position: 'relative' }}
                        >
                            <PDFViewer
                                config={{ src: openItem.link }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    )}
                </div>
            ) : data.length === 0 ? (
                <p className="text-center text-slate-400 text-sm">No PDFs uploaded yet</p>
            ) : (
                /* ---------- Carousel view ---------- */
                <>
                    <div className="relative flex items-center justify-center">
                        {/* Prev button */}
                        <button
                            onClick={goPrev}
                            disabled={activeIndex === 0}
                            className="absolute left-0 z-10 p-2 rounded-full bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
                        >
                            ‹
                        </button>

                        {/* Carousel track */}
                        <div className="w-full max-w-md overflow-hidden">
                            <div
                                className="flex transition-transform duration-300 ease-in-out"
                                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                            >
                                {data.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="w-full flex-shrink-0 px-2"
                                        >
                                            <div
                                                className={`relative flex flex-col rounded-lg border-2 overflow-hidden transition-colors ${
                                                    isSelected
                                                        ? 'border-blue-500 bg-slate-100'
                                                        : 'border-slate-200 bg-white hover:border-slate-400'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(item.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="absolute top-2 left-2 z-10"
                                                />
                                                <div
                                                    onClick={() => openBook(item.id)}
                                                    className="flex items-center justify-center bg-slate-800 aspect-[3/4] overflow-hidden cursor-pointer"
                                                >
                                                    {item.thumbnail ? (
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-slate-400 text-xs">No preview</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Next button */}
                        <button
                            onClick={goNext}
                            disabled={activeIndex === data.length - 1}
                            className="absolute right-0 z-10 p-2 rounded-full bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700"
                        >
                            ›
                        </button>
                    </div>

                    {/* Dots indicator */}
                    {data.length > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {data.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-colors ${
                                        i === activeIndex ? 'bg-slate-800' : 'bg-slate-300'
                                    }`}
                                />
                            ))}
                        </div>
                    )}

                    {selectedIds.length > 0 && (
                        <p className="mt-3 text-sm text-center">
                            {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
                        </p>
                    )}
                </>
            )}
        </div>
    );
}