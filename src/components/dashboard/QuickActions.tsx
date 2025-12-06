"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  onActionClick,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
    {actions.map((action) => (
      <div
        key={action.id}
        onClick={() => onActionClick && onActionClick(action)}
        className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${action.bgColor}`}>
              <action.icon className={`w-6 h-6 ${action.iconColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400 rotate-[-90deg] group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    ))}
  </div>
);

export default QuickActions;
