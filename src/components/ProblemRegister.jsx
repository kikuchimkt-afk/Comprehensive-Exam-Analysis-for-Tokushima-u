import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, RefreshCw } from 'lucide-react';
import UploadSection from './UploadSection';
import { addProblem, updateProblem } from '../utils/db';

const ProblemRegister = ({ onCancel, onSaveSuccess, initialData = null }) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [author, setAuthor] = useState('');
    const [source, setSource] = useState('');
    const [passageTitleEn, setPassageTitleEn] = useState('');
    const [passageTitleJa, setPassageTitleJa] = useState('');
    const [files, setFiles] = useState({
        problem: null,
        question: null,
        explanation: null,
        translation: null,
        summary: null,
        teachingPoints: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setSubject(initialData.subject || '');
            setYear(initialData.year || '');
            setMonth(initialData.month || '');
            setAuthor(initialData.author || '');
            setSource(initialData.source || '');
            setFiles({
                problem: initialData.problemContent || null,
                question: initialData.questionContent || null,
                explanation: initialData.explanationContent || null,
                translation: initialData.translationContent || null,
                summary: initialData.summaryContent || null,
                teachingPoints: initialData.teachingPointsContent || null,
            });
        }
    }, [initialData]);

    useEffect(() => {
        const problemData = files.problem;
        if (problemData && problemData.type === 'text' && problemData.content && !passageTitleEn) {
            const lines = problemData.content.split('\n');
            const firstLine = lines.find(line => line.trim().length > 0);
            if (firstLine) {
                setPassageTitleEn(firstLine.trim());
            }
        }
    }, [files.problem, passageTitleEn]);

    useEffect(() => {
        const translationData = files.translation;
        if (translationData && translationData.type === 'text' && translationData.content && !passageTitleJa) {
            const lines = translationData.content.split('\n');
            const firstLine = lines.find(line => line.trim().length > 0);
            if (firstLine) {
                setPassageTitleJa(firstLine.trim());
            }
        }
    }, [files.translation, passageTitleJa]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title) {
            alert('Please enter a title');
            return;
        }

        setIsSubmitting(true);
        try {
            const problemData = {
                title,
                subject,
                year,
                month,
                author,
                source,
                problemContent: files.problem,
                questionContent: files.question,
                explanationContent: files.explanation,
                translationContent: files.translation,
                summaryContent: files.summary,
                teachingPointsContent: files.teachingPoints,
                passageTitleEn,
                passageTitleJa
            };

            if (initialData && initialData.id) {
                await updateProblem(initialData.id, problemData);
            } else {
                await addProblem(problemData);
            }
            onSaveSuccess();
        } catch (error) {
            console.error('Failed to save problem:', error);
            alert('Failed to save problem. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onCancel}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to List
                </button>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Problem' : 'Register New Problem'}
                    </h2>
                    {initialData && <p className="text-sm text-gray-500">Updating existing record</p>}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title (タイトル)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g. 2024 Math Final Q1"
                                required
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author (作成者)</label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Name"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Source (引用元)</label>
                            <input
                                type="text"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Source info"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passage Title (English)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={passageTitleEn}
                                    onChange={(e) => setPassageTitleEn(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                                    placeholder="Auto-extracted from first line"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const problemData = files.problem;
                                        if (problemData && problemData.type === 'text' && problemData.content) {
                                            const lines = problemData.content.split('\n');
                                            const firstLine = lines.find(line => line.trim().length > 0);
                                            if (firstLine) setPassageTitleEn(firstLine.trim());
                                        }
                                    }}
                                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium whitespace-nowrap"
                                    title="Auto-fill from content"
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passage Title (Japanese)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={passageTitleJa}
                                    onChange={(e) => setPassageTitleJa(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
                                    placeholder="Auto-extracted from translation"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const translationData = files.translation;
                                        if (translationData && translationData.type === 'text' && translationData.content) {
                                            const lines = translationData.content.split('\n');
                                            const firstLine = lines.find(line => line.trim().length > 0);
                                            if (firstLine) setPassageTitleJa(firstLine.trim());
                                        }
                                    }}
                                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium whitespace-nowrap"
                                    title="Auto-fill from content"
                                >
                                    Auto
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject (科目)</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g. Mathematics"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year (年度)</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month (月)</label>
                                <input
                                    type="number"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Problem Content</h3>
                    </div>
                    <UploadSection files={files} setFiles={setFiles} />
                </div>

                {/* Specific Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 shadow-lg print:hidden">
                    <p className="text-sm text-gray-500">Current mode: {initialData ? 'Editing' : 'Creating'}</p>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium shadow-md transition-colors ${initialData
                                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                } disabled:opacity-50`}
                        >
                            {initialData ? (
                                <>
                                    <RefreshCw className="w-5 h-5" />
                                    {isSubmitting ? 'Updating...' : 'Update Problem'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {isSubmitting ? 'Saving...' : 'Save Problem'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="h-20"></div> {/* Spacer for fixed footer */}
            </form>
        </div>
    );
};

export default ProblemRegister;
