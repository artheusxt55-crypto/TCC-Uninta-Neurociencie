import React, { useRef, useState } from "react";
import { cn } from "../lib/utils";

export const Card3D = ({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("rotateY(0deg) rotateX(0deg)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 10;
    const y = (e.clientY - top - height / 2) / 10;
    setTransform(`rotateY(${x}deg) rotateX(${-y}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform("rotateY(0deg) rotateX(0deg)");
  };

  return (
    <div className="py-10 flex items-center justify-center [perspective:1000px]">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform }}
        className={cn(
          "w-80 rounded-xl border border-white/10 bg-slate-900 p-6 shadow-xl transition-transform duration-200 ease-out [transform-style:preserve-3d]",
          className
        )}
      >
        <div className="[transform:translateZ(40px)]">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
};
