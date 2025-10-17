'use client'

interface PdfViewerProps {
  pdfUrl: string
  title: string
}

export default function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">📄 {title}</h3>
        <a
          href={pdfUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="btn-small inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </a>
      </div>
      <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=0`}
          className="w-full h-[800px]"
          title={title}
        />
      </div>
    </div>
  )
}




