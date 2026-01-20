import React from 'react';
import { X, Languages, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const InstructorModal = ({ problem, onClose }) => {
    if (!problem) return null;

    const renderContent = (content) => {
        if (!content) return <p className="text-gray-400 italic">No content available.</p>;

        if (content.type === 'image') {
            const imageUrl = typeof content.content === 'string'
                ? content.content
                : URL.createObjectURL(content.content);
            return (
                <div className="w-full flex justify-center bg-gray-50 rounded-lg p-2">
                    <img src={imageUrl} alt="Content" className="max-w-full h-auto object-contain max-h-[400px]" />
                </div>
            );
        }

        return (
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {content.content}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Languages className="w-6 h-6 text-indigo-600" />
                            Instructor View
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">{problem.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8">
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Languages className="w-5 h-5 text-green-600" />
                            Full Translation (本文全訳)
                        </h3>
                        {renderContent(problem.translationContent)}
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-600" />
                            Summary (要約)
                        </h3>
                        {renderContent(problem.summaryContent)}
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Teaching Points (指導のポイント)
                        </h3>
                        {renderContent(problem.teachingPointsContent)}
                    </section>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructorModal;
