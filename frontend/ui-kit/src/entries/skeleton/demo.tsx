/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import {
  Skeleton,
  SkeletonChart,
  SkeletonGroup,
  SkeletonRow,
  type SkeletonAnimation,
  type SkeletonShape,
} from "./index";

export type SkAnim = Exclude<SkeletonAnimation, "none">;

export function Sk({
  w,
  h,
  shape,
  className,
}: {
  w?: string | number;
  h?: number;
  shape?: SkeletonShape;
  className?: string;
}) {
  return <Skeleton width={w} height={h} shape={shape} className={className} />;
}

export function SkGroup({
  anim,
  loading,
  label,
  children,
  className,
}: {
  anim?: SkeletonAnimation;
  loading?: boolean;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SkeletonGroup animation={anim} loading={loading} label={label} className={className}>
      {children}
    </SkeletonGroup>
  );
}

export function SkRow({ i = 0 }: { i?: number }) {
  return <SkeletonRow narrow={i === 1} />;
}

export function SkChart() {
  return <SkeletonChart />;
}
