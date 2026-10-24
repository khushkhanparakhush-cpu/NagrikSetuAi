import React from 'react';
import { PROJECT_START_DISPLAY } from '../config/projectConfig';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReportNotification: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectReportNotification,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Workspace Initialized & Data Reset',
      time: 'Today',
      desc: `Platform reset clean as of ${PROJECT_START_DISPLAY}. Ready for live citizen report ingestion.`,
      severity: 'INFO',
      unread: false,
    },
    {
      id: 'notif-2',
      title: 'Firestore Sync Active',
      time: 'Active',
      desc: 'Realtime database listeners active for citizen voice and text reporting ledger.',
      severity: 'NORMAL',
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-[calc(100vw-24px)] sm:max-w-sm bg-[#ffffff] h-full shadow-2xl border-l border-[#e2e2e6] flex flex-col justify-between p-4 sm:p-5 space-y-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-[#e2e2e6]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#356ae6] text-[20px]">notifications</span>
              <h2 className="font-sans text-base font-semibold text-[#1a1c1f]">
                System & Telemetry Alerts
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#737685] hover:text-[#1a1c1f] rounded-lg transition-colors"
              aria-label="Close notifications drawer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectReportNotification();
                }}
                className={`p-3 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                  item.unread
                    ? 'bg-[#ebf0ff] border-[#356ae6]/30 text-[#1a1c1f]'
                    : 'bg-[#f7f6f2] border-[#e5e7eb] text-[#15171A]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold">{item.title}</span>
                  <span className="font-mono text-[10px] text-[#737685]">{item.time}</span>
                </div>
                <p className="font-sans text-xs text-[#52555a] leading-relaxed">{item.desc}</p>
                <div className="pt-1 flex items-center justify-between">
                  <span
                    className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      item.severity === 'CRITICAL'
                        ? 'bg-[#fee2e2] text-[#dc2626]'
                        : item.severity === 'INFO'
                        ? 'bg-[#ebf0ff] text-[#356ae6]'
                        : 'bg-[#f0fdf4] text-[#15803d]'
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[#e2e2e6]">
          <button
            onClick={() => {
              onClose();
              onSelectReportNotification();
            }}
            className="w-full py-2.5 min-h-[44px] bg-[#356ae6] hover:bg-[#2b58c7] text-white rounded-xl font-sans text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">mic</span>
            <span>Report Civic Grievance</span>
          </button>
        </div>
      </div>
    </div>
  );
};
