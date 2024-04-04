import { cn } from "@/utils/cn";
import { useTimeout } from "@mantine/hooks";
import { useSpring, config, animated } from "@react-spring/web";
import { IconLoader2 } from "@tabler/icons-react";
import { useDrag } from "@use-gesture/react";
import { type ReactNode, useState, useEffect } from "react";

interface PullToRefreshProps {
  children: ReactNode;
  onEnd: () => void;
  threshold?: number;
}

function PullToRefresh(props: PullToRefreshProps) {
  const { children, threshold = 128, onEnd } = props;
  const [{ y }, api] = useSpring<{ y: number }>(() => ({ y: 0 }));
  const [dragging, setDragging] = useState(false);
  const [forceDragging, setForceDragging] = useState(true);
  const { start } = useTimeout(() => {
    setForceDragging(false);
  }, 1000);

  const open = () => {
    api.start({
      y: 0,
      immediate: false,
      config: config.stiff,
    });
  };

  const bind = useDrag(
    ({ last, movement: [, my] }) => {
      if (last) {
        open();
        if (my > threshold) {
          onEnd();
          setForceDragging(true);
          start();
        }
      } else {
        api.start({ y: Math.sqrt(my * 2) * 4, immediate: true });
      }
      setDragging(!last && my > threshold);
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: 0 },
      threshold: 20,
      rubberband: true,
    },
  );
  const drag = dragging || forceDragging;

  const yValue = y.to((py) => py + 8);
  const opacityValue = y.to((py) => (drag ? 1 : (py - 20) / 128));

  return (
    <div className="relative flex h-full flex-col">
      <animated.div
        style={{ height: yValue, opacity: opacityValue }}
        className="-translate-x-1/2 absolute top-3 left-1/2"
      >
        <IconLoader2 size={32} className={cn(drag && "animate-spin")} />
      </animated.div>
      <animated.div style={{ y }} {...bind()} className="z-10 touch-none">
        {children}
      </animated.div>
    </div>
  );
}

export default PullToRefresh;
