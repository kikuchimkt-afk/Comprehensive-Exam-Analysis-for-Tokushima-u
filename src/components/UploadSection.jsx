import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, FileText, Type, Image as ImageIcon } from 'lucide-react';

const UploadSlot = ({ label, data, onUpload, onClear, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [textValue, setTextValue] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (data && data.type === 'text') {
            setTextValue(data.content);
        }
    }, [data]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditing]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpload({ type: 'image', content: file });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            onUpload({ type: 'image', content: file });
        }
    };

    const handlePaste = (e) => {
        if (isEditing) return; // Allow normal paste in textarea

        const clipboardData = e.clipboardData;
        if (clipboardData.files.length > 0) {
            e.preventDefault();
            const file = clipboardData.files[0];
            onUpload({ type: 'image', content: file });
        } else {
            const text = clipboardData.getData('text');
            if (text) {
                e.preventDefault();
                onUpload({ type: 'text', content: text });
            }
        }
    };

    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleContainerClick = (e) => {
        if (!isEditing && !data) {
            e.currentTarget.focus();
        }
    };

    const triggerFileInput = (e) => {
        e.stopPropagation();
        document.getElementById(id).click();
    };

    const handleTextSave = () => {
        setIsEditing(false);
        if (textValue.trim()) {
            onUpload({ type: 'text', content: textValue });
        } else {
            onClear();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-700">{label}</span>
            <div
                className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
          ${data ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                onDragEnter={preventDefaults}
                onDragOver={preventDefaults}
                onDragLeave={preventDefaults}
                onDrop={handleDrop}
                onPaste={handlePaste}
                onClick={handleContainerClick}
                tabIndex={isEditing ? -1 : 0}
            >
                {data ? (
                    <div className="flex flex-col items-center p-4 text-center w-full h-full justify-center relative">
                        {data.type === 'image' ? (
                            <>
                                <FileText className="w-10 h-10 text-green-500 mb-2" />
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{data.content.name || 'Image File'}</p>
                            </>
                        ) : (
                            isEditing ? (
                                <textarea
                                    ref={textareaRef}
                                    value={textValue}
                                    onChange={(e) => setTextValue(e.target.value)}
                                    onBlur={handleTextSave}
                                    className="w-full h-full p-2 text-xs font-mono border-none bg-white resize-none focus:ring-0"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col items-center justify-center cursor-text group"
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                >
                                    <Type className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                                    <div className="w-full max-h-[100px] overflow-hidden text-left bg-white p-2 rounded border border-gray-200 group-hover:border-indigo-300 transition-colors">
                                        <p className="text-xs font-mono text-gray-600 break-words whitespace-pre-wrap line-clamp-4">
                                            {data.content}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">Click text to edit</p>
                                    <p className="text-xs text-gray-500">{data.content.length} characters</p>
                                </div>
                            )
                        )}
                        {!isEditing && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onClear(); }}
                                className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200 z-10"
                                title="Remove"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click here to Focus & Paste</span></p>
                            <p className="text-[10px] text-gray-400 mt-1 mb-2">(Ctrl+V to paste image or text)</p>
                        </div>

                        <button
                            onClick={triggerFileInput}
                            className="mt-2 px-4 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-10 flex items-center gap-2"
                        >
                            <ImageIcon className="w-4 h-4" />
                            Select File
                        </button>

                        <input
                            id={id}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default function UploadSection({ files, setFiles }) {
    const updateFile = (key, data) => {
        setFiles(prev => ({ ...prev, [key]: data }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <UploadSlot
                id="problem"
                label="問題 (Problem)"
                data={files.problem}
                onUpload={(d) => updateFile('problem', d)}
                onClear={() => updateFile('problem', null)}
            />
            <UploadSlot
                id="question"
                label="設問 (Question)"
                data={files.question}
                onUpload={(d) => updateFile('question', d)}
                onClear={() => updateFile('question', null)}
            />
            <UploadSlot
                id="explanation"
                label="解説 (Explanation)"
                data={files.explanation}
                onUpload={(d) => updateFile('explanation', d)}
                onClear={() => updateFile('explanation', null)}
            />

            <div className="md:col-span-2 border-t border-gray-100 my-4"></div>

            <UploadSlot
                id="translation"
                label="本文全訳 (Full Translation)"
                data={files.translation}
                onUpload={(d) => updateFile('translation', d)}
                onClear={() => updateFile('translation', null)}
            />
            <UploadSlot
                id="summary"
                label="要約 (Summary)"
                data={files.summary}
                onUpload={(d) => updateFile('summary', d)}
                onClear={() => updateFile('summary', null)}
            />
            <UploadSlot
                id="teachingPoints"
                label="指導のポイント (Teaching Points)"
                data={files.teachingPoints}
                onUpload={(d) => updateFile('teachingPoints', d)}
                onClear={() => updateFile('teachingPoints', null)}
            />
        </div>
    );
}
