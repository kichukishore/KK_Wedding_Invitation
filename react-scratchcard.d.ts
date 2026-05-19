declare module "react-scratchcard" {
  import * as React from "react";

  interface ScratchCardProps {
    width?: number;
    height?: number;
    image?: string;
    finishPercent?: number;
    onComplete?: () => void;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: unknown;
  }

  export default class ScratchCard extends React.Component<ScratchCardProps> {}
}
