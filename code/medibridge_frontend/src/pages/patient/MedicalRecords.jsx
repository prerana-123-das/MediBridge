import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileText, Eye, Download, Upload, Trash, X, FileImage, File } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { patientNav } from './patientNav'
import { fetchRecords, uploadRecordThunk, deleteRecord } from '../../features/records/recordsSlice'

export default function MedicalRecords() {
  const dispatch = useDispatch()
  const records = useSelector((s) => s.records.list)
  const fileInputRef = useRef(null)
  
  const [viewingRecord, setViewingRecord] = useState(null)

  useEffect(() => { dispatch(fetchRecords()) }, [dispatch])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64Str = ev.target.result
      
      const newRecord = {
        reportName: file.name,
        reportType: file.type.includes('image') ? 'Image' : file.type.includes('pdf') ? 'PDF Document' : 'Document',
        reportDataUrl: base64Str,
        fileSize: (file.size / 1024 / 1024).toFixed(1) + ' MB'
      }

      dispatch(uploadRecordThunk(newRecord))
    }
    reader.readAsDataURL(file)
    e.target.value = '' // reset input
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      dispatch(deleteRecord(id))
    }
  }

  const handleDownload = (record) => {
    const fileUrl = record.reportDataUrl || record.fileUrl
    const rName = record.reportName || record.report_name
    const rType = record.reportType || record.report_type
    const rDate = record.uploadDate ? new Date(record.uploadDate).toLocaleDateString() : record.upload_date

    if (fileUrl && fileUrl.startsWith('data:')) {
      // It's a real uploaded file
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = rName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Mock record download
      const element = document.createElement("a");
      const file = new Blob([`Mock contents for ${rName}\nType: ${rType}\nDate: ${rDate}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${rName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }

  const handleView = (record) => {
    setViewingRecord(record)
  }

  return (
    <DashboardLayout navItems={patientNav}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="fw-bolder mb-1" style={{ color: '#0f172a', fontSize: '1.875rem' }}>Medical Records</h1>
          <p className="text-secondary m-0">Manage your medical documents and reports</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="d-none" 
          onChange={handleFileChange} 
          accept="image/*,.pdf,.doc,.docx"
        />
        <button 
          onClick={handleUploadClick}
          className="btn btn-primary d-flex align-items-center gap-2 rounded-3 fw-bold border border-2"
          style={{ backgroundColor: '#2563EB', borderColor: '#1d4ed8' }}
        >
          <Upload size={16} /> Upload New
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4" style={{ backgroundColor: '#fff' }}>
        <div className="d-flex flex-column gap-3">
          {records.length === 0 ? (
            <div className="py-5 text-center text-secondary">
              No medical records found. Upload a new document to get started.
            </div>
          ) : (
            records.map((r) => {
              const rId = r.reportId || r.report_id
              const rName = r.reportName || r.report_name
              const rType = r.reportType || r.report_type
              const rDate = r.uploadDate ? new Date(r.uploadDate).toLocaleDateString() : r.upload_date
              const rSize = r.fileSize || r.size

              return (
              <div key={rId} className="d-flex align-items-center justify-content-between rounded-3 p-3 bg-white border" style={{ borderColor: '#f1f5f9', transition: 'all 0.2s' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                    {rType === 'Image' ? <FileImage size={22} /> : <FileText size={22} />}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: '#1e293b' }}>{rName}</div>
                    <div className="d-flex align-items-center gap-2 small mt-1" style={{ color: '#64748b' }}>
                      <span className="badge rounded-2" style={{ color: '#2563eb', backgroundColor: '#eff6ff' }}>{rType}</span>
                      <span>•</span>
                      <span>{rDate}</span>
                      <span>•</span>
                      <span>{rSize}</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button onClick={() => handleView(r)} className="btn btn-sm d-flex align-items-center justify-content-center rounded-3 border border-2" style={{ width: '36px', height: '36px', color: '#2563eb', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }} title="View Document">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => handleDownload(r)} className="btn btn-sm d-flex align-items-center justify-content-center rounded-3 border border-2" style={{ width: '36px', height: '36px', color: '#16a34a', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }} title="Download">
                    <Download size={18} />
                  </button>
                  <button onClick={() => handleDelete(rId)} className="btn btn-sm d-flex align-items-center justify-content-center rounded-3 border border-2" style={{ width: '36px', height: '36px', color: '#ef4444', backgroundColor: '#fef2f2', borderColor: '#fecaca' }} title="Delete">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            )})
          )}
        </div>
      </div>

      {/* View Modal */}
      {viewingRecord && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1050, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-100 bg-white rounded-4 shadow-lg d-flex flex-column" style={{ maxWidth: '768px', maxHeight: '90vh' }}>
            <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  <File size={20} />
                </div>
                <div>
                  <h3 className="h6 fw-bold m-0" style={{ color: '#0f172a' }}>{viewingRecord.report_name}</h3>
                  <p className="small m-0" style={{ color: '#64748b' }}>{viewingRecord.report_type} • {viewingRecord.upload_date}</p>
                </div>
              </div>
              <button onClick={() => setViewingRecord(null)} className="btn btn-sm border-0" style={{ color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow-1 overflow-auto p-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8fafc', minHeight: '400px' }}>
              {(viewingRecord.reportDataUrl || viewingRecord.fileUrl) && (viewingRecord.reportType || viewingRecord.report_type) === 'Image' ? (
                <img src={viewingRecord.reportDataUrl || viewingRecord.fileUrl} alt={viewingRecord.reportName || viewingRecord.report_name} className="img-fluid rounded-3 shadow-sm" style={{ maxHeight: '100%' }} />
              ) : (viewingRecord.reportDataUrl || viewingRecord.fileUrl) && (viewingRecord.reportType || viewingRecord.report_type) === 'PDF Document' ? (
                <iframe src={viewingRecord.reportDataUrl || viewingRecord.fileUrl} className="w-100 h-100 rounded-3 border" style={{ borderColor: '#e2e8f0' }} title={viewingRecord.reportName || viewingRecord.report_name} />
              ) : (
                <div className="text-center">
                  <FileText size={64} className="mx-auto mb-3" style={{ color: '#cbd5e1' }} />
                  <p className="h5 fw-semibold mb-1" style={{ color: '#334155' }}>Preview not available</p>
                  <p className="small mb-4" style={{ color: '#64748b' }}>This document format cannot be previewed in the browser.</p>
                  <button 
                    onClick={() => handleDownload(viewingRecord)}
                    className="btn btn-primary d-inline-flex align-items-center gap-2 rounded-3 fw-bold border border-2"
                    style={{ backgroundColor: '#2563EB', borderColor: '#1d4ed8' }}
                  >
                    <Download size={16} /> Download to view
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

