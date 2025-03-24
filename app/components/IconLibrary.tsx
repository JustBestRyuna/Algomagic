import React from 'react';
import * as Md from 'react-icons/md'; // Material Icons
import * as Hi from 'react-icons/hi'; // Heroicons
import * as Si from 'react-icons/si'; // Simple Icons (브랜드 아이콘)

// 아이콘 ID와 실제 컴포넌트 매핑
const iconComponents: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'home': Hi.HiHome,
  'output': Md.MdOutlineOutput,
  'arithmetic': Md.MdCalculate,
  'conditional': Hi.HiLightningBolt,
  'loop': Hi.HiRefresh,
  'string': Md.MdTextFields,
  'array': Md.MdGridOn,
  'chevron-right': Hi.HiChevronRight,
  'chevron-left': Hi.HiChevronLeft,
  'advanced-io': Md.MdCloudUpload,
  'implementation': Hi.HiPuzzle,
  'simulation': Hi.HiCube,
  'condition-branching': Hi.HiSwitchHorizontal,
  'check': Hi.HiCheck,
  'code': Hi.HiCode,
  'arrow-right': Hi.HiArrowRight,
  'academic-cap': Hi.HiAcademicCap,
  'sparkles': Hi.HiSparkles,
  'cursor-click': Hi.HiCursorClick,
  'light-bulb': Hi.HiLightBulb,
  'eye': Hi.HiEye,
  'eye-off': Hi.HiEyeOff,
  'external-link': Hi.HiExternalLink,
  'menu': Hi.HiMenu,
  'python': Si.SiPython,
  'cpp': Si.SiCplusplus,
  // 다른 아이콘들도 계속 추가
};

interface IconProps {
  iconId: string;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ iconId, className = "w-6 h-6", style }) => {
  const IconComponent = iconComponents[iconId];
  
  if (!IconComponent) {
    console.warn(`Icon with id "${iconId}" not found in the icon library.`);
    return null;
  }
  
  return <IconComponent className={className} style={style} />;
};

export default Icon; 