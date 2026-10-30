import React, { useState } from 'react';
import { FolderLock, Search, Download, FileText, Upload, Calendar, Building2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const RecordsVaultView: React.FC = () => {
  const { documents, buildings } = useData();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'ALL' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!doc.fileName.toLowerCase().includes(q) && !doc.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <FolderLock className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Central Institutional Records Vault
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            As-built civil structural drawings, certified test certificates, NDT diagnostic reports, and handover documents
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search document title, drawing number, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium"
        >
          <option value="ALL">All Vault Categories</option>
          <option value="Structural Drawings">Structural Drawings</option>
          <option value="Inspection Reports">Inspection Reports</option>
          <option value="NDT Diagnostic Reports">NDT Diagnostic Reports</option>
          <option value="Material Test Certificates">Material Test Certificates</option>
          <option value="Handover Documents">Handover Documents</option>
        </select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const bld = buildings.find((b) => b.id === doc.buildingId);
          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all text-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {doc.category}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">{doc.fileSize}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900">{doc.fileName}</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Asset: {bld?.name || doc.buildingId}</p>
                <p className="text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {doc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Uploaded by {doc.uploadedBy}</span>
                <button
                  onClick={() => alert(`Downloading verified record: ${doc.fileName}`)}
                  className="flex items-center gap-1 font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
