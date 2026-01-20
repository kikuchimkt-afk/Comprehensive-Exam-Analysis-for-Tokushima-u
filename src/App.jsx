import React, { useState, useRef } from 'react';
import { Printer, Upload, Layout, List, Plus } from 'lucide-react';
import UploadSection from './components/UploadSection';
import PrintLayout from './components/PrintLayout';
import ProblemList from './components/ProblemList';
import ProblemRegister from './components/ProblemRegister';
import InstructorModal from './components/InstructorModal';
import { getProblem } from './utils/db'; // Import this
import { useReactToPrint } from 'react-to-print';

function App() {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'register', 'editor', 'print_only'
  // ... (keep existing state)

  // Handle URL parameters for direct print view
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const id = params.get('id');

    if (mode === 'print' && id) {
      const loadProblem = async () => {
        try {
          const problem = await getProblem(parseInt(id));
          if (problem) {
            setFiles({
              problem: problem.problemContent,
              question: problem.questionContent,
              explanation: problem.explanationContent,
              translation: problem.translationContent,
              summary: problem.summaryContent,
              teachingPoints: problem.teachingPointsContent
            });
            setCurrentProblemTitle(problem.title);
            setPassageTitleEn(problem.passageTitleEn || '');
            setPassageTitleJa(problem.passageTitleJa || '');
            setViewMode('print_only'); // Special mode for just print layout
            setIsPreview(true);

            // Clear URL params so reload goes back to top page
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error("Failed to load problem for print:", error);
        }
      };
      loadProblem();
    }
  }, []);

  // ... existing handlers ...
  const [files, setFiles] = useState({
    problem: null,
    question: null,
    explanation: null,
    translation: null,
    summary: null,
    teachingPoints: null,
  });
  const [currentProblemTitle, setCurrentProblemTitle] = useState('');
  const [passageTitleEn, setPassageTitleEn] = useState('');
  const [passageTitleJa, setPassageTitleJa] = useState('');

  // New State for Edit and Instructor View
  const [editingProblem, setEditingProblem] = useState(null);
  const [instructorViewProblem, setInstructorViewProblem] = useState(null);

  const [isPreview, setIsPreview] = useState(false);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: currentProblemTitle || 'Exam Paper',
  });

  const handleProblemSelect = (problem) => {
    setFiles({
      problem: problem.problemContent,
      question: problem.questionContent,
      explanation: problem.explanationContent,
      translation: problem.translationContent,
      summary: problem.summaryContent,
      teachingPoints: problem.teachingPointsContent,
    });
    setCurrentProblemTitle(problem.title);
    setPassageTitleEn(problem.passageTitleEn || '');
    setPassageTitleJa(problem.passageTitleJa || '');
    setViewMode('editor');
    setIsPreview(false);
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setViewMode('register');
  };

  const handleRegisterNew = () => {
    setEditingProblem(null);
    setViewMode('register');
  };

  const handleBackToList = () => {
    if (window.confirm('Unsaved changes will be lost. Return to list?')) {
      setViewMode('list');
      setFiles({ problem: null, question: null, explanation: null });
      setCurrentProblemTitle('');
      setEditingProblem(null);
    }
  };

  const renderContent = () => {
    if (viewMode === 'print_only') {
      return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
          <div className="mb-4 print:hidden w-full max-w-[210mm] flex justify-between items-center bg-white p-4 rounded shadow">
            <div>
              <h1 className="font-bold text-lg">{currentProblemTitle}</h1>
              <p className="text-gray-500 text-sm">Print Layout Preview</p>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
          <div ref={componentRef} className="shadow-lg print:shadow-none">
            <PrintLayout
              files={files}
              title={currentProblemTitle}
              passageTitleEn={passageTitleEn}
              passageTitleJa={passageTitleJa}
            />
          </div>
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Problem Database</h2>
          </div>
          <ProblemList
            onSelect={handleProblemSelect}
            onRegisterNew={handleRegisterNew}
            onEdit={handleEdit}
            onShowInstructor={setInstructorViewProblem}
          />
        </div>
      );
    }

    if (viewMode === 'register') {
      return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <ProblemRegister
            onCancel={() => {
              setViewMode('list');
              setEditingProblem(null);
            }}
            onSaveSuccess={() => {
              setViewMode('list');
              setEditingProblem(null);
            }}
            initialData={editingProblem}
          />
        </div>
      );
    }

    // Editor Mode
    return (
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:max-w-none">
        {isPreview ? (
          <div ref={componentRef}>
            <PrintLayout
              files={files}
              title={currentProblemTitle}
              passageTitleEn={passageTitleEn}
              passageTitleJa={passageTitleJa}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-gray-500" />
                    Edit Materials
                  </h2>
                  {currentProblemTitle && (
                    <p className="mt-1 text-sm text-indigo-600 font-medium">
                      Editing: {currentProblemTitle}
                    </p>
                  )}
                </div>
              </div>
              <UploadSection files={files} setFiles={setFiles} />
            </div>
          </div>
        )}
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('list')}>
            <Layout className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Comprehensive Exam Analysis</h1>
          </div>

          <div className="flex gap-4">
            {viewMode === 'editor' && (
              <>
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Back to List
                </button>
                <button
                  onClick={() => setIsPreview(!isPreview)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                            ${isPreview
                      ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700'
                    }`}
                >
                  {isPreview ? 'Back to Edit' : 'Preview Layout'}
                </button>

                {isPreview && (
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print / Save PDF
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {renderContent()}

      {/* Instructor Modal */}
      {instructorViewProblem && (
        <InstructorModal
          problem={instructorViewProblem}
          onClose={() => setInstructorViewProblem(null)}
        />
      )}
    </div>
  );
}

export default App;
