import {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  FileOutput,
  ImageDown,
  ImageUp,
  Stamp,
  FileText,
  Table,
  ScanText,
  ShieldCheck,
  Zap,
  Infinity as InfinityIcon,
  ListChecks,
  FileArchive,
  Gauge,
  Clock,
  Eye,
  Undo2,
  MousePointerClick,
  FileCheck2,
  Layers,
  LayoutGrid,
  Printer,
  Globe2,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  FileOutput,
  ImageDown,
  ImageUp,
  StampIcon: Stamp,
  Stamp,
  FileText,
  Table,
  ScanText,
  ShieldCheck,
  Zap,
  Infinity: InfinityIcon,
  ListChecks,
  FileArchive,
  Gauge,
  Clock,
  Eye,
  Undo2,
  MousePointerClick,
  FileCheck2,
  Layers,
  LayoutGrid,
  Printer,
  Globe2,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

export default function DynamicIcon({
  name,
  className,
  strokeWidth,
}: DynamicIconProps) {
  const IconComponent = ICON_MAP[name] ?? FileQuestion;
  return <IconComponent className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
