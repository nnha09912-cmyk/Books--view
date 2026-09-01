/** react-pageflip ships no TypeScript declarations and there is no
 * @types/react-pageflip package — this is a minimal ambient declaration
 * covering only what AlbumBookViewer.tsx actually calls, scoped to this
 * demo module rather than a global src/types/ file since nothing else
 * in the app depends on this library. */
declare module "react-pageflip" {
  import { Component, ReactNode, CSSProperties } from "react";

  export interface PageFlipInstance {
    flipNext: () => void;
    flipPrev: () => void;
    flip: (pageNum: number) => void;
    turnToPage: (pageNum: number) => void;
    getCurrentPageIndex: () => number;
    getPageCount: () => number;
  }

  export interface HTMLFlipBookProps {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    renderOnlyPageLengthChange?: boolean;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: "portrait" | "landscape" }) => void;
    onChangeState?: (e: { data: "user_fold" | "fold_corner" | "flipping" | "read" }) => void;
  }

  export default class HTMLFlipBook extends Component<HTMLFlipBookProps> {
    pageFlip: () => PageFlipInstance;
  }
}
