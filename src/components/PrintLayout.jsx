import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

const PrintPage = ({ children, className = "" }) => (
    <div className={`w-[210mm] min-h-[297mm] h-auto bg-white shadow-lg mx-auto mb-8 overflow-visible print:w-full print:h-auto print:shadow-none print:mb-0 print:break-after-page ${className}`}>
        <div className="w-full h-full p-12 flex flex-col gap-8">
            {children}
        </div>
    </div>
);

const ContentBlock = ({ data, alt, isAnswerSheet = false }) => {
    const imageUrl = useMemo(() => {
        if (data?.type === 'image' && data.content) {
            if (typeof data.content === 'string') return data.content;
            return URL.createObjectURL(data.content);
        }
        return null;
    }, [data]);

    if (!data) return null;

    if (data.type === 'text') {
        // Answer Sheet specific styling
        const proseClass = isAnswerSheet
            ? `prose prose-xl max-w-none leading-[3rem] tracking-wide font-serif 
         print:prose-p:my-4 prose-p:my-4 
         
         /* Table Styling */
         prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:table-fixed
         prose-td:border prose-td:border-gray-800 prose-td:p-4 prose-td:align-top relative
         prose-td:min-h-[6rem] prose-td:h-auto
         /* Use :has selector or JS if possible, but CSS can't easily target specific rows. 
            We'll rely on global td height being reasonable. */
         
         /* Hide Header completely for "Simple" look */
         prose-thead:hidden [&_thead]:hidden
         
         /* Hide code block styling for cleaner text */
         prose-pre:bg-transparent prose-pre:text-gray-900 prose-pre:p-0 prose-pre:m-0 prose-pre:font-serif
         prose-code:bg-transparent prose-code:text-gray-900 prose-code:font-serif prose-code:font-normal`
            : "prose prose-sm max-w-none print:prose-p:my-2 print:prose-headings:my-4 prose-p:my-2 prose-headings:my-4";

        // Smart Layout Engine: Clean and format content
        let content = data.content;

        if (isAnswerSheet && typeof content === 'string') {
            const lines = content.split('\n');
            const processedLines = [];
            let tableBuffer = [];

            const flushTableBuffer = () => {
                if (tableBuffer.length === 0) return;

                // Normalize Table
                // 1. Analyze Columns
                let maxCols = 0;
                const rows = tableBuffer.map(line => line.split('|'));
                rows.forEach(r => maxCols = Math.max(maxCols, r.length));

                // 2. Pad Rows
                const normalizedRows = rows.map(r => {
                    while (r.length < maxCols) {
                        r.push('');
                    }
                    return r.join('|');
                });

                // 3. Inject Empty Header to validify GFM table but effectively hide it
                // We know we are hiding thead in CSS.
                // We just need ANY header to make GFM happy.

                // Check if we already have a separator at index 1
                let hasSeparator = false;
                if (normalizedRows.length > 1) {
                    const secondLine = normalizedRows[1];
                    if (/^[\|\-\:\s]+$/.test(secondLine) && secondLine.includes('-')) {
                        hasSeparator = true;
                    }
                }

                if (!hasSeparator) {
                    // Inject Empty Header + Separator
                    // numContentCols roughly maxCols - 2
                    const numContentCols = Math.max(1, maxCols - 2);

                    // Empty Header: | | |
                    const headerRow = '|' + Array(numContentCols).fill(' ').join('|') + '|';
                    // Separator: | --- | --- |
                    const separatorRow = '|' + Array(numContentCols).fill(' --- ').join('|') + '|';

                    normalizedRows.splice(0, 0, headerRow, separatorRow);
                }

                processedLines.push(...normalizedRows);
                processedLines.push(''); // Add spacing after table
                tableBuffer = [];
            };

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];

                // 1. Filter artifacts
                if (/^[\s\$]+$/.test(line)) continue;

                // 2. Pre-process: Group consecutive question lines
                // "Answer column follows problem number ONLY" -> We keep the auto-box logic
                // because that CREATES the table structure of "| Number | Space |".
                const isTableLine = line.trim().startsWith('|') || line.trim().endsWith('|');
                if (!isTableLine && line.trim().length > 0) {
                    const questionPattern = /^[\(\[]?\d+[\)\]\.]?/;
                    const textPattern = /^\(.*\)$/;

                    if (questionPattern.test(line.trim()) || textPattern.test(line.trim())) {
                        line = `| ${line.trim()} | |`;
                    }
                }

                // 3. Process Table Lines
                if (line.trim().startsWith('|') || line.trim().endsWith('|')) {
                    tableBuffer.push(line);
                } else {
                    flushTableBuffer();
                    processedLines.push(line);
                }
            }
            flushTableBuffer();

            content = processedLines.join('\n');
        }

        return (
            <div className={`w-full h-auto ${proseClass}`}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeRaw]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    }

    if (data.type === 'image') {
        return (
            <div className="w-full h-auto flex items-start justify-center">
                <img src={imageUrl} alt={alt} className="max-w-full h-auto object-contain" />
            </div>
        );
    }

    return null;
};

export default function PrintLayout({ files, title, passageTitleEn, passageTitleJa }) {
    return (
        <div className="bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* Page 1: Problem and Question */}
            {(files.problem || files.question) && (
                <PrintPage>
                    <div className="flex flex-col gap-8 h-auto">
                        <div className="flex flex-col items-center border-b-2 border-gray-800 pb-4 mb-4">
                            {title && (
                                <h1 className="text-xl font-bold mb-2">
                                    {title}
                                </h1>
                            )}
                            {passageTitleEn && (
                                <h2 className="text-2xl font-serif font-bold italic mb-1">
                                    {passageTitleEn}
                                </h2>
                            )}
                            {passageTitleJa && (
                                <h3 className="text-lg font-medium text-gray-700">
                                    {passageTitleJa}
                                </h3>
                            )}
                        </div>
                        {files.problem && (
                            <div className="relative w-full">
                                <ContentBlock data={files.problem} alt="Problem" />
                            </div>
                        )}
                        {files.question && (
                            <div className="relative w-full">
                                <ContentBlock data={files.question} alt="Question" />
                            </div>
                        )}
                    </div>
                </PrintPage>
            )}



            {/* Page Break and Explanation/Model Answers */}
            {files.explanation && (
                <div className="break-before-page print:break-before-page">
                    <PrintPage>
                        <div className="h-auto">
                            <h2 className="text-lg font-bold border-b border-gray-800 pb-2 mb-4">Model Answers</h2>
                            <ContentBlock data={files.explanation} alt="Model Answers" />
                        </div>
                    </PrintPage>
                </div>
            )}
        </div>
    );
}
