import React, { useEffect, useState } from 'react';
import { Search, FileText, Calendar, BookOpen, Trash2, Edit, Languages } from 'lucide-react';
import { getAllProblems, deleteProblem } from '../utils/db';

const ProblemList = ({ onSelect, onRegisterNew, onEdit, onShowInstructor }) => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProblems = async () => {
        try {
            const data = await getAllProblems();
            setProblems(data);
        } catch (error) {
            console.error('Failed to fetch problems:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                // Check if we already have data
                const existing = await getAllProblems();
                if (existing.length === 0) {
                    console.log('Database empty. Attempting to load initial data...');
                    const { syncWithRepo } = await import('../utils/db');
                    await syncWithRepo();
                }
            } catch (e) {
                console.error('Initialization failed:', e);
            }
            // Always fetch problems to update state (either existing or newly synced)
            fetchProblems();
        };
        init();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await deleteProblem(id);
                fetchProblems();
            } catch (error) {
                console.error('Failed to delete problem:', error);
            }
        }
    };

    const normalizeText = (text) => {
        if (!text) return '';
        // Convert full-width numbers to half-width
        return text.replace(/[０-９]/g, (s) => {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        }).toLowerCase();
    };

    const filteredProblems = problems.filter(problem => {
        const term = normalizeText(searchTerm);
        return normalizeText(problem.title).includes(term) ||
            normalizeText(problem.subject).includes(term);
    });

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading problems...</div>;
    }

    const handleCardClick = (problem) => {
        // Open print layout in a new tab
        const url = `${window.location.pathname}?mode=print&id=${problem.id}`;
        window.open(url, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => window.open('/ReadMeFiest.html', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md whitespace-nowrap font-bold"
                >
                    <FileText className="w-5 h-5" />
                    Read Me First
                </button>
                <button
                    onClick={() => window.open('/講師の皆様へ.pdf', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md whitespace-nowrap font-bold"
                >
                    <BookOpen className="w-5 h-5" />
                    講師の皆様へ
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProblems.map((problem) => (
                    <div
                        key={problem.id}
                        onClick={() => handleCardClick(problem)}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow group relative flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 pr-2 leading-tight">
                                {problem.title}
                            </h3>
                            <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onShowInstructor(problem); }}
                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                    title="Instructor View"
                                >
                                    <Languages className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(problem); }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(e, problem.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1">
                            {(problem.passageTitleEn || problem.passageTitleJa) && (
                                <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                    {problem.passageTitleEn && (
                                        <div className="font-serif italic text-gray-800 mb-0.5 leading-snug">
                                            {problem.passageTitleEn}
                                        </div>
                                    )}
                                    {problem.passageTitleJa && (
                                        <div className="text-gray-500 text-xs">
                                            {problem.passageTitleJa}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-2">
                                {problem.subject && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <BookOpen className="w-3 h-3 mr-1" />
                                        {problem.subject}
                                    </span>
                                )}
                                {(problem.year || problem.month) && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {problem.year}{problem.month ? `/${problem.month}` : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 flex justify-between items-end">
                            <span>Added: {new Date(problem.createdAt).toLocaleDateString()}</span>
                            <div className="text-right">
                                {problem.author && (
                                    <div className="font-medium text-gray-600">Author: {problem.author}</div>
                                )}
                                {problem.source && (
                                    <div>Source: {problem.source}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProblems.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">No problems found. Click "Register New" to add one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProblemList;
