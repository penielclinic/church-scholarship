export default function AuditReportPage() {
  return (
    <div className="-mx-4 -my-8" style={{ height: 'calc(100vh - 73px)' }}>
      <iframe
        src="/api/audit/report-html"
        className="w-full h-full border-0"
        title="장학위원회 자체 감사 보고서"
      />
    </div>
  )
}
