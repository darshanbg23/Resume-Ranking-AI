import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle, Schedule, HourglassEmpty, Cancel, EventAvailable, Verified, FiberManualRecord } from '@mui/icons-material';
const config = {
    applied: { label: 'Applied', className: 'badge-applied', icon: FiberManualRecord },
    under_review: { label: 'Under Review', className: 'badge-under-review', icon: HourglassEmpty },
    shortlisted: { label: 'Shortlisted', className: 'badge-shortlisted', icon: CheckCircle },
    rejected: { label: 'Rejected', className: 'badge-rejected', icon: Cancel },
    interview_scheduled: { label: 'Interview', className: 'badge-interview', icon: EventAvailable },
    hired: { label: 'Hired', className: 'badge-hired', icon: Verified },
    active: { label: 'Active', className: 'badge-active', icon: FiberManualRecord },
    closed: { label: 'Closed', className: 'badge-closed', icon: Cancel },
    draft: { label: 'Draft', className: 'badge-draft', icon: Schedule },
    scheduled: { label: 'Scheduled', className: 'badge-interview', icon: Schedule },
    completed: { label: 'Completed', className: 'badge-hired', icon: CheckCircle },
    cancelled: { label: 'Cancelled', className: 'badge-rejected', icon: Cancel },
    rescheduled: { label: 'Rescheduled', className: 'badge-under-review', icon: Schedule },
    pending: { label: 'Pending', className: 'badge-under-review', icon: HourglassEmpty },
    processing: { label: 'Processing', className: 'badge-applied', icon: HourglassEmpty },
    processed: { label: 'Processed', className: 'badge-hired', icon: CheckCircle },
    failed: { label: 'Failed', className: 'badge-rejected', icon: Cancel },
    excellent: { label: 'Excellent', className: 'badge-hired', icon: Verified },
    good: { label: 'Good', className: 'badge-interview', icon: CheckCircle },
    average: { label: 'Average', className: 'badge-under-review', icon: FiberManualRecord },
    poor: { label: 'Poor', className: 'badge-rejected', icon: Cancel },
};
export const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
    const cfg = config[status] || { label: status, className: 'badge-applied', icon: FiberManualRecord };
    const Icon = cfg.icon;
    const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-px' : 'text-xs px-2.5 py-0.5';
    return (_jsxs("span", { className: `badge ${cfg.className} ${sizeClass}`, children: [showIcon && _jsx(Icon, { style: { fontSize: size === 'sm' ? 10 : 12 } }), cfg.label] }));
};
export default StatusBadge;
