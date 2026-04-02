import { FileText, Table2, MessageSquare } from 'lucide-react'

export const TABS = [
  { id: 'docs', label: 'Process Docs', icon: FileText, desc: 'PDF, Word, or TXT' },
  { id: 'erp', label: 'ERP Dumps', icon: Table2, desc: 'Excel or CSV data' },
  { id: 'user', label: 'Conversational Text', icon: MessageSquare, desc: 'Detailed description' },
]

export const ACCEPTED = '.pdf,.docx,.doc,.txt,.csv,.xlsx,.xls'

export const LABELS = {
  pdf: 'PDF', docx: 'DOCX', doc: 'DOCX', txt: 'TXT',
  csv: 'CSV', xlsx: 'XLSX', xls: 'XLS',
}

export function getExt(name) { return name.split('.').pop().toLowerCase() }
