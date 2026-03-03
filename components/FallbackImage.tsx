import { 
  AlertTriangle, 
  Cross, 
  HeartHandshake, 
  Globe, 
  Smile, 
  Leaf, 
  Utensils, 
  BookOpen, 
  Palette, 
  Box 
} from 'lucide-react';

interface FallbackImageProps {
  category?: string;
  className?: string;
  iconSize?: number;
}

export default function FallbackImage({ category, className = "", iconSize = 32 }: FallbackImageProps) {
  // 카테고리별 설정 (배경 그라데이션 및 아이콘)
  const getCategoryConfig = (cat?: string) => {
    switch (cat) {
      case '긴급재난구호':
        return { bg: 'bg-gradient-to-br from-red-400 to-red-600', Icon: AlertTriangle, color: 'text-white' };
      case '의료':
        return { bg: 'bg-gradient-to-br from-rose-400 to-red-500', Icon: Cross, color: 'text-white' };
      case '노인돌봄':
        return { bg: 'bg-gradient-to-br from-orange-400 to-amber-500', Icon: HeartHandshake, color: 'text-white' };
      case '이주민':
        return { bg: 'bg-gradient-to-br from-teal-400 to-emerald-500', Icon: Globe, color: 'text-white' };
      case '청소년':
        return { bg: 'bg-gradient-to-br from-blue-400 to-indigo-500', Icon: Smile, color: 'text-white' };
      case '환경':
        return { bg: 'bg-gradient-to-br from-green-400 to-emerald-600', Icon: Leaf, color: 'text-white' };
      case '어린이 밥상':
        return { bg: 'bg-gradient-to-br from-yellow-300 to-amber-500', Icon: Utensils, color: 'text-amber-900' };
      case '인문학':
        return { bg: 'bg-gradient-to-br from-purple-400 to-fuchsia-500', Icon: BookOpen, color: 'text-white' };
      case '예술':
        return { bg: 'bg-gradient-to-br from-pink-400 to-rose-500', Icon: Palette, color: 'text-white' };
      default:
        return { bg: 'bg-gradient-to-br from-gray-300 to-gray-500', Icon: Box, color: 'text-white' };
    }
  };

  const { bg, Icon, color } = getCategoryConfig(category);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center ${bg} ${className}`}>
      <Icon size={iconSize} className={`${color} mb-2`} strokeWidth={1.5} />
      {category && (
        <span className={`text-[10px] sm:text-xs font-semibold px-2 text-center opacity-90 ${color}`}>
          {category}
        </span>
      )}
    </div>
  );
}
